export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading BloxStock"
      className="loading-shell"
    >
      <span className="sr-only" role="status">
        Loading stock information…
      </span>
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-subheading" />
      <div className="skeleton skeleton-toolbar" />
      <div className="fruit-grid">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="skeleton skeleton-card" key={index} />
        ))}
      </div>
    </div>
  );
}
