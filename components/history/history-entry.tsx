import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { FruitArt } from "@/components/fruits/fruit-art";
import { formatTime } from "@/lib/utils";
import type { StockRotationView } from "@/types/stock";

export function HistoryEntry({ rotation }: { rotation: StockRotationView }) {
  return (
    <article className="history-entry">
      <div className="history-time">
        <Clock3 size={16} aria-hidden="true" />
        <time dateTime={rotation.observedAt}>
          {formatTime(rotation.observedAt)}
        </time>
        <span>{rotation.fruits.length} fruits</span>
      </div>
      <div className="history-fruits">
        {rotation.fruits.map((fruit) => (
          <Link
            className={`history-fruit rarity-${fruit.rarity.toLowerCase()}`}
            href={`/fruits/${fruit.slug}`}
            aria-label={`View ${fruit.name} fruit`}
            key={fruit.id}
          >
            <FruitArt fruit={fruit} size="small" />
            <span>{fruit.name}</span>
            <span className="history-rarity-dot" title={fruit.rarity} />
            <ArrowUpRight
              size={12}
              className="history-fruit-arrow"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </article>
  );
}
