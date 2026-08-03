import { Router } from "express";
import { ComplaintSeverity, ComplaintStatus, ReservationStatus, RoomStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const dashboardRouter = Router();

function escapeCsv(value: string | number | { toString(): string } | null | undefined) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

dashboardRouter.get(
  "/kpis",
  asyncHandler(async (_req, res) => {
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
  })
);

dashboardRouter.get(
  "/reports",
  asyncHandler(async (_req, res) => {
    const [customers, rooms, reservations, openComplaints, revenue, roomStatus, reservationStatus, complaintSeverity, allComplaints, allReservations] = await Promise.all([
      prisma.customer.count(),
      prisma.room.count(),
      prisma.reservation.count(),
      prisma.complaint.count({ where: { status: { in: [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS] } } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.room.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.reservation.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.complaint.groupBy({ by: ["severity"], _count: { _all: true } }),
      prisma.complaint.findMany({
        where: { resolvedAt: { not: null } },
        select: { id: true, resolvedAt: true }
      }),
      prisma.reservation.findMany({
        select: { createdAt: true }
      })
    ]);

    const occupiedRooms = roomStatus.find((entry) => entry.status === RoomStatus.OCCUPIED)?._count._all ?? 0;
    const occupancyRate = rooms > 0 ? Math.round((occupiedRooms / rooms) * 1000) / 10 : 0;
    const activeReservations = reservationStatus.find((entry) =>
      entry.status === ReservationStatus.CONFIRMED || entry.status === ReservationStatus.CHECKED_IN
    )?._count._all ?? 0;

    const totalComplaints = allComplaints.length + openComplaints;
    const resolvedComplaints = allComplaints.length;
    const satisfactionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 1000) / 10 : 100;

    const sortedRoomStatus = [...roomStatus].sort((a, b) => {
      const order = { [RoomStatus.AVAILABLE]: 0, [RoomStatus.OCCUPIED]: 1, [RoomStatus.MAINTENANCE]: 2 };
      return (order[a.status] ?? 99) - (order[b.status] ?? 99);
    });
    const sortedReservationStatus = [...reservationStatus].sort((a, b) => {
      const order = {
        [ReservationStatus.CONFIRMED]: 0,
        [ReservationStatus.CHECKED_IN]: 1,
        [ReservationStatus.CHECKED_OUT]: 2,
        [ReservationStatus.CANCELLED]: 3
      };
      return (order[a.status] ?? 99) - (order[b.status] ?? 99);
    });
    const sortedComplaintSeverity = [...complaintSeverity].sort((a, b) => {
      const order = {
        [ComplaintSeverity.LOW]: 0,
        [ComplaintSeverity.MEDIUM]: 1,
        [ComplaintSeverity.HIGH]: 2,
        [ComplaintSeverity.CRITICAL]: 3
      };
      return (order[a.severity] ?? 99) - (order[b.severity] ?? 99);
    });
    const sortedReservations = [...allReservations].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const bookingTrends = Array.from({ length: 6 }, (_, idx) => {
      const month = new Date();
      month.setDate(1);
      month.setMonth(month.getMonth() - (5 - idx));
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
      const count = sortedReservations.filter((reservation) => {
        const createdAt = new Date(reservation.createdAt);
        const currentMonthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
        return currentMonthKey === monthKey;
      }).length;

      return { month: monthKey, count };
    });

    res.json({
      generatedAt: new Date().toISOString(),
      summary: {
        totalCustomers: customers,
        totalRooms: rooms,
        occupancyRate,
        activeReservations,
        openComplaints,
        revenueCollected: revenue._sum.amount ?? 0
      },
      guestSatisfaction: {
        satisfactionRate,
        resolvedComplaints,
        openComplaints
      },
      bookingTrends,
      roomStatus: sortedRoomStatus.map((entry) => ({ status: entry.status, count: entry._count._all })),
      reservationStatus: sortedReservationStatus.map((entry) => ({ status: entry.status, count: entry._count._all })),
      complaintSeverity: sortedComplaintSeverity.map((entry) => ({ severity: entry.severity, count: entry._count._all }))
    });
  })
);

dashboardRouter.get(
  "/reports/export",
  asyncHandler(async (_req, res) => {
    const report = await prisma.$transaction(async (tx) => {
      const [customers, rooms, reservations, openComplaints, revenue, roomStatus, reservationStatus, complaintSeverity, resolvedComplaints, allReservations] = await Promise.all([
        tx.customer.count(),
        tx.room.count(),
        tx.reservation.count(),
        tx.complaint.count({ where: { status: { in: [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS] } } }),
        tx.payment.aggregate({ _sum: { amount: true } }),
        tx.room.groupBy({ by: ["status"], _count: { _all: true } }),
        tx.reservation.groupBy({ by: ["status"], _count: { _all: true } }),
        tx.complaint.groupBy({ by: ["severity"], _count: { _all: true } }),
        tx.complaint.findMany({
          where: { resolvedAt: { not: null } },
          select: { id: true, resolvedAt: true }
        }),
        tx.reservation.findMany({
          select: { createdAt: true }
        })
      ]);

      const occupiedRooms = roomStatus.find((entry) => entry.status === RoomStatus.OCCUPIED)?._count._all ?? 0;
      const occupancyRate = rooms > 0 ? Math.round((occupiedRooms / rooms) * 1000) / 10 : 0;
      const activeReservations = reservationStatus.find((entry) =>
        entry.status === ReservationStatus.CONFIRMED || entry.status === ReservationStatus.CHECKED_IN
      )?._count._all ?? 0;

      const totalComplaints = resolvedComplaints.length + openComplaints;
      const satisfactionRate = totalComplaints > 0 ? Math.round((resolvedComplaints.length / totalComplaints) * 1000) / 10 : 100;
      const sortedRoomStatus = [...roomStatus].sort((a, b) => {
        const order = { [RoomStatus.AVAILABLE]: 0, [RoomStatus.OCCUPIED]: 1, [RoomStatus.MAINTENANCE]: 2 };
        return (order[a.status] ?? 99) - (order[b.status] ?? 99);
      });
      const sortedReservationStatus = [...reservationStatus].sort((a, b) => {
        const order = {
          [ReservationStatus.CONFIRMED]: 0,
          [ReservationStatus.CHECKED_IN]: 1,
          [ReservationStatus.CHECKED_OUT]: 2,
          [ReservationStatus.CANCELLED]: 3
        };
        return (order[a.status] ?? 99) - (order[b.status] ?? 99);
      });
      const sortedComplaintSeverity = [...complaintSeverity].sort((a, b) => {
        const order = {
          [ComplaintSeverity.LOW]: 0,
          [ComplaintSeverity.MEDIUM]: 1,
          [ComplaintSeverity.HIGH]: 2,
          [ComplaintSeverity.CRITICAL]: 3
        };
        return (order[a.severity] ?? 99) - (order[b.severity] ?? 99);
      });
      const sortedReservations = [...allReservations].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const bookingTrends = Array.from({ length: 6 }, (_, idx) => {
        const month = new Date();
        month.setDate(1);
        month.setMonth(month.getMonth() - (5 - idx));
        const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
        const count = sortedReservations.filter((reservation) => {
          const createdAt = new Date(reservation.createdAt);
          const currentMonthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
          return currentMonthKey === monthKey;
        }).length;

        return { month: monthKey, count };
      });

      return {
        generatedAt: new Date().toISOString(),
        totalCustomers: customers,
        totalRooms: rooms,
        occupancyRate,
        activeReservations,
        openComplaints,
        revenueCollected: revenue._sum.amount ?? 0,
        satisfactionRate,
        resolvedComplaints: resolvedComplaints.length,
        bookingTrends,
        roomStatus: sortedRoomStatus.map((entry) => ({ status: entry.status, count: entry._count._all })),
        reservationStatus: sortedReservationStatus.map((entry) => ({ status: entry.status, count: entry._count._all })),
        complaintSeverity: sortedComplaintSeverity.map((entry) => ({ severity: entry.severity, count: entry._count._all }))
      };
    });

    const lines = [
      ["Generated At", report.generatedAt],
      ["Total Customers", report.totalCustomers],
      ["Total Rooms", report.totalRooms],
      ["Occupancy Rate %", report.occupancyRate],
      ["Active Reservations", report.activeReservations],
      ["Open Complaints", report.openComplaints],
      ["Revenue Collected", report.revenueCollected],
      ["Guest Satisfaction %", report.satisfactionRate],
      ["Resolved Complaints", report.resolvedComplaints],
      [],
      ["Room Status", "Count"],
      ...report.roomStatus.map((entry) => [entry.status, entry.count]),
      [],
      ["Reservation Status", "Count"],
      ...report.reservationStatus.map((entry) => [entry.status, entry.count]),
      [],
      ["Complaint Severity", "Count"],
      ...report.complaintSeverity.map((entry) => [entry.severity, entry.count]),
      [],
      ["Booking Trend Month", "Count"],
      ...report.bookingTrends.map((entry) => [entry.month, entry.count])
    ];

    const csv = lines.map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="manor-hotel-report-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  })
);
