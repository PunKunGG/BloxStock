import type { FruitRow, RotationRow } from "@/lib/supabase/rows";

// Isolated synthetic test records. Never imported by application code or migrations.
export const NOW = Date.parse("2026-09-26T09:00:00Z");
export const fruitRow: FruitRow = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "fixture-fruit",
  name: "Fixture Fruit",
  rarity: "Legendary",
  type: "Natural",
  money_price: 12345,
  robux_price: null,
  image: "/fruits/portal.webp",
  active: true,
  created_at: "2026-09-25T00:00:00Z",
  updated_at: "2026-09-25T00:00:00Z",
};

export function rotationRow(overrides: Partial<RotationRow> = {}): RotationRow {
  return {
    id: "00000000-0000-4000-8000-000000000002",
    dealer: "normal",
    rotation_start: "2026-09-26T08:00:00Z",
    rotation_end: "2026-09-26T12:00:00Z",
    fetched_at: "2026-09-26T08:02:00Z",
    status: "live",
    stock_items: [{ fruit_id: fruitRow.id, position: 0, fruits: fruitRow }],
    ...overrides,
  };
}
