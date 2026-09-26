"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Filter, Info } from "lucide-react";
import { DealerTabs } from "@/components/stock/dealer-tabs";
import { HistoryEntry } from "@/components/history/history-entry";
import { EmptyState } from "@/components/ui/empty-state";
import { filterStockHistory } from "@/lib/history/filters";
import { dateKey, formatDate } from "@/lib/utils";
import type { Fruit } from "@/types/fruit";
import type { Dealer, StockRotationView } from "@/types/stock";

const PAGE_SIZE = 12;

export function HistoryBrowser({
  rotations,
  fruits,
  initialDealer = "normal",
  initialFruitId = "",
  isDemo = true,
}: {
  rotations: StockRotationView[];
  fruits: Fruit[];
  initialDealer?: Dealer;
  initialFruitId?: string;
  isDemo?: boolean;
}) {
  const [dealer, setDealer] = useState<Dealer>(initialDealer);
  const [fruitId, setFruitId] = useState(initialFruitId);
  const [date, setDate] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const filtered = filterStockHistory(rotations, { dealer, fruitId, date });
  const visible = filtered.slice(0, visibleCount);
  const dates = [
    ...new Set(
      rotations
        .filter((rotation) => rotation.dealer === dealer)
        .map((rotation) => dateKey(rotation.observedAt)),
    ),
  ];
  const groups = visible.reduce<Record<string, StockRotationView[]>>(
    (result, rotation) => {
      const key = dateKey(rotation.observedAt);
      (result[key] ??= []).push(rotation);
      return result;
    },
    {},
  );
  const reset = () => {
    setFruitId("");
    setDate("");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section aria-label="Stock rotation history">
      <div className="history-toolbar">
        <DealerTabs
          value={dealer}
          onChange={(value) => {
            setDealer(value);
            setVisibleCount(PAGE_SIZE);
          }}
        />
        <div className="history-filters">
          <label className="select-field">
            <Filter size={15} aria-hidden="true" />
            <span className="sr-only">Filter by fruit</span>
            <select
              value={fruitId}
              onChange={(event) => {
                setFruitId(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="">All fruits</option>
              {fruits.map((fruit) => (
                <option key={fruit.id} value={fruit.id}>
                  {fruit.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
          <label className="select-field">
            <CalendarDays size={15} aria-hidden="true" />
            <span className="sr-only">Filter by date</span>
            <select
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="">Last 7 days</option>
              {dates.map((value) => (
                <option key={value} value={value}>
                  {formatDate(`${value}T00:00:00+07:00`, { year: undefined })}
                </option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
        </div>
      </div>
      <div className="history-summary">
        <span role="status">
          {filtered.length} {isDemo ? "sample" : "stored"} rotation
          {filtered.length === 1 ? "" : "s"}
          {fruitId &&
            ` with ${fruits.find((fruit) => fruit.id === fruitId)?.name}`}
        </span>
        <span>All times in ICT (UTC+7)</span>
      </div>
      {filtered.length ? (
        <div className="history-timeline">
          {Object.entries(groups).map(([key, entries]) => (
            <section key={key} className="history-day">
              <h2>
                <CalendarDays size={17} aria-hidden="true" />
                {formatDate(entries[0].observedAt, {
                  month: "long",
                  year: undefined,
                })}
                <span>
                  {formatDate(entries[0].observedAt, {
                    day: undefined,
                    month: undefined,
                    year: "numeric",
                  })}
                </span>
              </h2>
              <div className="history-day-entries">
                {entries.map((rotation) => (
                  <HistoryEntry key={rotation.id} rotation={rotation} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            rotations.length ? "No rotations found" : "No stored rotations yet"
          }
          description={
            rotations.length
              ? "This fruit did not appear for the selected dealer and date. Try changing your filters."
              : "Stock history will appear after verified rotations are saved."
          }
          action={
            rotations.length > 0 && (
              <button className="button button-primary" onClick={reset}>
                Clear filters
              </button>
            )
          }
        />
      )}
      {filtered.length > visibleCount && (
        <div className="load-more">
          <button
            className="button button-secondary"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Load more rotations
            <ChevronDown size={16} />
          </button>
          <span>
            Showing {visible.length} of {filtered.length}
          </span>
        </div>
      )}
      <p className="history-disclaimer">
        <Info size={14} aria-hidden="true" />
        {isDemo
          ? "A rolling 7-day sample history. These are demonstration rotations."
          : "Stored rotations from the last 7 days. No synthetic history is generated."}
      </p>
    </section>
  );
}
