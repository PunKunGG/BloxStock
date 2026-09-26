import type { Fruit } from "@/types/fruit";
import type { Dealer, HistoryFilters, StockRotationView } from "@/types/stock";

export interface DataProvider {
  getFruits(): Promise<Fruit[]>;
  getFruit(slug: string): Promise<Fruit | undefined>;
  getCurrentStock(dealer: Dealer, now: number): Promise<StockRotationView>;
  getStockHistory(
    filters: HistoryFilters,
    now: number,
  ): Promise<StockRotationView[]>;
}
