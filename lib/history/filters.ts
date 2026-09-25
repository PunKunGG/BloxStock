import type { HistoryFilters, StockRotationView } from "@/types/stock";
import { dateKey } from "@/lib/utils";

export function filterStockHistory(
  rotations: StockRotationView[],
  filters: HistoryFilters,
) {
  return rotations.filter(
    (rotation) =>
      (!filters.dealer || rotation.dealer === filters.dealer) &&
      (!filters.fruitId ||
        rotation.fruits.some((fruit) => fruit.id === filters.fruitId)) &&
      (!filters.date || dateKey(rotation.observedAt) === filters.date),
  );
}
