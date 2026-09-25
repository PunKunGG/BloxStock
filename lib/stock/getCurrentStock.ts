import "server-only";
import { createMockRotation, resolveRotation } from "@/lib/mock-provider";
import type { Dealer, DealerStocks, StockRotationView } from "@/types/stock";

export async function getCurrentStock(
  dealer: Dealer,
  now = Date.now(),
): Promise<StockRotationView> {
  return resolveRotation(createMockRotation(dealer, now));
}

export async function getDealerStocks(now = Date.now()): Promise<DealerStocks> {
  const [normal, mirage] = await Promise.all([
    getCurrentStock("normal", now),
    getCurrentStock("mirage", now),
  ]);
  return { normal, mirage };
}
