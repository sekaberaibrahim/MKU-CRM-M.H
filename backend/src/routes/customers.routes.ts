import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireRole } from "../middleware/auth.js";
import { FRONT_DESK, MANAGEMENT } from "../rbac.js";

export const customersRouter = Router();

customersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
    res.json(customers);
  })
);

customersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { reservations: true, complaints: true, interactions: true, loyaltyTransactions: true }
    });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    return res.json(customer);
  })
);

const customerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  country: z.string().optional(),
  notes: z.string().optional()
});

customersRouter.post(
  "/",
  requireRole(...FRONT_DESK),
  asyncHandler(async (req, res) => {
    const parsed = customerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const customer = await prisma.customer.create({ data: parsed.data });
    res.status(201).json(customer);
  })
);

customersRouter.patch(
  "/:id",
  requireRole(...FRONT_DESK),
  asyncHandler(async (req, res) => {
    const parsed = customerSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const customer = await prisma.customer.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(customer);
  })
);

customersRouter.delete(
  "/:id",
  requireRole(...MANAGEMENT),
  asyncHandler(async (req, res) => {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
