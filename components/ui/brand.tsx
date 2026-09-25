import { Box } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="BloxStock home"
      className={cn("brand", small && "brand-small")}
    >
      <span className="brand-mark">
        <Box size={small ? 20 : 25} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span>
        Blox<span className="brand-accent">Stock</span>
        <span className="brand-period">.</span>
      </span>
    </Link>
  );
}
