import express from "express";
import { prisma } from "../services/prisma.js";

const router = express.Router();

// Get all registrations
router.get("/registrations", async (_req, res) => {
  try {
    const rows = await prisma.registration.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(rows);
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Get registrations by type (School / University / General)
router.get("/registrations/type/:type", async (req, res) => {
  try {
    const rows = await prisma.registration.findMany({
      where: { type: req.params.type.toUpperCase() },
      orderBy: { createdAt: "desc" }
    });
    res.json(rows);
  } catch (err) {
    console.error("Error fetching by type:", err);
    res.status(500).json({ error: "Failed to fetch registrations by type" });
  }
});

// Get one registration by ID
router.get("/registrations/:id", async (req, res) => {
  try {
    const reg = await prisma.registration.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!reg) return res.status(404).json({ error: "Not found" });
    res.json(reg);
  } catch (err) {
    console.error("Error fetching registration:", err);
    res.status(500).json({ error: "Failed to fetch registration" });
  }
});

export default router;
