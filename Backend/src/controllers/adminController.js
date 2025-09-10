// Backend/src/controllers/adminController.js
import prisma from "../services/prisma.js";

/**
 * Fetch all registered visitors (for Admin dashboard)
 */
export const getVisitors = async (req, res) => {
  try {
    const visitors = await prisma.visitor.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(visitors);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
};
