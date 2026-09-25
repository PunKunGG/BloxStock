import test from "node:test";
import assert from "node:assert/strict";
import { mockFruits } from "@/data/fruits";
import {
  createMockHistory,
  createMockRotation,
  resolveRotation,
} from "@/lib/mock-provider";
import { filterFruits } from "@/lib/fruits/filters";
import { filterStockHistory } from "@/lib/history/filters";
import { dateKey } from "@/lib/utils";
import { RARITIES } from "@/types/fruit";

const NOW = Date.parse("2026-09-25T08:15:00.000Z");

test("a dealer advances exactly at its expiry and countdown target stays in the future", () => {
  for (const dealer of ["normal", "mirage"] as const) {
    const rotation = createMockRotation(dealer, NOW);
    const expiry = Date.parse(rotation.expiresAt);
    const before = createMockRotation(dealer, expiry - 1);
    const next = createMockRotation(dealer, expiry);
    assert.equal(before.id, rotation.id);
    assert.notEqual(next.id, rotation.id);
    assert.equal(next.observedAt, rotation.expiresAt);
    assert.ok(Date.parse(next.expiresAt) > expiry);
    assert.ok(Date.parse(next.updatedAt) >= Date.parse(next.observedAt));
  }
});

test("history agrees with current rotations and only contains completed rotations", () => {
  const history = createMockHistory(NOW);
  assert.equal(
    new Set(history.map((rotation) => rotation.id)).size,
    history.length,
  );
  for (const dealer of ["normal", "mirage"] as const) {
    const current = createMockRotation(dealer, NOW);
    const previous = history.find((rotation) => rotation.dealer === dealer);
    assert.ok(previous);
    assert.equal(previous.expiresAt, current.observedAt);
    assert.deepEqual(
      previous.fruits,
      resolveRotation(createMockRotation(dealer, NOW, 1)).fruits,
    );
  }
  for (const entry of history) {
    assert.ok(Date.parse(entry.expiresAt) <= NOW);
    assert.ok(entry.fruits.length > 0);
  }
});

test("all mock patterns resolve to unique catalog IDs and every rarity is represented", () => {
  assert.equal(
    new Set(mockFruits.map((fruit) => fruit.id)).size,
    mockFruits.length,
  );
  assert.equal(
    new Set(mockFruits.map((fruit) => fruit.slug)).size,
    mockFruits.length,
  );
  for (const rarity of RARITIES)
    assert.ok(mockFruits.some((fruit) => fruit.rarity === rarity));
  for (const rotation of createMockHistory(NOW))
    assert.equal(
      new Set(rotation.fruits.map((fruit) => fruit.id)).size,
      rotation.fruits.length,
    );
  assert.throws(
    () =>
      resolveRotation({
        ...createMockRotation("normal", NOW),
        fruitIds: ["invalid-fruit"],
      }),
    /Unknown fruit reference/,
  );
});

test("search combines normalized names and rarity without mutating the catalog", () => {
  assert.deepEqual(
    filterFruits(mockFruits, "  PoRtAl ", "Legendary").map((fruit) => fruit.id),
    ["portal"],
  );
  assert.equal(filterFruits(mockFruits, "portal", "Common").length, 0);
  assert.equal(filterFruits(mockFruits, "", "All").length, mockFruits.length);
});

test("history combines dealer, fruit, and Bangkok calendar date filters", () => {
  const history = createMockHistory(NOW);
  const matching = history.find(
    (rotation) =>
      rotation.dealer === "mirage" &&
      rotation.fruits.some((fruit) => fruit.id === "portal"),
  );
  assert.ok(matching);
  const date = dateKey(matching.observedAt);
  const filtered = filterStockHistory(history, {
    dealer: "mirage",
    fruitId: "portal",
    date,
  });
  assert.ok(filtered.length > 0);
  assert.ok(
    filtered.every(
      (rotation) =>
        rotation.dealer === "mirage" &&
        rotation.fruits.some((fruit) => fruit.id === "portal") &&
        dateKey(rotation.observedAt) === date,
    ),
  );
  assert.equal(dateKey("2026-09-24T17:00:00.000Z"), "2026-09-25");
  assert.equal(filterStockHistory(history, { date: "1900-01-01" }).length, 0);
});
