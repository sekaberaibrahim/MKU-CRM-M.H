import { Router } from "express";
import { InteractionChannel } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const interactionsRouter = Router();

interactionsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const customerId = typeof req.query.customerId === "string" ? req.query.customerId : undefined;
    const interactions = await prisma.interaction.findMany({
      where: customerId ? { customerId } : undefined,
      include: { customer: true },
      orderBy: { happenedAt: "desc" }
    });
    res.json(interactions);
  })
);

const interactionSchema = z.object({
  customerId: z.string().min(5),
  channel: z.nativeEnum(InteractionChannel),
  subject: z.string().min(3),
  notes: z.string().min(3)
});

interactionsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = interactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const interaction = await prisma.interaction.create({ data: parsed.data });
    res.status(201).json(interaction);
  })
);
