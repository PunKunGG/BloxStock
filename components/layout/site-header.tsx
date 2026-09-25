import { FlaskConical } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { Navigation } from "@/components/layout/navigation";

export function SiteHeader() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner container-shell">
          <Brand />
          <Navigation />
          <span
            className="demo-badge"
            title="All stock and prices are sample data"
          >
            <FlaskConical size={13} aria-hidden="true" />
            Demo preview
          </span>
        </div>
      </header>
      <Navigation mobile />
    </>
  );
}
