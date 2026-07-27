import { Router } from "express";
import { z } from "zod";
import type { Task } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { applyTaskCompletionReward, serializePet } from "../pet.js";
import { daysBetween } from "../date.js";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

const EFFORTS = ["quick", "medium", "big"] as const;

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  category: z.string().trim().min(1).max(50).default("Life Admin"),
  effort: z.enum(EFFORTS).default("quick"),
  recurring: z.boolean().default(false),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200).optional(),
  category: z.string().trim().min(1).max(50).optional(),
  effort: z.enum(EFFORTS).optional(),
  recurring: z.boolean().optional(),
});

/**
 * Recurring tasks reset to incomplete once a new calendar day starts,
 * so a daily habit like "take meds" reappears each morning instead of
 * staying checked off forever. Reset lazily on read rather than via a cron.
 */
async function resetStaleRecurringTasks(tasks: Task[]): Promise<Task[]> {
  const now = new Date();
  const stale = tasks.filter((t) => t.recurring && t.completed && t.completedAt && daysBetween(t.completedAt, now) > 0);
  if (stale.length === 0) return tasks;

  await prisma.task.updateMany({
    where: { id: { in: stale.map((t) => t.id) } },
    data: { completed: false, completedAt: null },
  });

  const staleIds = new Set(stale.map((t) => t.id));
  return tasks.map((t) => (staleIds.has(t.id) ? { ...t, completed: false, completedAt: null } : t));
}

tasksRouter.get("/", async (req: AuthedRequest, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId! },
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
  res.json(await resetStaleRecurringTasks(tasks));
});

tasksRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const task = await prisma.task.create({
    data: { ...parsed.data, userId: req.userId! },
  });
  res.status(201).json(task);
});

tasksRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ error: "Task not found" });
  }
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const task = await prisma.task.update({ where: { id: existing.id }, data: parsed.data });
  res.json(task);
});

tasksRouter.post("/:id/complete", async (req: AuthedRequest, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task || task.userId !== req.userId) {
    return res.status(404).json({ error: "Task not found" });
  }
  if (task.completed) {
    const pet = await prisma.pet.findUniqueOrThrow({ where: { userId: req.userId! } });
    return res.json({ task, pet: serializePet(pet) });
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: { completed: true, completedAt: new Date() },
  });
  const pet = await applyTaskCompletionReward(req.userId!, task.effort);

  res.json({ task: updated, pet: serializePet(pet) });
});

tasksRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task || task.userId !== req.userId) {
    return res.status(404).json({ error: "Task not found" });
  }
  await prisma.task.delete({ where: { id: task.id } });
  res.status(204).end();
});
