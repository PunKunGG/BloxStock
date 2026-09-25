import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { FruitArt } from "@/components/fruits/fruit-art";
import { RarityBadge } from "@/components/fruits/rarity-badge";
import { isRareHighlight } from "@/lib/fruits/filters";
import { formatMoney } from "@/lib/utils";
import type { Fruit } from "@/types/fruit";

export function RareHighlight({ fruits }: { fruits: Fruit[] }) {
  const rareFruits = fruits
    .filter(isRareHighlight)
    .sort((a, b) => b.moneyPrice - a.moneyPrice);
  const featured = rareFruits[0];
  if (!featured) return null;
  return (
    <aside
      className={`rare-highlight highlight-${featured.rarity.toLowerCase()}`}
      aria-label="Rare fruit highlight"
    >
      <div className="highlight-intro">
        <span className="highlight-icon">
          <Sparkles size={21} aria-hidden="true" />
        </span>
        <div>
          <span className="highlight-eyebrow">
            A GOOD TIME TO VISIT THE DEALER
          </span>
          <h2>
            {rareFruits.length > 1
              ? `${rareFruits.length} rare finds in stock`
              : "Rare fruit in stock"}
          </h2>
        </div>
      </div>
      <div className="highlight-fruit">
        <FruitArt fruit={featured} size="highlight" />
        <div>
          <div className="highlight-fruit-name">
            {featured.name}
            <RarityBadge rarity={featured.rarity} dot={false} />
          </div>
          <span className="highlight-price">
            {formatMoney(featured.moneyPrice)}
            <span> · Available this rotation</span>
          </span>
        </div>
      </div>
      <Link href={`/fruits/${featured.slug}`} className="highlight-link">
        View fruit
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </aside>
  );
}
