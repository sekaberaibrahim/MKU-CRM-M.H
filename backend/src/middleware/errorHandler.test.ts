import { describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { errorHandler } from "./errorHandler.js";
import type { Request, Response } from "express";

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("mock", { code, clientVersion: "5.0.0" });
}

describe("errorHandler", () => {
  it("maps a unique constraint violation to 409", () => {
    const res = mockRes();
    errorHandler(prismaError("P2002"), {} as Request, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("maps a not-found error to 404", () => {
    const res = mockRes();
    errorHandler(prismaError("P2025"), {} as Request, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("maps a foreign-key violation to 400", () => {
    const res = mockRes();
    errorHandler(prismaError("P2003"), {} as Request, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("falls back to 500 for unknown errors", () => {
    const res = mockRes();
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    errorHandler(new Error("boom"), {} as Request, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    logSpy.mockRestore();
  });
});
