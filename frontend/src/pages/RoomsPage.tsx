import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Room, RoomStatus } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { MANAGEMENT } from "../rbac";

const STATUS_OPTIONS: RoomStatus[] = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"];

export function RoomsPage() {
  const { user } = useAuth();
  const canManage = Boolean(user && MANAGEMENT.includes(user.role));
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadRooms = async () => {
    const data = await api.get<Room[]>("/rooms");
    setRooms(data);
  };

  useEffect(() => {
    loadRooms()
      .catch(() => setError("Could not load rooms"))
      .finally(() => setLoading(false));
  }, []);

  const seedRooms = async () => {
    setError("");
    setMessage("");
    setSeeding(true);
    try {
      await api.post<{ message: string; count: number }>("/rooms/quick-seed");
      setMessage("20 rooms were seeded successfully.");
      await loadRooms();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to seed rooms");
    } finally {
      setSeeding(false);
    }
  };

  const updateStatus = async (id: string, status: RoomStatus) => {
    setError("");
    setBusyId(id);
    try {
      await api.patch(`/rooms/${id}`, { status });
      await loadRooms();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update room status");
    } finally {
      setBusyId(null);
    }
  };

  const deleteRoom = async (id: string) => {
    if (!window.confirm("Delete this room? This cannot be undone.")) {
      return;
    }
    setError("");
    setBusyId(id);
    try {
      await api.delete(`/rooms/${id}`);
      await loadRooms();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete room");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">Room inventory</h2>
        <span className="card__meta">{rooms.length} rooms</span>
      </div>

      {loading ? (
        <div className="page-loading">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          No rooms configured yet.
          <div style={{ marginTop: "0.75rem" }}>
            <button type="button" className="btn-primary" onClick={seedRooms} disabled={seeding}>
              {seeding ? "Seeding..." : "Seed 20 starter rooms"}
            </button>
          </div>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Type</th>
                <th>Rate / night</th>
                <th>Status</th>
                {canManage ? <th></th> : null}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.type}</td>
                  <td>${Number(room.ratePerNight).toFixed(2)}</td>
                  <td>
                    {canManage ? (
                      <select
                        value={room.status}
                        disabled={busyId === room.id}
                        onChange={(e) => updateStatus(room.id, e.target.value as RoomStatus)}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge value={room.status} />
                    )}
                  </td>
                  {canManage ? (
                    <td>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={busyId === room.id}
                        onClick={() => deleteRoom(room.id)}
                      >
                        Remove
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error ? <div className="banner-error">{error}</div> : null}
      {message ? <div className="banner-success">{message}</div> : null}
    </div>
  );
}
