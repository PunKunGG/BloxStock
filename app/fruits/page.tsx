import type { Metadata } from "next";
import { Apple } from "lucide-react";
import { FruitDirectory } from "@/components/fruits/fruit-directory";
import { PageHeading } from "@/components/ui/page-heading";
import { getFruits } from "@/lib/fruits/getFruits";
import { isDemoData } from "@/lib/providers/data-provider";

export const metadata: Metadata = {
  title: "Fruit Directory",
  description:
    "Explore the BloxStock sample fruit catalog. Search by name and compare fruit rarities and prices.",
};

export default async function FruitsPage() {
  const fruits = await getFruits();
  return (
    <>
      <PageHeading
        eyebrow="FIND YOUR NEXT MAIN"
        title="The fruit directory."
        description="Every fruit has its own potential. Find the one that’s right for you."
      >
        <div className="page-stat">
          <Apple size={22} aria-hidden="true" />
          <div>
            <strong>{fruits.length}</strong>
            <span>fruits to discover</span>
          </div>
        </div>
      </PageHeading>
      <FruitDirectory fruits={fruits} />
      <p className="page-footnote">
        {isDemoData()
          ? "Prototype catalog · Prices and classifications are sample data."
          : "Catalog records will appear after verified fruit metadata is imported."}
      </p>
    </>
  );
}
