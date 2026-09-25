import type { Fruit, Rarity } from "@/types/fruit";

export function filterFruits(
  fruits: readonly Fruit[],
  search: string,
  rarity: Rarity | "All",
) {
  const query = search.trim().toLowerCase();
  return fruits.filter(
    (fruit) =>
      fruit.name.toLowerCase().includes(query) &&
      (rarity === "All" || fruit.rarity === rarity),
  );
}

export const isRareHighlight = (fruit: Fruit) =>
  fruit.rarity === "Legendary" || fruit.rarity === "Mythical";
