type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "gold";

const TONE_MAP: Record<string, Tone> = {
  AVAILABLE: "success",
  OCCUPIED: "warning",
  MAINTENANCE: "danger",

  CONFIRMED: "info",
  CHECKED_IN: "success",
  CHECKED_OUT: "neutral",
  CANCELLED: "danger",

  OPEN: "danger",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",

  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "danger",

  DRAFT: "neutral",
  SCHEDULED: "info",
  SENT: "success",
  PENDING: "warning",
  FAILED: "danger",

  BRONZE: "neutral",
  SILVER: "info",
  GOLD: "gold",
  PLATINUM: "gold"
};

export function StatusBadge({ value }: { value: string }) {
  const tone = TONE_MAP[value] ?? "neutral";
  return <span className={`badge badge-${tone}`}>{value.replace(/_/g, " ")}</span>;
}
