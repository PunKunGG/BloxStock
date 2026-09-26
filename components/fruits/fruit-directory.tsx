"use client";

import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { FruitCard } from "@/components/fruits/fruit-card";
import { EmptyState } from "@/components/ui/empty-state";
import { filterFruits } from "@/lib/fruits/filters";
import { cn } from "@/lib/utils";
import { RARITIES, type Fruit, type Rarity } from "@/types/fruit";

export function FruitDirectory({ fruits }: { fruits: Fruit[] }) {
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<Rarity | "All">("All");
  const filtered = filterFruits(fruits, search, rarity);
  const reset = () => {
    setSearch("");
    setRarity("All");
  };

  return (
    <section aria-label="Fruit directory">
      <div className="directory-controls">
        <div className="search-field">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search fruits"
            placeholder="Search fruits..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="icon-button"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <span className="catalog-count">
          <SlidersHorizontal size={15} aria-hidden="true" />
          Find your next favorite
        </span>
      </div>
      <div className="filter-row" aria-label="Filter by rarity">
        <span className="filter-label">Rarity</span>
        {(["All", ...RARITIES] as const).map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setRarity(value)}
            aria-pressed={rarity === value}
            className={cn(
              "filter-chip",
              rarity === value && "selected",
              value !== "All" && `filter-${value.toLowerCase()}`,
            )}
          >
            {value !== "All" && <span className="rarity-filter-dot" />}
            {value}
          </button>
        ))}
      </div>
      <div className="section-heading">
        <h2>
          Explore fruits <span className="count-badge">{filtered.length}</span>
        </h2>
        <span className="muted" role="status">
          Showing {filtered.length} of {fruits.length} fruits
        </span>
      </div>
      {filtered.length ? (
        <div className="fruit-grid">
          {filtered.map((fruit, index) => (
            <FruitCard key={fruit.id} fruit={fruit} priority={index < 4} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={fruits.length ? "No fruits found" : "Fruit catalog is empty"}
          description={
            fruits.length
              ? "Try another name or a different rarity."
              : "No fruit metadata has been imported yet."
          }
          action={
            fruits.length > 0 && (
              <button className="button button-primary" onClick={reset}>
                Clear filters
              </button>
            )
          }
        />
      )}
    </section>
  );
}
