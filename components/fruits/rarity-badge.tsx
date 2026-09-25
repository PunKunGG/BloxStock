import type { Rarity } from "@/types/fruit";
import { cn } from "@/lib/utils";

export function RarityBadge({
  rarity,
  dot = true,
}: {
  rarity: Rarity;
  dot?: boolean;
}) {
  return (
    <span className={cn("rarity-badge", `rarity-${rarity.toLowerCase()}`)}>
      {dot && <span aria-hidden="true" />}
      {rarity}
    </span>
  );
}
