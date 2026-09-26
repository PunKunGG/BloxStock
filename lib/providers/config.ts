export type ProviderName = "mock" | "supabase";
export type ProviderEnvironment = {
  [key: string]: string | undefined;
  DATA_PROVIDER?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
};

export function getProviderName(env: ProviderEnvironment): ProviderName {
  const value = env.DATA_PROVIDER ?? "mock";
  if (value !== "mock" && value !== "supabase") {
    throw new Error("Invalid DATA_PROVIDER. Expected mock or supabase.");
  }
  return value;
}

export function getSupabaseConfig(env: ProviderEnvironment) {
  const url = env.SUPABASE_URL?.trim();
  const secretKey = env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secretKey) {
    throw new Error(
      "DATA_PROVIDER=supabase requires SUPABASE_URL and SUPABASE_SECRET_KEY on the server.",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "Invalid SUPABASE_URL. Expected an HTTPS project origin (or a local Supabase HTTP origin).",
    );
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (
    (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    parsed.pathname !== "/"
  ) {
    throw new Error(
      "Invalid SUPABASE_URL. Use only the project origin, without credentials, query parameters, or paths.",
    );
  }
  // Modern secret keys only. A publishable/anon key cannot access this private schema.
  if (!/^sb_secret_[A-Za-z0-9_-]{20,}$/.test(secretKey)) {
    throw new Error(
      "Invalid SUPABASE_SECRET_KEY. Use a server-side sb_secret_ key, never a publishable or anon key.",
    );
  }
  return { url: parsed.origin, secretKey };
}
