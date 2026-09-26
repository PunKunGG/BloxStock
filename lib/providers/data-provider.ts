import "server-only";
import { cache } from "react";
import {
  getProviderName,
  getSupabaseConfig,
  type ProviderEnvironment,
} from "@/lib/providers/config";
import type { DataProvider } from "@/lib/providers/types";

export async function createDataProvider(
  env: ProviderEnvironment,
): Promise<DataProvider> {
  if (getProviderName(env) === "mock") {
    return (await import("@/lib/providers/mock")).mockDataProvider;
  }
  const config = getSupabaseConfig(env);
  const [
    { createServerSupabaseClient },
    { createSupabaseRepository },
    { createSupabaseDataProvider },
  ] = await Promise.all([
    import("@/lib/supabase/server"),
    import("@/lib/supabase/repository"),
    import("@/lib/providers/supabase"),
  ]);
  return createSupabaseDataProvider(
    createSupabaseRepository(createServerSupabaseClient(config)),
  );
}

export const getDataProvider = cache(() => createDataProvider(process.env));

// Presentation receives only a demo flag, never database configuration or credentials.
export function isDemoData() {
  return getProviderName(process.env) === "mock";
}
