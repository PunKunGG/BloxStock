import type { Metadata } from "next";
import { Clock3 } from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { HistoryBrowser } from "@/components/history/history-browser";
import { getStockHistory } from "@/lib/history/getStockHistory";
import { getFruits } from "@/lib/fruits/getFruits";
import { isDemoData } from "@/lib/providers/data-provider";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Stock History",
  description:
    "Browse previous Blox Fruits dealer rotations and filter by fruit, dealer, and date.",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ fruit?: string; dealer?: string }>;
}) {
  const [rotations, catalog, params] = await Promise.all([
    getStockHistory(),
    getFruits(),
    searchParams,
  ]);
  // Retired fruits still need working filters when they appear in stored history.
  const fruits = [
    ...new Map(
      [...catalog, ...rotations.flatMap((rotation) => rotation.fruits)].map(
        (fruit) => [fruit.id, fruit],
      ),
    ).values(),
  ];
  const fruitId = fruits.some((fruit) => fruit.id === params.fruit)
    ? params.fruit
    : "";
  const dealer = params.dealer === "mirage" ? "mirage" : "normal";
  return (
    <>
      <PageHeading
        eyebrow="A LOOK AT PAST ROTATIONS"
        title="Stock history."
        description="Missed a refresh? See what’s been on the shelves."
      >
        <div className="page-stat">
          <Clock3 size={22} aria-hidden="true" />
          <div>
            <strong>7 days</strong>
            <span>
              {isDemoData() ? "of sample rotations" : "of stored rotations"}
            </span>
          </div>
        </div>
      </PageHeading>
      <HistoryBrowser
        key={`${dealer}-${fruitId}`}
        rotations={rotations}
        fruits={fruits}
        initialDealer={dealer}
        initialFruitId={fruitId}
        isDemo={isDemoData()}
      />
    </>
  );
}
