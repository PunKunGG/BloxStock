import "server-only";
import { mockFruits } from "@/data/fruits";
import {
  createMockHistory,
  createMockRotation,
  resolveRotation,
} from "@/lib/mock-provider";
import { filterStockHistory } from "@/lib/history/filters";
import type { DataProvider } from "@/lib/providers/types";

export const mockDataProvider: DataProvider = {
  async getFruits() {
    return [...mockFruits];
  },
  async getFruit(slug) {
    return mockFruits.find((fruit) => fruit.slug === slug);
  },
  async getCurrentStock(dealer, now) {
    return resolveRotation(createMockRotation(dealer, now));
  },
  async getStockHistory(filters, now) {
    return filterStockHistory(createMockHistory(now), filters);
  },
};
