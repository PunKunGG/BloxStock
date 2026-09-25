import { AlertCircle, Check, TriangleAlert } from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { StockState } from "@/types/stock";

const states = {
  live: { label: "Live", Icon: Check },
  stale: { label: "Data may be outdated", Icon: TriangleAlert },
  unavailable: { label: "Unable to verify current stock", Icon: AlertCircle },
};

export function StockStatus({
  status,
  updatedAt,
  now,
}: {
  status: StockState;
  updatedAt: string;
  now: number;
}) {
  const { label, Icon } = states[status];
  return (
    <div className={`stock-status status-${status}`} role="status">
      <span className="stock-status-badge">
        <Icon size={12} aria-hidden="true" />
        {label}
      </span>
      {status !== "unavailable" && (
        <span className="stock-updated">
          {status === "live" ? "Updated" : "Last updated"}{" "}
          {relativeTime(updatedAt, now)}
        </span>
      )}
    </div>
  );
}
