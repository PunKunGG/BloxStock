import { FlaskConical } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { Navigation } from "@/components/layout/navigation";

export function SiteHeader({ isDemo = true }: { isDemo?: boolean }) {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner container-shell">
          <Brand />
          <Navigation />
          <span
            className="demo-badge"
            title={
              isDemo
                ? "All stock and prices are sample data"
                : "Showing stored catalog and stock records"
            }
          >
            <FlaskConical size={13} aria-hidden="true" />
            {isDemo ? "Demo preview" : "Stored data"}
          </span>
        </div>
      </header>
      <Navigation mobile />
    </>
  );
}
