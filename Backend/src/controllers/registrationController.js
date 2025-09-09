import { prisma } from "../services/prisma.js";

// ---------------- PROVINCES ----------------
export const getProvinces = async (_req, res) => {
  try {
    const rows = await prisma.province.findMany({ orderBy: { name: "asc" } });
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error("Error getProvinces:", err);
    res.status(500).json({ error: "Failed to fetch provinces" });
  }
};
// ---------------- SCHOOLS ----------------
export const getSchools = async (req, res) => {
  try {
    const { province, district } = req.query;
    if (!province || !district) {
      return res.status(400).json({ error: "province and district required" });
    }

    const prov = await prisma.province.findUnique({
      where: { name: String(province) }
    });
    if (!prov) return res.json([]);

    const dist = await prisma.district.findFirst({
      where: { name: String(district), provinceId: prov.id }
    });
    if (!dist) return res.json([]);

    const rows = await prisma.school.findMany({
      where: { districtId: dist.id },
      orderBy: { name: "asc" }
    });

    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error("Error getSchools:", err);
    res.status(500).json({ error: "Failed to fetch schools" });
  }
};

// ---------------- DISTRICTS ----------------
export const getDistricts = async (req, res) => {
  try {
    const { province } = req.query;
    if (!province) return res.status(400).json({ error: "province required" });

    const prov = await prisma.province.findUnique({ where: { name: String(province) } });
    if (!prov) return res.json([]);

    const rows = await prisma.district.findMany({
      where: { provinceId: prov.id },
      orderBy: { name: "asc" }
    });
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error("Error getDistricts:", err);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
};

// ---------------- UNIVERSITIES ----------------
export const getUniversities = async (_req, res) => {
  try {
    const rows = await prisma.university.findMany({ orderBy: { name: "asc" } });
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error("Error getUniversities:", err);
    res.status(500).json({ error: "Failed to fetch universities" });
  }
};

// ---------------- DEPARTMENTS ----------------
export const getDepartments = async (req, res) => {
  try {
    const { university } = req.query;
    if (!university) return res.status(400).json({ error: "university required" });

    const uni = await prisma.university.findUnique({ where: { name: String(university) } });
    if (!uni) return res.json([]);

    const rows = await prisma.department.findMany({
      where: { universityId: uni.id },
      orderBy: { name: "asc" }
    });
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error("Error getDepartments:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

// ---------------- REGISTRATION ----------------
export const registerVisitor = async (req, res) => {
  try {
    const {
      type,
      province,
      district,
      schoolName,
      university,
      department,
      ageRange,
      sex,
      group_size,
      group_meta
    } = req.body;

    const result = await prisma.registration.create({
      data: {
        type,
        province,
        district,
        school: schoolName,
        university,
        department,
        age_range: ageRange,
        sex,
        group_size: group_size || 1,
        group_meta: group_meta || {}
      }
    });

    res.json({ ok: true, summary: result });
  } catch (err) {
    console.error("Error registerVisitor:", err);
    res.status(500).json({ error: "Failed to register visitor" });
  }
};
