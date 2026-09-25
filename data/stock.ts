import type { Dealer } from "@/types/stock";

// ID references keep catalog information in one place.
export const mockStockPatterns: Record<Dealer, readonly (readonly string[])[]> =
  {
    normal: [
      ["rocket", "spin", "smoke", "flame", "ice", "dark", "light", "portal"],
      ["rocket", "bomb", "smoke", "flame", "ice", "dark", "magma", "buddha"],
      ["rocket", "spin", "smoke", "flame", "ice", "light", "magma", "portal"],
    ],
    mirage: [
      [
        "spin",
        "flame",
        "light",
        "magma",
        "buddha",
        "portal",
        "kitsune",
        "dragon",
      ],
      [
        "rocket",
        "smoke",
        "ice",
        "dark",
        "magma",
        "buddha",
        "portal",
        "leopard",
      ],
      [
        "bomb",
        "flame",
        "ice",
        "light",
        "magma",
        "portal",
        "leopard",
        "kitsune",
      ],
    ],
  };
