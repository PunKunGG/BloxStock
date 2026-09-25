"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple, Bookmark, History, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Stock", icon: LayoutGrid },
  { href: "/fruits", label: "Fruits", icon: Apple },
  { href: "/history", label: "History", icon: History },
];

export function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={mobile ? "Mobile navigation" : "Main navigation"}
      className={mobile ? "mobile-nav" : "desktop-nav"}
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn("nav-link", active && "active")}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
      <span
        className="nav-link nav-disabled"
        aria-disabled="true"
        title="Watchlists are coming soon"
      >
        <Bookmark size={17} aria-hidden="true" />
        <span>Watchlist</span>
        <span className="soon-label">Soon</span>
      </span>
    </nav>
  );
}
