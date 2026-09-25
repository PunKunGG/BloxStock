import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  ChevronRight,
  Gem,
  History,
} from "lucide-react";
import { FruitArt } from "@/components/fruits/fruit-art";
import { RarityBadge } from "@/components/fruits/rarity-badge";
import { StockAvailability } from "@/components/fruits/stock-availability";
import { getFruit } from "@/lib/fruits/getFruits";
import { getStockHistory } from "@/lib/history/getStockHistory";
import { getDealerStocks } from "@/lib/stock/getCurrentStock";
import { getRequestTime } from "@/lib/request-time";
import { DEALERS } from "@/lib/stock/config";
import { formatDate, formatMoney, formatNumber, formatTime } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fruit = await getFruit((await params).slug);
  return {
    title: fruit ? `${fruit.name} Fruit` : "Fruit not found",
    description: fruit
      ? `Check ${fruit.name}'s sample dealer availability, ${fruit.rarity.toLowerCase()} rarity, prices, and recent stock appearances.`
      : undefined,
  };
}

export default async function FruitDetailPage({ params }: Props) {
  const fruit = await getFruit((await params).slug);
  if (!fruit) notFound();
  const now = await getRequestTime();
  const [stocks, history] = await Promise.all([
    getDealerStocks(now),
    getStockHistory({ fruitId: fruit.id }, now),
  ]);
  const current = Object.values(stocks).filter((stock) =>
    stock.fruits.some((item) => item.id === fruit.id),
  );
  const appearances = [...current, ...history].sort(
    (a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt),
  );
  const lastSeen = appearances[0]?.observedAt;

  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/fruits">
          <ArrowLeft size={15} aria-hidden="true" />
          Fruit directory
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span>{fruit.name}</span>
      </nav>
      <section className="fruit-detail">
        <div className={`detail-art-panel glow-${fruit.rarity.toLowerCase()}`}>
          <div className="detail-art-top">
            <span>BLOX FRUIT / {fruit.type.toUpperCase()}</span>
            <RarityBadge rarity={fruit.rarity} />
          </div>
          <FruitArt fruit={fruit} size="large" priority />
          <div className="detail-art-bottom">
            <span>{fruit.name.toUpperCase()}</span>
            <span>FRUIT COLLECTION</span>
          </div>
        </div>
        <div className="detail-information">
          <span className="eyebrow">MEET YOUR NEXT FRUIT</span>
          <h1>
            {fruit.name}
            <span>.</span>
          </h1>
          <div className="detail-tags">
            <RarityBadge rarity={fruit.rarity} />
            <span>{fruit.type} type</span>
          </div>
          <p className="detail-description">
            Explore {fruit.name}’s prices, dealer availability, and recent
            appearances. Your next rotation could be the one.
          </p>
          <div className="detail-prices">
            <div>
              <span>
                <Banknote size={16} aria-hidden="true" />
                Money price
              </span>
              <strong>{formatMoney(fruit.moneyPrice)}</strong>
              <small>In-game currency</small>
            </div>
            <div>
              <span>
                <Gem size={15} aria-hidden="true" />
                Robux price
              </span>
              <strong>
                {fruit.robuxPrice === null
                  ? "Unavailable"
                  : formatNumber(fruit.robuxPrice)}
              </strong>
              <small>Permanent fruit</small>
            </div>
          </div>
          <StockAvailability
            fruitId={fruit.id}
            stocks={stocks}
            initialNow={now}
          />
          <div className="last-seen">
            <span>
              <CalendarDays size={16} aria-hidden="true" />
              Last seen
            </span>
            <strong>
              {lastSeen ? formatDate(lastSeen) : "No recent appearances"}
            </strong>
          </div>
        </div>
      </section>
      <section className="recent-appearances">
        <div className="section-heading">
          <div>
            <h2>
              <History size={19} aria-hidden="true" />
              Recent appearances
            </h2>
            <p>The latest sample rotations featuring {fruit.name}.</p>
          </div>
          <Link
            href={`/history?fruit=${fruit.id}${appearances[0]?.dealer === "mirage" ? "&dealer=mirage" : ""}`}
            className="text-link"
          >
            Full history
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        {appearances.length ? (
          <div className="appearances-list">
            {appearances.slice(0, 5).map((appearance) => (
              <div className="appearance-row" key={appearance.id}>
                <span className="appearance-date">
                  <CalendarDays size={16} aria-hidden="true" />
                  <time dateTime={appearance.observedAt}>
                    {formatDate(appearance.observedAt)}
                  </time>
                </span>
                <span>{formatTime(appearance.observedAt)} ICT</span>
                <span>{DEALERS[appearance.dealer].name}</span>
                {current.some((stock) => stock.id === appearance.id) ? (
                  <span className="in-stock">Current rotation</span>
                ) : (
                  <span className="past-rotation">Past rotation</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No appearances in the last 7 days.</p>
          </div>
        )}
      </section>
      <p className="page-footnote">
        Prototype preview · Availability, history, and prices are sample data.
      </p>
    </>
  );
}
