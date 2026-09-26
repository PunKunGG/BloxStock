import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const preload = new URL("./support/empty-supabase-fetch.mjs", import.meta.url)
  .href;
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3001",
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      // Next workers inherit NODE_OPTIONS so the fixture remains active in every worker.
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --import=${JSON.stringify(preload)}`,
      DATA_PROVIDER: "supabase",
      SUPABASE_URL: "https://empty-database.invalid",
      SUPABASE_SECRET_KEY: "sb_secret_fixture_only_not_a_real_credential",
      BLOXSTOCK_TEST_DIST: "1",
    },
  },
);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
