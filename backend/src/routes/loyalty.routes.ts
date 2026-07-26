import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireRole } from "../middleware/auth.js";
import { MARKETING_TEAM } from "../rbac.js";

export const loyaltyRouter = Router();
loyaltyRouter.use(requireRole(...MARKETING_TEAM));

loyaltyRouter.get(
  "/transactions",
  asyncHandler(async (req, res) => {
    const customerId = typeof req.query.customerId === "string" ? req.query.customerId : undefined;
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: customerId ? { customerId } : undefined,
      include: { customer: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(transactions);
  })
);

const loyaltySchema = z.object({
  customerId: z.string().min(5),
  points: z.number().int(),
  reason: z.string().min(3)
});

loyaltyRouter.post(
  "/transactions",
  asyncHandler(async (req, res) => {
    const parsed = loyaltySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { customerId, points, reason } = parsed.data;
    const tx = await prisma.$transaction(async (db) => {
      const transaction = await db.loyaltyTransaction.create({
        data: { customerId, points, reason }
      });
      await db.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: points } }
      });
      return transaction;
    });

    res.status(201).json(tx);
  })
);
