import "dotenv/config";
import express from "express";
import cors from "cors";
import lookupRoutes from "./lookupRoutes.js";
import adminRoutes from "../src/routes/adminRoutes.js";
import prisma from "../src/services/prisma.js";

const app = express();
app.use(cors());
app.use(express.json());

// mount lookup routes
app.use("/", lookupRoutes);

// mount admin routes
app.use("/admin", adminRoutes);

// Individual registration -> persist to DB
app.post("/register", async (req, res) => {
  try {
    const payload = req.body || {};
    console.log("Registration payload received:", payload);
    
    const registration = await prisma.registration.create({
      data: {
        type: String(payload.type || "unknown"),
        province: payload.province || null,
        district: payload.district || null,
        school: payload.school || null,
        university: payload.university || null,
        department: payload.department || null,
        age_range: payload.ageRange || null,
        sex: payload.sex || null,
        group_size: 1,
        group_meta: {}
      }
    });
    
    console.log("Registration created successfully:", registration);
    res.json({ success: true, id: registration.id });
  } catch (err) {
    console.error("/register error:", err);
    res.status(500).json({ error: "Failed to register", details: err.message });
  }
});

// Batch registration -> persist to DB
app.post("/batchRegister", async (req, res) => {
  try {
    const payload = req.body || {};
    await prisma.registration.create({
      data: {
        type: String(payload.type || "unknown"),
        province: payload.province || null,
        district: payload.district || null,
        school: payload.school || null,
        university: payload.university || null,
        department: payload.department || null,
        age_range: payload.ageRange || null,
        sex: payload.sex || null,
        group_size: Number(payload.count) > 0 ? Number(payload.count) : 0,
        group_meta: {}
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error("/batchRegister error:", err);
    res.status(500).json({ error: "Failed to register batch" });
  }
});

// Delete a registration by id
app.delete("/registrations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.registration.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /registrations/:id error:", err);
    res.status(500).json({ error: "Failed to delete registration" });
  }
});

// Registrations list for admin portal
app.get("/registrations", async (_req, res) => {
  try {
    const rows = await prisma.registration.findMany({ orderBy: { createdAt: "desc" } });
    // map DB fields to UI-friendly
    const data = rows.map(r => ({
      id: r.id,
      type: r.type,
      province: r.province,
      district: r.district,
      school: r.school,
      university: r.university,
      department: r.department,
      ageRange: r.age_range,
      sex: r.sex,
      count: r.group_size || 1,
      createdAt: r.createdAt
    }));
    res.json(data);
  } catch (err) {
    console.error("GET /registrations error:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Aggregated statistics
app.get("/stats", async (_req, res) => {
  try {
    const rows = await prisma.registration.findMany();
    const totalPeople = rows.reduce((sum, r) => sum + (r.group_size || 1), 0);
    const totalIndividual = rows.filter(r => (r.group_size || 1) === 1).length;
    const totalBatch = rows.filter(r => (r.group_size || 1) > 1).length;

    const peopleByType = rows.reduce((acc, r) => {
      const key = r.type || "unknown";
      acc[key] = (acc[key] || 0) + (r.group_size || 1);
      return acc;
    }, {});

    const batchEventsByType = rows.reduce((acc, r) => {
      if ((r.group_size || 1) > 1) {
        const key = r.type || "unknown";
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    res.json({ totalPeople, totalIndividual, totalBatch, peopleByType, batchEventsByType });
  } catch (err) {
    console.error("GET /stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));