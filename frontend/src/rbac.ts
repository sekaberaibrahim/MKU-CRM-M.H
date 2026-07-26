import { Role } from "./types";

export const ADMIN_ONLY: Role[] = ["ADMIN"];
export const MANAGEMENT: Role[] = ["MANAGER", "ADMIN"];
export const FRONT_DESK: Role[] = ["RECEPTION", "MANAGER", "ADMIN"];
export const MARKETING_TEAM: Role[] = ["MARKETING", "MANAGER", "ADMIN"];
