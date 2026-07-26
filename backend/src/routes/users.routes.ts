import { Router } from "express";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AuthedRequest, requireRole } from "../middleware/auth.js";
import { ADMIN_ONLY } from "../rbac.js";

export const usersRouter = Router();
usersRouter.use(requireRole(...ADMIN_ONLY));

const userSelect = { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true };

usersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ select: userSelect, orderBy: { createdAt: "desc" } });
    res.json(users);
  })
);

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role)
});

usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { fullName, email, password, role } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role },
      select: userSelect
    });

    return res.status(201).json(user);
  })
);

const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional()
});

usersRouter.patch(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    if (req.params.id === req.user?.sub && parsed.data.isActive === false) {
      return res.status(400).json({ error: "You cannot deactivate your own account" });
    }

    if (parsed.data.role !== undefined && parsed.data.role !== Role.ADMIN) {
      const remainingAdmins = await prisma.user.count({
        where: { role: Role.ADMIN, isActive: true, id: { not: req.params.id } }
      });
      const target = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (target?.role === Role.ADMIN && remainingAdmins === 0) {
        return res.status(400).json({ error: "At least one active admin must remain" });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: parsed.data,
      select: userSelect
    });

    return res.json(user);
  })
);
