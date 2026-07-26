import { Router } from "express";
import { CampaignChannel, CampaignStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireRole } from "../middleware/auth.js";
import { MARKETING_TEAM } from "../rbac.js";

export const campaignsRouter = Router();
campaignsRouter.use(requireRole(...MARKETING_TEAM));

campaignsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const campaigns = await prisma.campaign.findMany({
      include: { recipients: { include: { customer: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(campaigns);
  })
);

const campaignSchema = z.object({
  name: z.string().min(3),
  segment: z.string().min(3),
  channel: z.nativeEnum(CampaignChannel),
  message: z.string().min(5),
  customerIds: z.array(z.string().min(5)).min(1)
});

campaignsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = campaignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { customerIds, ...campaignInput } = parsed.data;
    const campaign = await prisma.campaign.create({
      data: {
        ...campaignInput,
        recipients: {
          createMany: {
            data: customerIds.map((customerId) => ({ customerId }))
          }
        }
      },
      include: { recipients: true }
    });

    res.status(201).json(campaign);
  })
);

const statusSchema = z.object({ status: z.nativeEnum(CampaignStatus) });

campaignsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const campaign = await prisma.campaign.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
    res.json(campaign);
  })
);
