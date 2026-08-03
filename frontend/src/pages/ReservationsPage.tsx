import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Customer, Reservation, ReservationSource, ReservationStatus, Room } from "../types";
import { StatusBadge } from "../components/StatusBadge";

const STATUS_OPTIONS: ReservationStatus[] = ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"];
const SOURCE_OPTIONS: ReservationSource[] = ["DIRECT", "PHONE", "WEBSITE", "OTA"];

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const availableRooms = rooms.filter((room) => room.status === "AVAILABLE");

  const [customerId, setCustomerId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [source, setSource] = useState<ReservationSource>("DIRECT");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const loadAll = async () => {
    const [reservationData, customerData, roomData] = await Promise.all([
      api.get<Reservation[]>("/reservations"),
      api.get<Customer[]>("/customers"),
      api.get<Room[]>("/rooms")
    ]);
    setReservations(reservationData);
    setCustomers(customerData);
    setRooms(roomData);
  };

  useEffect(() => {
    loadAll()
      .catch(() => setError("Could not load reservations"))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/reservations", {
        customerId,
        roomId,
        source,
        checkInDate: new Date(checkInDate).toISOString(),
        checkOutDate: new Date(checkOutDate).toISOString(),
        adults,
        children
      });
      setCustomerId("");
      setRoomId("");
      setCheckInDate("");
      setCheckOutDate("");
      setAdults(1);
      setChildren(0);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create reservation");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: ReservationStatus) => {
    setError("");
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update reservation status");
    }
  };

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">New reservation</h2>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Customer</label>
              <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Room</label>
              <select required value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                <option value="">Select room</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} - {room.type}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value as ReservationSource)}>
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Check-in</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Check-out</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Adults</label>
              <input
                type="number"
                min={1}
                required
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Children</label>
              <input
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !customers.length || !availableRooms.length}
            >
              {submitting ? "Booking..." : "Create reservation"}
            </button>
          </div>
        </form>
        {!loading && (!customers.length || !availableRooms.length) ? (
          <div className="banner-error">
            {availableRooms.length === 0
              ? "No rooms are available to book right now. All rooms are occupied or unavailable."
              : "Add at least one customer before creating a reservation."}
          </div>
        ) : null}
        {error ? <div className="banner-error">{error}</div> : null}
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Bookings</h2>
          <span className="card__meta">{reservations.length} reservations</span>
        </div>
        {loading ? (
          <div className="page-loading">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="empty-state">No reservations yet.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.customer?.fullName ?? reservation.customerId}</td>
                    <td>{reservation.room?.roomNumber ?? reservation.roomId}</td>
                    <td>{new Date(reservation.checkInDate).toLocaleDateString()}</td>
                    <td>{new Date(reservation.checkOutDate).toLocaleDateString()}</td>
                    <td>
                      {reservation.adults}A / {reservation.children}C
                    </td>
                    <td>
                      <StatusBadge value={reservation.status} />
                    </td>
                    <td>
                      <select
                        value={reservation.status}
                        onChange={(e) => updateStatus(reservation.id, e.target.value as ReservationStatus)}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
