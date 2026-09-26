import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Dealer, HistoryFilters } from "@/types/stock";
import type { FruitRow, RotationRow } from "@/lib/supabase/rows";

export interface StockRepository {
  getFruits(): Promise<FruitRow[]>;
  getFruit(slug: string): Promise<FruitRow | null>;
  getLatestRotation(
    dealer: Dealer,
    now: number,
    knownGoodOnly?: boolean,
  ): Promise<RotationRow | null>;
  getHistory(filters: HistoryFilters, now: number): Promise<RotationRow[]>;
}

// Explicit projection keeps raw_payload, sync errors, and operational metadata off UI props.
export const FRUIT_COLUMNS =
  "id,slug,name,rarity,type,money_price,robux_price,image,active,created_at,updated_at";
export const ROTATION_COLUMNS = `id,dealer,rotation_start,rotation_end,fetched_at,status,stock_items(fruit_id,position,fruits(${FRUIT_COLUMNS}))`;
const PAGE_SIZE = 500;

function queryError(operation: string, error: { code?: string }) {
  const code =
    error.code && /^[A-Za-z0-9_-]+$/.test(error.code) ? ` (${error.code})` : "";
  // Do not include upstream response bodies or credentials in thrown errors.
  return new Error(
    `Supabase ${operation} failed${code}. Check server credentials, migrations, grants, and Data API configuration.`,
  );
}

export function historyWindow(filters: HistoryFilters, now: number) {
  if (!filters.date)
    return {
      start: new Date(now - 7 * 86400000).toISOString(),
      end: new Date(now).toISOString(),
    };
  const start = Date.parse(`${filters.date}T00:00:00+07:00`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(filters.date) ||
    !Number.isFinite(start) ||
    new Date(start + 7 * 3600000).toISOString().slice(0, 10) !== filters.date
  ) {
    throw new Error(
      "Invalid history date. Expected a valid YYYY-MM-DD date in Asia/Bangkok.",
    );
  }
  return {
    start: new Date(start).toISOString(),
    end: new Date(start + 86400000).toISOString(),
  };
}

export function createSupabaseRepository(
  client: SupabaseClient<Database>,
): StockRepository {
  return {
    async getFruits() {
      const fruits: FruitRow[] = [];
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const { data, error } = await client
          .from("fruits")
          .select(FRUIT_COLUMNS)
          .eq("active", true)
          .order("money_price")
          .order("slug")
          .range(offset, offset + PAGE_SIZE - 1);
        if (error) throw queryError("catalog query", error);
        fruits.push(...(data ?? []));
        if (!data || data.length < PAGE_SIZE) return fruits;
      }
    },
    async getFruit(slug) {
      // Inactive fruits remain addressable from historical rotation links.
      const { data, error } = await client
        .from("fruits")
        .select(FRUIT_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw queryError("fruit detail query", error);
      return data;
    },
    async getLatestRotation(dealer, now, knownGoodOnly = false) {
      let query = client
        .from("stock_rotations")
        .select(ROTATION_COLUMNS)
        .eq("dealer", dealer)
        .lte("rotation_start", new Date(now).toISOString())
        .order("rotation_start", { ascending: false })
        .order("fetched_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(1);
      if (knownGoodOnly) query = query.in("status", ["live", "stale"]);
      const { data, error } = await query.maybeSingle();
      if (error) throw queryError("current stock query", error);
      return data;
    },
    async getHistory(filters, now) {
      const window = historyWindow(filters, now);
      const rotations: RotationRow[] = [];
      for (let offset = 0; ; offset += PAGE_SIZE) {
        // A second embedding filters parent rotations while keeping their full item lists.
        const table = client.from("stock_rotations");
        const selection = filters.fruitId
          ? table.select(
              `${ROTATION_COLUMNS},matched_items:stock_items!inner(fruit_id)`,
            )
          : table.select(ROTATION_COLUMNS);
        let query = selection
          .gte("rotation_start", window.start)
          .lt("rotation_start", window.end)
          .lte("rotation_end", new Date(now).toISOString())
          .in("status", ["live", "stale"])
          .order("rotation_start", { ascending: false })
          .order("fetched_at", { ascending: false })
          .order("id", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);
        if (filters.dealer) query = query.eq("dealer", filters.dealer);
        if (filters.fruitId)
          query = query.eq("matched_items.fruit_id", filters.fruitId);
        const { data, error } = await query;
        if (error) throw queryError("history query", error);
        rotations.push(...(data ?? []));
        if (!data || data.length < PAGE_SIZE) return rotations;
      }
    },
  };
}
