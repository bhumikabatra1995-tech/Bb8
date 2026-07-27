import type { Pet } from "@prisma/client";
import { prisma } from "./db.js";

const EFFORT_REWARDS: Record<string, { xp: number; happiness: number }> = {
  quick: { xp: 10, happiness: 6 },
  medium: { xp: 20, happiness: 10 },
  big: { xp: 35, happiness: 15 },
};

export function rewardForEffort(effort: string) {
  return EFFORT_REWARDS[effort] ?? EFFORT_REWARDS.quick;
}

export function levelForXp(xp: number): number {
  return Math.floor(xp / 100);
}

export function stageForLevel(level: number): string {
  if (level <= 0) return "egg";
  if (level <= 2) return "hatchling";
  if (level <= 5) return "kid";
  if (level <= 9) return "teen";
  return "adult";
}

function daysBetween(a: Date, b: Date): number {
  const startOfA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const startOfB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((startOfB - startOfA) / (1000 * 60 * 60 * 24));
}

const HAPPINESS_DECAY_PER_IDLE_DAY = 8;
const MIN_HAPPINESS_FROM_DECAY = 5;

/**
 * Applies idle-day happiness decay (never below a floor, so a missed day
 * never feels like starting over) and persists the change if any occurred.
 */
export async function applyDecay(pet: Pet): Promise<Pet> {
  if (!pet.lastCompletedDate) return pet;

  const idleDays = daysBetween(pet.lastCompletedDate, new Date()) - 1;
  if (idleDays <= 0) return pet;

  const decayed = Math.max(
    MIN_HAPPINESS_FROM_DECAY,
    pet.happiness - idleDays * HAPPINESS_DECAY_PER_IDLE_DAY
  );
  if (decayed === pet.happiness) return pet;

  return prisma.pet.update({
    where: { id: pet.id },
    data: { happiness: decayed },
  });
}

export async function applyTaskCompletionReward(userId: string, effort: string): Promise<Pet> {
  const pet = await prisma.pet.findUniqueOrThrow({ where: { userId } });
  const reward = rewardForEffort(effort);
  const now = new Date();

  let nextStreak = pet.streak;
  if (!pet.lastCompletedDate) {
    nextStreak = 1;
  } else {
    const gap = daysBetween(pet.lastCompletedDate, now);
    if (gap === 0) {
      nextStreak = pet.streak || 1;
    } else if (gap === 1) {
      nextStreak = pet.streak + 1;
    } else {
      nextStreak = 1;
    }
  }

  return prisma.pet.update({
    where: { userId },
    data: {
      xp: pet.xp + reward.xp,
      happiness: Math.min(100, pet.happiness + reward.happiness),
      streak: nextStreak,
      lastCompletedDate: now,
    },
  });
}

export function serializePet(pet: Pet) {
  const level = levelForXp(pet.xp);
  const xpIntoLevel = pet.xp % 100;
  return {
    id: pet.id,
    name: pet.name,
    xp: pet.xp,
    level,
    stage: stageForLevel(level),
    xpIntoLevel,
    xpForNextLevel: 100,
    happiness: pet.happiness,
    streak: pet.streak,
    lastCompletedDate: pet.lastCompletedDate,
  };
}
