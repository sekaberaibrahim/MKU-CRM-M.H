import { describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";
import { requireRole } from "./auth.js";
import type { AuthedRequest } from "./auth.js";
import type { Response } from "express";

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe("requireRole", () => {
  it("rejects requests with no authenticated user", () => {
    const req = {} as AuthedRequest;
    const res = mockRes();
    const next = vi.fn();

    requireRole(Role.ADMIN)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a user whose role is not in the allow-list", () => {
    const req = { user: { sub: "u1", role: Role.RECEPTION, email: "a@b.com" } } as AuthedRequest;
    const res = mockRes();
    const next = vi.fn();

    requireRole(Role.ADMIN, Role.MANAGER)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows a user whose role is in the allow-list", () => {
    const req = { user: { sub: "u1", role: Role.MANAGER, email: "a@b.com" } } as AuthedRequest;
    const res = mockRes();
    const next = vi.fn();

    requireRole(Role.ADMIN, Role.MANAGER)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
