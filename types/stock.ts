import type { Fruit } from "@/types/fruit";

export type Dealer = "normal" | "mirage";
export type StockState = "live" | "stale" | "unavailable";

export interface StockRotation {
  id: string;
  dealer: Dealer;
  fruitIds: string[];
  observedAt: string;
  updatedAt: string;
  expiresAt: string;
  status: StockState;
}

export interface StockRotationView extends Omit<StockRotation, "fruitIds"> {
  fruits: Fruit[];
}

export type DealerStocks = Record<Dealer, StockRotationView>;

export interface HistoryFilters {
  dealer?: Dealer;
  fruitId?: string;
  date?: string;
}
