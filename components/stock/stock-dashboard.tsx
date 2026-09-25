"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Info, LayoutGrid, RotateCw } from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { DealerTabs } from "@/components/stock/dealer-tabs";
import { Countdown } from "@/components/stock/countdown";
import { StockStatus } from "@/components/stock/stock-status";
import { RareHighlight } from "@/components/stock/rare-highlight";
import { FruitCard } from "@/components/fruits/fruit-card";
import { useStockClock } from "@/components/stock/use-stock-clock";
import { DEALERS } from "@/lib/stock/config";
import type { Dealer, DealerStocks } from "@/types/stock";

export function StockDashboard({
  stocks,
  initialNow,
}: {
  stocks: DealerStocks;
  initialNow: number;
}) {
  const [dealer, setDealer] = useState<Dealer>("normal");
  const stock = stocks[dealer];
  const { now, isRefreshing, refresh } = useStockClock(
    initialNow,
    stock.expiresAt,
  );
  const status =
    stock.status === "live" && now >= Date.parse(stock.expiresAt)
      ? "stale"
      : stock.status;
  return (
    <>
      <PageHeading
        eyebrow="THE BLOX FRUITS STOCK TRACKER"
        title="What's in stock right now?"
        description="Track dealer stock, discover your next fruit, and never miss a rotation."
      >
        <Countdown
          expiresAt={stock.expiresAt}
          now={now}
          intervalHours={DEALERS[dealer].intervalHours}
        />
      </PageHeading>
      <div className="dealer-toolbar">
        <DealerTabs value={dealer} onChange={setDealer} />
        <StockStatus status={status} updatedAt={stock.updatedAt} now={now} />
      </div>
      <section aria-label={`${DEALERS[dealer].name} current stock`}>
        {status === "live" && <RareHighlight fruits={stock.fruits} />}
        <div className="section-heading stock-heading">
          <div>
            <h2>
              <LayoutGrid size={18} aria-hidden="true" />
              Current stock{" "}
              <span className="count-badge">
                {status === "unavailable" ? "—" : stock.fruits.length}
              </span>
            </h2>
            <p>Available at the {DEALERS[dealer].name}</p>
          </div>
          <Link href="/fruits" className="text-link">
            Explore all fruits
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        {status === "unavailable" ? (
          <EmptyState
            title="Stock is temporarily unavailable"
            description="We couldn’t verify this rotation. Please try again."
            action={
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="button button-primary"
              >
                <RotateCw size={16} />
                {isRefreshing ? "Checking…" : "Try again"}
              </button>
            }
          />
        ) : stock.fruits.length ? (
          <div className="fruit-grid">
            {stock.fruits.map((fruit, index) => (
              <FruitCard key={fruit.id} fruit={fruit} priority={index < 4} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No fruits in this rotation"
            description="Check the other dealer or come back after the next refresh."
          />
        )}
        {status === "stale" && (
          <button
            className="button button-secondary stale-retry"
            onClick={refresh}
            disabled={isRefreshing}
          >
            <RotateCw size={15} />
            {isRefreshing ? "Checking stock…" : "Check stock again"}
          </button>
        )}
        <div className="stock-bottom-note">
          <span>
            <Info size={14} aria-hidden="true" />
            Demo mode · Stock and prices are sample data.
          </span>
          <Link href="/history">
            <Clock3 size={14} aria-hidden="true" />
            View previous rotations
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <Link href="/fruits" className="directory-callout">
        <div>
          <span className="eyebrow">GET TO KNOW YOUR FRUITS</span>
          <h2>A whole collection to explore.</h2>
          <p>Compare rarities, check prices, and find your next main.</p>
        </div>
        <span className="button button-secondary">
          Browse fruit directory
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </Link>
    </>
  );
}
