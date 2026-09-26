import { Timer, RotateCw } from "lucide-react";

export function Countdown({
  expiresAt,
  now,
  intervalHours,
  isDemo = true,
  available = true,
}: {
  expiresAt: string;
  now: number;
  intervalHours: number;
  isDemo?: boolean;
  available?: boolean;
}) {
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
  const parts = [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ];
  return (
    <div className="countdown-panel">
      <div className="countdown-label">
        <Timer size={16} aria-hidden="true" />
        <span>
          {available ? "Next stock refresh in" : "Awaiting stock data"}
        </span>
        <span className="countdown-live">{isDemo ? "AUTO" : "STORED"}</span>
      </div>
      <div
        className="countdown-digits"
        role="timer"
        aria-label={
          available
            ? `${parts[0]} hours, ${parts[1]} minutes, ${parts[2]} seconds until next stock refresh`
            : "No stored rotation available"
        }
      >
        {parts.map((part, index) => (
          <div key={index} className="countdown-unit">
            {index > 0 && (
              <span className="countdown-colon" aria-hidden="true">
                :
              </span>
            )}
            <span className="countdown-number">
              {available ? String(part).padStart(2, "0") : "—"}
            </span>
            <span className="countdown-caption">
              {["HOURS", "MINUTES", "SECONDS"][index]}
            </span>
          </div>
        ))}
      </div>
      <div className="countdown-footnote">
        <RotateCw size={12} aria-hidden="true" />
        {!available
          ? "No verified rotation stored yet"
          : seconds === 0
            ? isDemo
              ? "Loading the next sample rotation…"
              : "Awaiting a verified rotation"
            : `${isDemo ? "Sample rotation" : "Dealer rotation"} every ${intervalHours} hours`}
      </div>
    </div>
  );
}
