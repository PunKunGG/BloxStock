import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import {
  createSupabaseRepository,
  historyWindow,
} from "@/lib/supabase/repository";
import { createSupabaseDataProvider } from "@/lib/providers/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { fruitRow, rotationRow, NOW } from "./supabase-fixtures";

function transport(handler: (url: URL, call: number) => unknown, status = 200) {
  const requests: URL[] = [];
  const client = createClient<Database>(
    "https://empty-database.invalid",
    "sb_secret_fixture_only_not_a_real_credential",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: async (input) => {
          const url = new URL(
            input instanceof Request ? input.url : String(input),
          );
          requests.push(url);
          return new Response(JSON.stringify(handler(url, requests.length)), {
            status,
            headers: { "Content-Type": "application/json" },
          });
        },
      },
    },
  );
  return { requests, repository: createSupabaseRepository(client) };
}

test("the real Supabase query builder handles empty tables without fabricating stock", async () => {
  const { repository, requests } = transport(() => []);
  const provider = createSupabaseDataProvider(repository);
  assert.deepEqual(await provider.getFruits(), []);
  assert.equal(
    (await provider.getCurrentStock("normal", NOW)).status,
    "unavailable",
  );
  assert.equal(
    (await provider.getCurrentStock("mirage", NOW)).status,
    "unavailable",
  );
  assert.deepEqual(await provider.getStockHistory({}, NOW), []);
  assert.equal(requests.length, 4);
});

test("catalog queries only active metadata in stable order", async () => {
  const { repository, requests } = transport(() => [fruitRow]);
  assert.equal((await repository.getFruits())[0].id, fruitRow.id);
  assert.equal(requests[0].searchParams.get("active"), "eq.true");
  assert.equal(
    requests[0].searchParams.get("order"),
    "money_price.asc,slug.asc",
  );
});

test("historical fruit detail links resolve inactive catalog entries and unknown slugs remain missing", async () => {
  const { repository, requests } = transport(() => [
    { ...fruitRow, active: false },
  ]);
  const provider = createSupabaseDataProvider(repository);
  assert.equal((await provider.getFruit(fruitRow.slug))?.id, fruitRow.id);
  assert.equal(requests[0].searchParams.get("slug"), `eq.${fruitRow.slug}`);
  assert.equal(requests[0].searchParams.has("active"), false);
  assert.equal(
    await createSupabaseDataProvider(transport(() => []).repository).getFruit(
      "missing",
    ),
    undefined,
  );
});

test("latest stock queries exclude future slots, join fruits, and order by slot before fetch time", async () => {
  const { repository, requests } = transport(() => [rotationRow()]);
  assert.ok(await repository.getLatestRotation("normal", NOW));
  const query = requests[0].searchParams;
  assert.equal(query.get("dealer"), "eq.normal");
  assert.equal(
    query.get("rotation_start"),
    `lte.${new Date(NOW).toISOString()}`,
  );
  assert.equal(
    query.get("order"),
    "rotation_start.desc,fetched_at.desc,id.desc",
  );
  assert.equal(query.get("limit"), "1");
  assert.ok(
    query.get("select")?.includes("stock_items(fruit_id,position,fruits("),
  );
  assert.equal(query.get("select")?.includes("raw_payload"), false);
  await repository.getLatestRotation("normal", NOW, true);
  assert.equal(requests[1].searchParams.get("status"), "in.(live,stale)");
});

test("history combines dealer/fruit/ICT date filters and retrieves full rotations in one query", async () => {
  const { repository, requests } = transport(() => [rotationRow()]);
  const filters = {
    dealer: "normal" as const,
    fruitId: fruitRow.id,
    date: "2026-09-26",
  };
  const rows = await repository.getHistory(filters, NOW);
  assert.equal(rows[0].stock_items[0].fruits?.id, fruitRow.id);
  assert.equal(requests.length, 1);
  const query = requests[0].searchParams;
  assert.deepEqual(query.getAll("rotation_start"), [
    "gte.2026-09-25T17:00:00.000Z",
    "lt.2026-09-26T17:00:00.000Z",
  ]);
  assert.equal(query.get("rotation_end"), `lte.${new Date(NOW).toISOString()}`);
  assert.equal(query.get("matched_items.fruit_id"), `eq.${fruitRow.id}`);
  assert.ok(
    query.get("select")?.includes("matched_items:stock_items!inner(fruit_id)"),
  );
  assert.ok(
    query.get("select")?.includes("stock_items(fruit_id,position,fruits("),
  );
  assert.equal(query.get("status"), "in.(live,stale)");
});

test("history paginates large joined result sets without per-rotation lookups", async () => {
  const { repository, requests } = transport((_url, call) =>
    call === 1
      ? Array.from({ length: 500 }, (_, index) =>
          rotationRow({ id: `fixture-${index}` }),
        )
      : [rotationRow({ id: "last-fixture" })],
  );
  assert.equal((await repository.getHistory({}, NOW)).length, 501);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].searchParams.get("offset"), "500");
});

test("query failures remain actionable and do not expose the upstream error body", async () => {
  const { repository } = transport(
    () => ({
      code: "42501",
      message: "sensitive upstream details",
      hint: "private hint",
    }),
    403,
  );
  await assert.rejects(
    repository.getFruits(),
    (error: unknown) =>
      error instanceof Error &&
      error.message.includes("42501") &&
      !error.message.includes("sensitive") &&
      !error.message.includes("private hint"),
  );
});

test("server client disables caching and sends the key only to the database transport", async (t) => {
  const key = "sb_secret_fixture_only_not_a_real_credential";
  t.mock.method(
    globalThis,
    "fetch",
    async (_input: RequestInfo | URL, init?: RequestInit) => {
      assert.equal(init?.cache, "no-store");
      assert.ok(init?.signal);
      assert.equal(new Headers(init?.headers).get("apikey"), key);
      return new Response("[]", {
        headers: { "Content-Type": "application/json" },
      });
    },
  );
  const client = createServerSupabaseClient({
    url: "https://empty-database.invalid",
    secretKey: key,
  });
  assert.deepEqual(await createSupabaseRepository(client).getFruits(), []);
});

test("history date validation handles midnight in Bangkok and rejects impossible dates", () => {
  assert.equal(
    historyWindow({ date: "2026-09-26" }, NOW).start,
    "2026-09-25T17:00:00.000Z",
  );
  for (const date of ["2026-02-30", "yesterday", "2026-13-01"])
    assert.throws(() => historyWindow({ date }, NOW), /Invalid history date/);
});
