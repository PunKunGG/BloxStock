import type { NextConfig } from "next";
import { getProviderName, getSupabaseConfig } from "./lib/providers/config";

if (getProviderName(process.env) === "supabase") getSupabaseConfig(process.env);

const nextConfig: NextConfig = {
  devIndicators: false,
  // Keep the offline database UI check isolated from the normal development server.
  ...(process.env.BLOXSTOCK_TEST_DIST === "1"
    ? { distDir: ".next-empty-test" }
    : {}),
};
export default nextConfig;
