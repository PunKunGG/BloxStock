import "server-only";
import { mockFruits } from "@/data/fruits";
import type { Fruit } from "@/types/fruit";

// Replace this implementation with a catalog API or database without changing UI props.
export async function getFruits(): Promise<Fruit[]> {
  return [...mockFruits];
}

export async function getFruit(slug: string): Promise<Fruit | undefined> {
  return (await getFruits()).find((fruit) => fruit.slug === slug);
}
