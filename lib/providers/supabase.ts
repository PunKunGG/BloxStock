import "server-only";
import type { DataProvider } from "@/lib/providers/types";
import type { StockRepository } from "@/lib/supabase/repository";
import {
  applyStockFreshness,
  mapFruitRow,
  mapRotationRow,
  unavailableStock,
} from "@/lib/supabase/mappers";

export function createSupabaseDataProvider(
  repository: StockRepository,
): DataProvider {
  return {
    async getFruits() {
      return (await repository.getFruits()).map(mapFruitRow);
    },
    async getFruit(slug) {
      const row = await repository.getFruit(slug);
      return row ? mapFruitRow(row) : undefined;
    },
    async getCurrentStock(dealer, now) {
      const latest = await repository.getLatestRotation(dealer, now);
      if (!latest) return unavailableStock(dealer);
      if (latest.status !== "unavailable")
        return applyStockFreshness(mapRotationRow(latest), now);
      const knownGood = await repository.getLatestRotation(dealer, now, true);
      return knownGood
        ? applyStockFreshness(mapRotationRow(knownGood), now, true)
        : mapRotationRow(latest);
    },
    async getStockHistory(filters, now) {
      return (await repository.getHistory(filters, now)).map(mapRotationRow);
    },
  };
}
