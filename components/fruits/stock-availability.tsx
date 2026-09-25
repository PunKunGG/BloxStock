"use client";

import { Check, Minus, Store, Palmtree, TriangleAlert } from "lucide-react";
import { useStockClock } from "@/components/stock/use-stock-clock";
import { DEALERS } from "@/lib/stock/config";
import type { DealerStocks } from "@/types/stock";

export function StockAvailability({
  fruitId,
  stocks,
  initialNow,
}: {
  fruitId: string;
  stocks: DealerStocks;
  initialNow: number;
}) {
  const expiry = [stocks.normal.expiresAt, stocks.mirage.expiresAt].sort()[0];
  const { now } = useStockClock(initialNow, expiry);
  return (
    <div className="availability">
      <h2>
        Current stock status <span className="sample-tag">SAMPLE</span>
      </h2>
      <div className="availability-dealers">
        {(["normal", "mirage"] as const).map((dealer) => {
          const rotation = stocks[dealer];
          const inStock = rotation.fruits.some((fruit) => fruit.id === fruitId);
          const verified =
            rotation.status === "live" && now < Date.parse(rotation.expiresAt);
          const DealerIcon = dealer === "normal" ? Store : Palmtree;
          const StatusIcon = !verified
            ? TriangleAlert
            : inStock
              ? Check
              : Minus;
          return (
            <div key={dealer}>
              <span>
                <DealerIcon size={17} aria-hidden="true" />
                {DEALERS[dealer].name}
              </span>
              <span
                className={
                  !verified
                    ? "stock-unknown"
                    : inStock
                      ? "in-stock"
                      : "out-of-stock"
                }
              >
                <StatusIcon size={14} aria-hidden="true" />
                {!verified
                  ? "Unverified"
                  : inStock
                    ? "In stock"
                    : "Not in stock"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
