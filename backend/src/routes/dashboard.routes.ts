import { Router } from "express";
import { ComplaintStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/kpis",
  asyncHandler(async (_req, res) => {
    const [customers, reservations, complaintsOpen, revenue] = await Promise.all([
      prisma.customer.count(),
      prisma.reservation.count(),
      prisma.complaint.count({ where: { status: { in: [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS] } } }),
      prisma.payment.aggregate({ _sum: { amount: true } })
    ]);

    res.json({
      customers,
      reservations,
      complaintsOpen,
      revenueCollected: revenue._sum.amount ?? 0
    });
  })
);
