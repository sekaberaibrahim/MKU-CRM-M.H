import { Role } from "@prisma/client";

export const ADMIN_ONLY: Role[] = [Role.ADMIN];
export const MANAGEMENT: Role[] = [Role.MANAGER, Role.ADMIN];
export const FRONT_DESK: Role[] = [Role.RECEPTION, Role.MANAGER, Role.ADMIN];
export const MARKETING_TEAM: Role[] = [Role.MARKETING, Role.MANAGER, Role.ADMIN];
export const ANY_STAFF: Role[] = [Role.RECEPTION, Role.MARKETING, Role.MANAGER, Role.ADMIN];
