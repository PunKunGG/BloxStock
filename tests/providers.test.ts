import test from "node:test";
import assert from "node:assert/strict";
import { getProviderName, getSupabaseConfig } from "@/lib/providers/config";
import { createDataProvider } from "@/lib/providers/data-provider";
import { createSupabaseDataProvider } from "@/lib/providers/supabase";
import {
  applyStockFreshness,
  mapFruitRow,
  mapRotationRow,
  unavailableStock,
} from "@/lib/supabase/mappers";
import type { StockRepository } from "@/lib/supabase/repository";
import { fruitRow, rotationRow, NOW } from "./supabase-fixtures";

const TEST_SECRET = `sb_secret_${"test_fixture_only_".repeat(3)}`;
const repository = (
  overrides: Partial<StockRepository> = {},
): StockRepository => ({
  async getFruit() {
    return null;
  },
  async getFruits() {
    return [];
  },
  async getLatestRotation() {
    return null;
  },
  async getHistory() {
    return [];
  },
  ...overrides,
});

test("provider selection defaults to mock and rejects unsupported values", () => {
  assert.equal(getProviderName({}), "mock");
  assert.equal(getProviderName({ DATA_PROVIDER: "supabase" }), "supabase");
  for (const value of ["", "SUPABASE", "other", " mock"])
    assert.throws(
      () => getProviderName({ DATA_PROVIDER: value }),
      /Invalid DATA_PROVIDER/,
    );
});

test("Supabase selection validates configuration without fallback", async () => {
  await assert.rejects(
    createDataProvider({ DATA_PROVIDER: "invalid" }),
    /Invalid DATA_PROVIDER/,
  );
  for (const env of [
    {},
    { SUPABASE_URL: "https://example.supabase.co" },
    { SUPABASE_SECRET_KEY: TEST_SECRET },
  ]) {
    await assert.rejects(
      createDataProvider({ ...env, DATA_PROVIDER: "supabase" }),
      /requires SUPABASE_URL and SUPABASE_SECRET_KEY/,
    );
  }
});

test("configuration rejects unsafe URLs and public keys without echoing credentials", () => {
  for (const url of [
    "broken",
    "http://example.com",
    "https://user:password@example.com",
    "https://example.com/rest/v1",
    "https://example.com?key=private",
  ]) {
    assert.throws(
      () =>
        getSupabaseConfig({
          SUPABASE_URL: url,
          SUPABASE_SECRET_KEY: TEST_SECRET,
        }),
      /Invalid SUPABASE_URL/,
    );
  }
  for (const key of [
    "sb_publishable_fake",
    "eyJ.anon.signature",
    "sb_secret_short",
  ]) {
    assert.throws(
      () =>
        getSupabaseConfig({
          SUPABASE_URL: "https://example.supabase.co",
          SUPABASE_SECRET_KEY: key,
        }),
      (error: unknown) =>
        error instanceof Error && !error.message.includes(key),
    );
  }
  assert.equal(
    getSupabaseConfig({
      SUPABASE_URL: "http://127.0.0.1:54321/",
      SUPABASE_SECRET_KEY: TEST_SECRET,
    }).url,
    "http://127.0.0.1:54321",
  );
});

test("mock mode remains deterministic and never requires Supabase credentials", async () => {
  const provider = await createDataProvider({
    DATA_PROVIDER: "mock",
    SUPABASE_URL: "invalid",
  });
  assert.equal((await provider.getFruits()).length, 14);
  const normal = await provider.getCurrentStock("normal", NOW);
  assert.equal(normal.status, "live");
  assert.deepEqual(normal, await provider.getCurrentStock("normal", NOW));
  assert.notDeepEqual(
    normal.fruits,
    (await provider.getCurrentStock("mirage", NOW)).fruits,
  );
  assert.ok((await provider.getStockHistory({}, NOW)).length > 0);
});

test("row mapping preserves UUIDs, nullable Robux, and clean domain field names", () => {
  const fruit = mapFruitRow(fruitRow);
  assert.equal(fruit.id, fruitRow.id);
  assert.equal(fruit.moneyPrice, 12345);
  assert.equal(fruit.robuxPrice, null);
  assert.equal("money_price" in fruit, false);
  assert.equal("active" in fruit, false);
  assert.throws(
    () => mapFruitRow({ ...fruitRow, rarity: "invented" }),
    /rarity/,
  );
  assert.throws(
    () => mapFruitRow({ ...fruitRow, type: "invented" }),
    /fruit type/,
  );
  assert.throws(
    () =>
      mapFruitRow({ ...fruitRow, money_price: Number.MAX_SAFE_INTEGER + 1 }),
    /money price/,
  );
});

test("joined items are ordered by position and preserve historical inactive fruit metadata", () => {
  const second = {
    ...fruitRow,
    id: "00000000-0000-4000-8000-000000000003",
    slug: "second-fixture",
    active: false,
  };
  const row = rotationRow({
    stock_items: [
      { fruit_id: fruitRow.id, position: 3, fruits: fruitRow },
      { fruit_id: second.id, position: 1, fruits: second },
    ],
  });
  const mapped = mapRotationRow(row);
  assert.deepEqual(
    mapped.fruits.map((fruit) => fruit.id),
    [second.id, fruitRow.id],
  );
  assert.equal(mapped.observedAt, "2026-09-26T08:00:00.000Z");
  assert.equal(mapped.expiresAt, "2026-09-26T12:00:00.000Z");
  assert.equal(mapped.updatedAt, "2026-09-26T08:02:00.000Z");
  assert.throws(
    () =>
      mapRotationRow(
        rotationRow({
          stock_items: [{ fruit_id: fruitRow.id, position: 0, fruits: null }],
        }),
      ),
    /reference/,
  );
});

test("an empty Supabase database returns empty catalog/history and unavailable stock", async () => {
  const provider = createSupabaseDataProvider(repository());
  assert.deepEqual(await provider.getFruits(), []);
  assert.equal(await provider.getFruit("missing-fruit"), undefined);
  assert.deepEqual(await provider.getStockHistory({}, NOW), []);
  for (const dealer of ["normal", "mirage"] as const) {
    assert.deepEqual(
      await provider.getCurrentStock(dealer, NOW),
      unavailableStock(dealer),
    );
  }
});

test("freshness uses stored absolute expiry, including the exact boundary", () => {
  for (const [dealer, end] of [
    ["normal", "2026-09-26T12:00:00Z"],
    ["mirage", "2026-09-26T10:00:00Z"],
  ] as const) {
    const stock = mapRotationRow(rotationRow({ dealer, rotation_end: end }));
    const expires = Date.parse(end);
    assert.equal(applyStockFreshness(stock, expires - 1).status, "live");
    assert.equal(applyStockFreshness(stock, expires).status, "stale");
    assert.equal(
      applyStockFreshness(stock, expires + 86400000).expiresAt,
      stock.expiresAt,
    );
    assert.equal(
      applyStockFreshness({ ...stock, status: "stale" }, NOW).status,
      "stale",
    );
  }
});

test("an expired latest known-good rotation is returned stale without replacing its fruit data", async () => {
  const row = rotationRow({
    rotation_start: "2026-09-25T08:00:00Z",
    rotation_end: "2026-09-25T12:00:00Z",
  });
  const provider = createSupabaseDataProvider(
    repository({
      async getLatestRotation() {
        return row;
      },
    }),
  );
  const stock = await provider.getCurrentStock("normal", NOW);
  assert.equal(stock.status, "stale");
  assert.equal(stock.id, row.id);
  assert.equal(stock.fruits[0].id, fruitRow.id);
});

test("failed latest rotation falls back to known-good data as stale, or stays unavailable", async () => {
  const failed = rotationRow({ status: "unavailable" });
  const provider = createSupabaseDataProvider(
    repository({
      async getLatestRotation(_dealer, _now, good) {
        return good ? rotationRow() : failed;
      },
    }),
  );
  assert.equal((await provider.getCurrentStock("normal", NOW)).status, "stale");
  const noGood = createSupabaseDataProvider(
    repository({
      async getLatestRotation(_dealer, _now, good) {
        return good ? null : failed;
      },
    }),
  );
  const stock = await noGood.getCurrentStock("normal", NOW);
  assert.equal(stock.status, "unavailable");
  assert.deepEqual(stock.fruits, []);
});

test("database errors are not converted into mock or empty data", async () => {
  const provider = createSupabaseDataProvider(
    repository({
      async getLatestRotation() {
        throw new Error("Supabase current stock query failed (42501)");
      },
    }),
  );
  await assert.rejects(provider.getCurrentStock("normal", NOW), /42501/);
});

test("history maps all joined fruits and forwards filters without rewriting observations", async () => {
  const filters = {
    dealer: "normal" as const,
    fruitId: fruitRow.id,
    date: "2026-09-26",
  };
  const provider = createSupabaseDataProvider(
    repository({
      async getHistory(received, now) {
        assert.deepEqual(received, filters);
        assert.equal(now, NOW);
        return [rotationRow()];
      },
    }),
  );
  const history = await provider.getStockHistory(filters, NOW);
  assert.equal(history[0].fruits[0].moneyPrice, fruitRow.money_price);
  assert.equal(history[0].status, "live");
});
