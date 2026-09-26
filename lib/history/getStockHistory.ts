import "server-only";
import { getDataProvider } from "@/lib/providers/data-provider";
import type { HistoryFilters, StockRotationView } from "@/types/stock";

export async function getStockHistory(
  filters: HistoryFilters = {},
  now = Date.now(),
): Promise<StockRotationView[]> {
  return (await getDataProvider()).getStockHistory(filters, now);
}
