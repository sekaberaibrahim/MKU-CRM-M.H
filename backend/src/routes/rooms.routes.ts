import { Router } from "express";
import { RoomType, RoomStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireRole } from "../middleware/auth.js";
import { FRONT_DESK, MANAGEMENT } from "../rbac.js";

export const roomsRouter = Router();
roomsRouter.use(requireRole(...FRONT_DESK));

roomsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rooms = await prisma.room.findMany({ orderBy: { roomNumber: "asc" } });
    res.json(rooms);
  })
);

const roomSchema = z.object({
  roomNumber: z.string().min(1),
  type: z.nativeEnum(RoomType),
  ratePerNight: z.number().positive(),
  status: z.nativeEnum(RoomStatus).optional()
});

roomsRouter.post(
  "/",
  requireRole(...MANAGEMENT),
  asyncHandler(async (req, res) => {
    const parsed = roomSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const room = await prisma.room.create({ data: parsed.data });
    res.status(201).json(room);
  })
);

const roomUpdateSchema = z.object({
  type: z.nativeEnum(RoomType).optional(),
  ratePerNight: z.number().positive().optional(),
  status: z.nativeEnum(RoomStatus).optional()
});

roomsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = roomUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const room = await prisma.room.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(room);
  })
);

roomsRouter.delete(
  "/:id",
  requireRole(...MANAGEMENT),
  asyncHandler(async (req, res) => {
    await prisma.room.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

roomsRouter.post(
  "/quick-seed",
  requireRole(...MANAGEMENT),
  asyncHandler(async (_req, res) => {
    const existing = await prisma.room.count();
    if (existing > 0) {
      return res.status(409).json({ error: "Rooms already seeded" });
    }

    const roomRows = Array.from({ length: 20 }).map((_, idx) => {
      const roomNumber = String(101 + idx);
      const type = idx < 8 ? RoomType.STANDARD : idx < 15 ? RoomType.DELUXE : RoomType.SUITE;
      const ratePerNight = type === RoomType.STANDARD ? 80 : type === RoomType.DELUXE ? 120 : 180;
      return { roomNumber, type, ratePerNight };
    });

    await prisma.room.createMany({ data: roomRows });
    res.status(201).json({ message: "Rooms seeded", count: roomRows.length });
  })
);
