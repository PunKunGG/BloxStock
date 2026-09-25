import type { Metadata } from "next";
import { Clock3 } from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { HistoryBrowser } from "@/components/history/history-browser";
import { getStockHistory } from "@/lib/history/getStockHistory";
import { getFruits } from "@/lib/fruits/getFruits";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Stock History",
  description:
    "Browse previous sample Blox Fruits dealer rotations and filter by fruit, dealer, and date.",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ fruit?: string; dealer?: string }>;
}) {
  const [rotations, fruits, params] = await Promise.all([
    getStockHistory(),
    getFruits(),
    searchParams,
  ]);
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
            <span>of sample rotations</span>
          </div>
        </div>
      </PageHeading>
      <HistoryBrowser
        key={`${dealer}-${fruitId}`}
        rotations={rotations}
        fruits={fruits}
        initialDealer={dealer}
        initialFruitId={fruitId}
      />
    </>
  );
}
