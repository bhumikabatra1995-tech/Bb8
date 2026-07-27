import { test } from "node:test";
import assert from "node:assert/strict";
import { levelForXp, stageForLevel, rewardForEffort } from "./pet.js";

test("levelForXp: every 100 xp is a level", () => {
  assert.equal(levelForXp(0), 0);
  assert.equal(levelForXp(99), 0);
  assert.equal(levelForXp(100), 1);
  assert.equal(levelForXp(250), 2);
  assert.equal(levelForXp(1000), 10);
});

test("stageForLevel: maps levels to stages", () => {
  assert.equal(stageForLevel(0), "egg");
  assert.equal(stageForLevel(1), "hatchling");
  assert.equal(stageForLevel(2), "hatchling");
  assert.equal(stageForLevel(3), "kid");
  assert.equal(stageForLevel(5), "kid");
  assert.equal(stageForLevel(6), "teen");
  assert.equal(stageForLevel(9), "teen");
  assert.equal(stageForLevel(10), "adult");
  assert.equal(stageForLevel(100), "adult");
});

test("rewardForEffort: bigger effort gives bigger rewards", () => {
  const quick = rewardForEffort("quick");
  const medium = rewardForEffort("medium");
  const big = rewardForEffort("big");

  assert.ok(quick.xp < medium.xp && medium.xp < big.xp);
  assert.ok(quick.happiness < medium.happiness && medium.happiness < big.happiness);
});

test("rewardForEffort: unknown effort falls back to quick", () => {
  assert.deepEqual(rewardForEffort("bogus"), rewardForEffort("quick"));
});
