import Image from "next/image";
import type { Fruit } from "@/types/fruit";
import { cn } from "@/lib/utils";

export function FruitArt({
  fruit,
  size = "card",
  priority = false,
}: {
  fruit: Fruit;
  size?: "card" | "large" | "small" | "highlight";
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "fruit-art",
        `fruit-art-${size}`,
        `art-${fruit.slug}`,
        `glow-${fruit.rarity.toLowerCase()}`,
      )}
    >
      <Image
        src={fruit.image}
        alt={`${fruit.name} fruit`}
        width={size === "large" ? 400 : 200}
        height={size === "large" ? 400 : 200}
        sizes={
          size === "large"
            ? "(max-width: 640px) 260px, 380px"
            : size === "small"
              ? "40px"
              : "180px"
        }
        priority={priority}
      />
    </div>
  );
}
