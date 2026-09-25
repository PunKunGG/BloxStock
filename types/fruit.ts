export const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Legendary",
  "Mythical",
] as const;
export type Rarity = (typeof RARITIES)[number];
export type FruitType = "Natural" | "Elemental" | "Beast";

export interface Fruit {
  id: string;
  slug: string;
  name: string;
  rarity: Rarity;
  moneyPrice: number;
  robuxPrice: number | null;
  image: string;
  type: FruitType;
}
