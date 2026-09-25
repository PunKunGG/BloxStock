import type { Dealer } from "@/types/stock";

export const DEALERS: Record<
  Dealer,
  { name: string; shortName: string; intervalHours: number }
> = {
  normal: { name: "Normal Dealer", shortName: "Normal", intervalHours: 4 },
  mirage: { name: "Mirage Dealer", shortName: "Mirage", intervalHours: 2 },
};
