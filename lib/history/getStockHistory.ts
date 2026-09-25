import "server-only";
import { createMockHistory } from "@/lib/mock-provider";
import { filterStockHistory } from "@/lib/history/filters";
import type { HistoryFilters, StockRotationView } from "@/types/stock";

export async function getStockHistory(
  filters: HistoryFilters = {},
  now = Date.now(),
): Promise<StockRotationView[]> {
  return filterStockHistory(createMockHistory(now), filters);
}
