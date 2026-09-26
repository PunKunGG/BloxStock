import { RARITIES, type Fruit, type FruitType } from "@/types/fruit";
import type { Dealer, StockRotationView, StockState } from "@/types/stock";
import type { FruitRow, RotationRow } from "@/lib/supabase/rows";

function member<T extends string>(
  value: string,
  choices: readonly T[],
  field: string,
): T {
  const result = choices.find((choice) => choice === value);
  if (!result) throw new Error(`Invalid database ${field}.`);
  return result;
}

function nonnegativeInteger(value: number, field: string) {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new Error(`Invalid database ${field}.`);
  return value;
}

function timestamp(value: string) {
  if (!Number.isFinite(Date.parse(value)))
    throw new Error("Invalid database timestamp.");
  return new Date(value).toISOString();
}

export function mapFruitRow(row: FruitRow): Fruit {
  if (
    ![row.id, row.slug, row.name, row.image].every(
      (value) => typeof value === "string" && value.trim(),
    )
  ) {
    throw new Error("Incomplete database fruit metadata.");
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image,
    rarity: member(row.rarity, RARITIES, "rarity"),
    type: member<FruitType>(
      row.type,
      ["Natural", "Elemental", "Beast"],
      "fruit type",
    ),
    moneyPrice: nonnegativeInteger(row.money_price, "money price"),
    robuxPrice:
      row.robux_price === null
        ? null
        : nonnegativeInteger(row.robux_price, "Robux price"),
  };
}

export function mapRotationRow(row: RotationRow): StockRotationView {
  const observedAt = timestamp(row.rotation_start);
  const expiresAt = timestamp(row.rotation_end);
  if (Date.parse(expiresAt) <= Date.parse(observedAt))
    throw new Error("Invalid database rotation window.");
  const status = member<StockState>(
    row.status,
    ["live", "stale", "unavailable"],
    "stock status",
  );
  const seen = new Set<string>();
  const fruits =
    status === "unavailable"
      ? []
      : [...row.stock_items]
          .sort(
            (a, b) =>
              a.position - b.position || a.fruit_id.localeCompare(b.fruit_id),
          )
          .map((item) => {
            nonnegativeInteger(item.position, "stock position");
            if (
              !item.fruits ||
              item.fruits.id !== item.fruit_id ||
              seen.has(item.fruit_id)
            )
              throw new Error("Invalid database stock fruit reference.");
            seen.add(item.fruit_id);
            return mapFruitRow(item.fruits);
          });
  return {
    id: row.id,
    dealer: member<Dealer>(row.dealer, ["normal", "mirage"], "dealer"),
    observedAt,
    expiresAt,
    updatedAt: timestamp(row.fetched_at),
    status,
    fruits,
  };
}

// Absence marker, never a fabricated observed rotation. The UI hides its timestamps.
export function unavailableStock(dealer: Dealer): StockRotationView {
  const absent = "1970-01-01T00:00:00.000Z";
  return {
    id: `unavailable:${dealer}`,
    dealer,
    observedAt: absent,
    expiresAt: absent,
    updatedAt: absent,
    status: "unavailable",
    fruits: [],
  };
}

export function applyStockFreshness(
  stock: StockRotationView,
  now: number,
  latestFailed = false,
): StockRotationView {
  if (stock.status === "unavailable") return { ...stock, fruits: [] };
  return {
    ...stock,
    status:
      latestFailed ||
      stock.status === "stale" ||
      Date.parse(stock.expiresAt) <= now
        ? "stale"
        : "live",
  };
}
