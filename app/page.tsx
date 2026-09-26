import { StockDashboard } from "@/components/stock/stock-dashboard";
import { getDealerStocks } from "@/lib/stock/getCurrentStock";
import { getRequestTime } from "@/lib/request-time";
import { isDemoData } from "@/lib/providers/data-provider";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const now = await getRequestTime();
  const stocks = await getDealerStocks(now);
  return (
    <StockDashboard stocks={stocks} initialNow={now} isDemo={isDemoData()} />
  );
}
