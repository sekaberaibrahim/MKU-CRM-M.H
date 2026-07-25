import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  CampaignChannel,
  ComplaintStatus,
  ComplaintSeverity,
  PrismaClient,
  ReservationSource,
  ReservationStatus,
  Role,
  RoomType
} from "@prisma/client";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 5000);
const jwtSecret = process.env.JWT_SECRET ?? "dev-secret";

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "Manor CRM API" });
});

type AuthedRequest = express.Request & { user?: { sub: string; role: Role; email: string } };

const publicRoutes = [
  { method: "POST", path: "/auth/register" },
  { method: "POST", path: "/auth/login" }
];

app.use((req: AuthedRequest, res, next) => {
  const isPublic = publicRoutes.some((route) => route.method === req.method && route.path === req.path);
  if (isPublic) {
    return next();
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    req.user = jwt.verify(header.slice(7), jwtSecret) as AuthedRequest["user"];
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions for this action" });
    }
    return next();
  };
}

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role).optional()
});

app.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { fullName, email, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { fullName, email, passwordHash, role: role ?? Role.RECEPTION }
  });

  return res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

app.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret, {
    expiresIn: "8h"
  });

  return res.json({ token });
});

const customerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  country: z.string().optional(),
  notes: z.string().optional()
});

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

const complaintSchema = z.object({
  customerId: z.string().min(5),
  title: z.string().min(3),
  description: z.string().min(10),
  severity: z.nativeEnum(ComplaintSeverity)
});

const campaignSchema = z.object({
  name: z.string().min(3),
  segment: z.string().min(3),
  channel: z.nativeEnum(CampaignChannel),
  message: z.string().min(5),
  customerIds: z.array(z.string().min(5)).min(1)
});

const loyaltySchema = z.object({
  customerId: z.string().min(5),
  points: z.number().int(),
  reason: z.string().min(3)
});

app.get("/customers", async (_req, res) => {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  res.json(customers);
});

app.post("/customers", async (req, res) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const customer = await prisma.customer.create({ data: parsed.data });
  res.status(201).json(customer);
});

const frontDesk = requireRole(Role.RECEPTION, Role.MANAGER, Role.ADMIN);
const marketingTeam = requireRole(Role.MARKETING, Role.MANAGER, Role.ADMIN);

app.get("/rooms", frontDesk, async (_req, res) => {
  const rooms = await prisma.room.findMany({ orderBy: { roomNumber: "asc" } });
  res.json(rooms);
});

app.post("/rooms/quick-seed", frontDesk, async (_req, res) => {
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
});

app.get("/reservations", async (_req, res) => {
  const reservations = await prisma.reservation.findMany({
    include: { customer: true, room: true, invoice: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(reservations);
});

app.post("/reservations", async (req, res) => {
  const parsed = reservationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const data = parsed.data;
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
});

app.patch("/reservations/:id/status", async (req, res) => {
  const statusSchema = z.object({ status: z.nativeEnum(ReservationStatus) });
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const updated = await prisma.reservation.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status }
  });

  res.json(updated);
});

app.get("/complaints", async (_req, res) => {
  const complaints = await prisma.complaint.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(complaints);
});

app.post("/complaints", async (req, res) => {
  const parsed = complaintSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const complaint = await prisma.complaint.create({ data: parsed.data });
  res.status(201).json(complaint);
});

app.get("/campaigns", async (_req, res) => {
  const campaigns = await prisma.campaign.findMany({
    include: { recipients: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(campaigns);
});

app.post("/campaigns", requireRole(Role.ADMIN, Role.MANAGER, Role.MARKETING), async (req, res) => {
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
});

app.post("/loyalty/transactions", async (req, res) => {
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
});

app.get("/dashboard/kpis", async (_req, res) => {
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
});

app.listen(port, () => {
  console.log(`Manor CRM API running at http://localhost:${port}`);
});
