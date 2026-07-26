import { Router } from "express";
import { InvoiceStatus, PaymentMethod, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireRole } from "../middleware/auth.js";
import { FRONT_DESK } from "../rbac.js";

export const invoicesRouter = Router();
invoicesRouter.use(requireRole(...FRONT_DESK));

const TAX_RATE = 0.18;

invoicesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const invoices = await prisma.invoice.findMany({
      include: { reservation: { include: { customer: true, room: true } }, payments: true },
      orderBy: { issuedAt: "desc" }
    });
    res.json(invoices);
  })
);

const createInvoiceSchema = z.object({ reservationId: z.string().min(5) });

invoicesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: parsed.data.reservationId },
      include: { room: true, invoice: true }
    });
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    if (reservation.invoice) {
      return res.status(409).json({ error: "Reservation already has an invoice" });
    }

    const nights = Math.max(
      1,
      Math.ceil((reservation.checkOutDate.getTime() - reservation.checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const subtotal = new Prisma.Decimal(reservation.room.ratePerNight).mul(nights);
    const taxAmount = subtotal.mul(TAX_RATE);
    const totalAmount = subtotal.plus(taxAmount);

    const invoice = await prisma.invoice.create({
      data: {
        reservationId: reservation.id,
        subtotal,
        taxAmount,
        totalAmount
      },
      include: { payments: true }
    });

    res.status(201).json(invoice);
  })
);

const paymentSchema = z.object({
  method: z.nativeEnum(PaymentMethod),
  amount: z.number().positive(),
  reference: z.string().optional()
});

invoicesRouter.post(
  "/:id/payments",
  asyncHandler(async (req, res) => {
    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id }, include: { payments: true } });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const result = await prisma.$transaction(async (db) => {
      const payment = await db.payment.create({
        data: { invoiceId: invoice.id, method: parsed.data.method, amount: parsed.data.amount, reference: parsed.data.reference }
      });

      const paid = invoice.payments.reduce((sum, p) => sum.plus(p.amount), new Prisma.Decimal(0)).plus(parsed.data.amount);
      const status = paid.gte(invoice.totalAmount)
        ? InvoiceStatus.PAID
        : paid.gt(0)
          ? InvoiceStatus.PARTIALLY_PAID
          : InvoiceStatus.UNPAID;

      await db.invoice.update({ where: { id: invoice.id }, data: { status } });
      return payment;
    });

    res.status(201).json(result);
  })
);
