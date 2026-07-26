import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";

export type AuthedRequest = Request & { user?: { sub: string; role: Role; email: string } };

export type JwtPayload = { sub: string; role: Role; email: string };

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "8h" });
}

export async function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(header.slice(7), env.jwtSecret) as JwtPayload;
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    return res.status(401).json({ error: "Account is inactive or no longer exists" });
  }

  req.user = { sub: user.id, role: user.role, email: user.email };
  return next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions for this action" });
    }
    return next();
  };
}
