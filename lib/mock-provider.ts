import { mockFruits } from "@/data/fruits";
import { mockStockPatterns } from "@/data/stock";
import { MOCK_HISTORY_DAYS } from "@/data/history";
import { DEALERS } from "@/lib/stock/config";
import type { Dealer, StockRotation, StockRotationView } from "@/types/stock";

const fruitById = new Map(mockFruits.map((fruit) => [fruit.id, fruit]));

export function resolveRotation(rotation: StockRotation): StockRotationView {
  const { fruitIds, ...rest } = rotation;
  return {
    ...rest,
    fruits: fruitIds.map((id) => {
      const fruit = fruitById.get(id);
      if (!fruit) throw new Error(`Unknown fruit reference: ${id}`);
      return fruit;
    }),
  };
}

export function createMockRotation(
  dealer: Dealer,
  now: number,
  offset = 0,
): StockRotation {
  const interval = DEALERS[dealer].intervalHours * 3600000;
  const slot = Math.floor(now / interval) - offset;
  const start = slot * interval;
  const patterns = mockStockPatterns[dealer];
  return {
    id: `${dealer}-${slot}`,
    dealer,
    fruitIds: [
      ...patterns[
        ((slot % patterns.length) + patterns.length) % patterns.length
      ],
    ],
    observedAt: new Date(start).toISOString(),
    updatedAt: new Date(
      offset === 0 ? Math.max(start, now - 120000) : start,
    ).toISOString(),
    expiresAt: new Date(start + interval).toISOString(),
    status: "live",
  };
}

export function createMockHistory(now: number): StockRotationView[] {
  return (["normal", "mirage"] as const)
    .flatMap((dealer) =>
      Array.from(
        { length: (MOCK_HISTORY_DAYS * 24) / DEALERS[dealer].intervalHours },
        (_, index) =>
          resolveRotation(createMockRotation(dealer, now, index + 1)),
      ),
    )
    .sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt));
}
