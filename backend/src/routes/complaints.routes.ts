import { Router } from "express";
import { ComplaintSeverity, ComplaintStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireRole } from "../middleware/auth.js";
import { FRONT_DESK } from "../rbac.js";

export const complaintsRouter = Router();
complaintsRouter.use(requireRole(...FRONT_DESK));

complaintsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const complaints = await prisma.complaint.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(complaints);
  })
);

const complaintSchema = z.object({
  customerId: z.string().min(5),
  title: z.string().min(3),
  description: z.string().min(10),
  severity: z.nativeEnum(ComplaintSeverity)
});

complaintsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = complaintSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const complaint = await prisma.complaint.create({ data: parsed.data });
    res.status(201).json(complaint);
  })
);

const updateSchema = z.object({
  status: z.nativeEnum(ComplaintStatus).optional(),
  resolutionNote: z.string().optional(),
  assignedToId: z.string().optional()
});

complaintsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const data = { ...parsed.data } as typeof parsed.data & { resolvedAt?: Date };
    if (parsed.data.status === ComplaintStatus.RESOLVED || parsed.data.status === ComplaintStatus.CLOSED) {
      data.resolvedAt = new Date();
    }

    const complaint = await prisma.complaint.update({ where: { id: req.params.id }, data });
    res.json(complaint);
  })
);
