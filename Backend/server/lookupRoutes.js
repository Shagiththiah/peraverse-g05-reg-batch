import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const lookupDir = path.join(process.cwd(), "server", "lookup");

// ---- Provinces ----
router.get("/provinces", (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(lookupDir, "provinces.json"), "utf-8"));
  data.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  res.json(data);
});

// ---- Districts by Province ----
router.get("/districts/:province", (req, res) => {
  const province = req.params.province;
  const data = JSON.parse(fs.readFileSync(path.join(lookupDir, "districts_by_province.json"), "utf-8"));
  const districts = (data[province] || []).slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  res.json(districts);
});

// ---- Schools ----
router.get("/schools/:province/:district", (req, res) => {
  const { province, district } = req.params;
  const filePath = path.join(lookupDir, "schools", province, `${district}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const sorted = Array.isArray(data)
      ? data.slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      : [];
    res.json(sorted);
  } else {
    res.json([]);
  }
});

// ---- Universities ----
router.get("/universities", (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(lookupDir, "universities.json"), "utf-8"));
  data.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  res.json(data);
});

// ---- Departments for a university ----
router.get("/universities/:university/departments", (req, res) => {
  const university = req.params.university;
  const filePath = path.join(lookupDir, "universities", `${university}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const sorted = Array.isArray(data)
      ? data.slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      : [];
    res.json(sorted);
  } else {
    res.json([]);
  }
});

export default router;
