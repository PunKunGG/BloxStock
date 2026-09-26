import "server-only";
import { cache } from "react";
import { getDataProvider } from "@/lib/providers/data-provider";
import type { Fruit } from "@/types/fruit";

export const getFruits = cache(async (): Promise<Fruit[]> => {
  return (await getDataProvider()).getFruits();
});

export const getFruit = cache(
  async (slug: string): Promise<Fruit | undefined> => {
    return (await getDataProvider()).getFruit(slug);
  },
);
