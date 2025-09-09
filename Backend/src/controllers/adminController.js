import { prisma } from "../services/prisma.js";

// Fetch all registrations for admin
export const getAllRegistrations = async (req, res) => {
  try {
    const regs = await prisma.visitors.findMany({
      orderBy: { created_at: "desc" }
    });
    res.json(regs);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
};
