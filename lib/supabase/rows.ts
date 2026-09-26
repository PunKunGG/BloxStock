import type { Tables } from "@/types/database";

export type FruitRow = Tables<"fruits">;
export type RotationRow = Pick<
  Tables<"stock_rotations">,
  "id" | "dealer" | "rotation_start" | "rotation_end" | "fetched_at" | "status"
> & {
  stock_items: {
    fruit_id: string;
    position: number;
    fruits: FruitRow | null;
  }[];
};
