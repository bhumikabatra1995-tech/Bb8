import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { applyTaskCompletionReward, serializePet } from "../pet.js";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

const EFFORTS = ["quick", "medium", "big"] as const;

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  category: z.string().trim().min(1).max(50).default("Life Admin"),
  effort: z.enum(EFFORTS).default("quick"),
});

tasksRouter.get("/", async (req: AuthedRequest, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId! },
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
  res.json(tasks);
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
