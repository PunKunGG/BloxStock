import { Timer, RotateCw } from "lucide-react";

export function Countdown({
  expiresAt,
  now,
  intervalHours,
}: {
  expiresAt: string;
  now: number;
  intervalHours: number;
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
        <span>Next stock refresh in</span>
        <span className="countdown-live">AUTO</span>
      </div>
      <div
        className="countdown-digits"
        role="timer"
        aria-label={`${parts[0]} hours, ${parts[1]} minutes, ${parts[2]} seconds until next stock refresh`}
      >
        {parts.map((part, index) => (
          <div key={index} className="countdown-unit">
            {index > 0 && (
              <span className="countdown-colon" aria-hidden="true">
                :
              </span>
            )}
            <span className="countdown-number">
              {String(part).padStart(2, "0")}
            </span>
            <span className="countdown-caption">
              {["HOURS", "MINUTES", "SECONDS"][index]}
            </span>
          </div>
        ))}
      </div>
      <div className="countdown-footnote">
        <RotateCw size={12} aria-hidden="true" />
        {seconds === 0
          ? "Loading the next sample rotation…"
          : `Sample rotation every ${intervalHours} hours`}
      </div>
    </div>
  );
}
