import { Router } from "express";
import { ReservationSource, ReservationStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireRole } from "../middleware/auth.js";
import { FRONT_DESK } from "../rbac.js";

export const reservationsRouter = Router();
reservationsRouter.use(requireRole(...FRONT_DESK));

reservationsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const reservations = await prisma.reservation.findMany({
      include: { customer: true, room: true, invoice: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(reservations);
  })
);

const reservationSchema = z.object({
  customerId: z.string().min(5),
  roomId: z.string().min(5),
  source: z.nativeEnum(ReservationSource).optional(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  specialRequest: z.string().optional()
});

reservationsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = reservationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const data = parsed.data;
    if (new Date(data.checkOutDate) <= new Date(data.checkInDate)) {
      return res.status(400).json({ error: "Check-out date must be after check-in date" });
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerId: data.customerId,
        roomId: data.roomId,
        source: data.source ?? ReservationSource.DIRECT,
        checkInDate: new Date(data.checkInDate),
        checkOutDate: new Date(data.checkOutDate),
        adults: data.adults,
        children: data.children,
        specialRequest: data.specialRequest
      }
    });

    res.status(201).json(reservation);
  })
);

const statusSchema = z.object({ status: z.nativeEnum(ReservationStatus) });

reservationsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const updated = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status }
    });

    res.json(updated);
  })
);
