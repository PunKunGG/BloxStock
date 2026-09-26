import { Brand } from "@/components/ui/brand";

export function SiteFooter({ isDemo = true }: { isDemo?: boolean }) {
  return (
    <footer className="site-footer container-shell">
      <div>
        <Brand small />
        <p>Your next fruit, one refresh away.</p>
      </div>
      <div className="footer-notes">
        <span>Made for the Blox Fruits community.</span>
        <p>
          {isDemo && "Sample stock & prices. "}Not affiliated with Roblox or
          Gamer Robot.
        </p>
      </div>
    </footer>
  );
}
