import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A record with this value already exists" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "This action conflicts with a related record (invalid reference or still in use)" });
    }
  }

  console.error(err);
  return res.status(500).json({ error: "Unexpected server error" });
}
