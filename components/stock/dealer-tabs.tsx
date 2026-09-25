"use client";

import { Store, Palmtree } from "lucide-react";
import { DEALERS } from "@/lib/stock/config";
import { cn } from "@/lib/utils";
import type { Dealer } from "@/types/stock";

export function DealerTabs({
  value,
  onChange,
}: {
  value: Dealer;
  onChange: (dealer: Dealer) => void;
}) {
  return (
    <div className="dealer-tabs" role="group" aria-label="Select dealer">
      {(["normal", "mirage"] as const).map((dealer) => {
        const Icon = dealer === "normal" ? Store : Palmtree;
        return (
          <button
            key={dealer}
            type="button"
            aria-pressed={dealer === value}
            onClick={() => onChange(dealer)}
            className={cn("dealer-tab", value === dealer && "selected")}
          >
            <Icon size={17} aria-hidden="true" />
            {DEALERS[dealer].name}
          </button>
        );
      })}
    </div>
  );
}
