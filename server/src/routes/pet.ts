import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { applyDecay, serializePet } from "../pet.js";

export const petRouter = Router();

petRouter.use(requireAuth);

petRouter.get("/", async (req: AuthedRequest, res) => {
  const pet = await prisma.pet.findUniqueOrThrow({ where: { userId: req.userId! } });
  const fresh = await applyDecay(pet);
  res.json(serializePet(fresh));
});

petRouter.patch("/name", async (req: AuthedRequest, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 30) : "";
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const pet = await prisma.pet.update({
    where: { userId: req.userId! },
    data: { name },
  });
  res.json(serializePet(pet));
});
