import { Banknote, Gem } from "lucide-react";
import { formatMoney, formatNumber } from "@/lib/utils";
import type { Fruit } from "@/types/fruit";

export function FruitPrice({ fruit }: { fruit: Fruit }) {
  return (
    <div className="fruit-price">
      <span className="money-price">
        <Banknote size={16} aria-hidden="true" />
        {formatMoney(fruit.moneyPrice)}
      </span>
      {fruit.robuxPrice !== null && (
        <span className="robux-price">
          <Gem size={13} aria-hidden="true" />
          {formatNumber(fruit.robuxPrice)} <span>Robux</span>
        </span>
      )}
    </div>
  );
}
