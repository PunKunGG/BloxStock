import Link from "next/link";
import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { FruitArt } from "@/components/fruits/fruit-art";
import { RarityBadge } from "@/components/fruits/rarity-badge";
import { FruitPrice } from "@/components/fruits/fruit-price";
import type { Fruit } from "@/types/fruit";

export const FruitCard = memo(function FruitCard({
  fruit,
  priority = false,
}: {
  fruit: Fruit;
  priority?: boolean;
}) {
  return (
    <article className={`fruit-card card-${fruit.rarity.toLowerCase()}`}>
      <Link
        href={`/fruits/${fruit.slug}`}
        className="fruit-card-link"
        aria-label={`View ${fruit.name} fruit`}
      >
        <div className="fruit-card-top">
          <RarityBadge rarity={fruit.rarity} />
          <span className="fruit-type">{fruit.type}</span>
        </div>
        <FruitArt fruit={fruit} priority={priority} />
        <div className="fruit-card-info">
          <h3>{fruit.name}</h3>
          <FruitPrice fruit={fruit} />
        </div>
        <div className="fruit-card-footer">
          <span>View Fruit</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </div>
      </Link>
    </article>
  );
});
