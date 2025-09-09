import { Pool } from 'pg';

// JSON lookups (Node 22+)
import provinces from '../../server/lookup/provinces.json' with { type: 'json' };
import districtsByProvince from '../../server/lookup/districts_by_province.json' with { type: 'json' };
import universitiesList from '../../server/lookup/universities.json' with { type: 'json' };

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pool = new Pool();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const lookupsRoot = path.resolve(__dirname, '../../server/lookup');
const schoolsRoot = path.join(lookupsRoot, 'schools');
const universitiesRoot = path.join(lookupsRoot, 'universities');

// helpers
const norm = (s) =>
  String(s || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '');

function findProvinceDir(provinceName) {
  const candidates = [
    provinceName,
    provinceName.replace(/\s+/g, ''),
    provinceName.replace(/\s+/g, '_'),
  ].map((p) => path.join(schoolsRoot, p));
  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
  }
  for (const d of fs.readdirSync(schoolsRoot)) {
    const full = path.join(schoolsRoot, d);
    if (fs.statSync(full).isDirectory() && norm(d) === norm(provinceName)) return full;
  }
  return null;
}

function findDistrictFile(provinceDir, districtName) {
  const files = fs.readdirSync(provinceDir).filter((f) => f.toLowerCase().endsWith('.json'));
  const targets = [
    districtName,
    districtName.toLowerCase(),
    districtName.replace(/\s+/g, ''),
    districtName.replace(/\s+/g, '_'),
  ];
  for (const f of files) {
    const base = path.parse(f).name;
    if (targets.includes(base) || norm(base) === norm(districtName)) return path.join(provinceDir, f);
  }
  return null;
}

function findUniversityDeptFile(universityName) {
  const candidates = [
    `${universityName}.json`,
    `${universityName.replace(/\s+/g, '')}.json`,
    `${universityName.replace(/\s+/g, '_')}.json`,
  ];
  for (const c of candidates) {
    const p = path.join(universitiesRoot, c);
    if (fs.existsSync(p)) return p;
  }
  // fuzzy by normalized name
  if (fs.existsSync(universitiesRoot)) {
    for (const f of fs.readdirSync(universitiesRoot)) {
      if (f.toLowerCase().endsWith('.json')) {
        if (norm(path.parse(f).name) === norm(universityName)) return path.join(universitiesRoot, f);
      }
    }
  }
  return null;
}

/* ----------------- LOOKUPS ----------------- */
export const getProvinces = (_req, res) => res.json(provinces);

export const getDistricts = (req, res) => {
  const { province } = req.query;
  res.json(districtsByProvince[province] || []);
};

export const getSchools = (req, res) => {
  const { province, district } = req.query;
  try {
    if (!province || !district) return res.json([]);

    // layout A: schools/<Province>/<District>.json
    const pdir = findProvinceDir(province);
    if (pdir) {
      const df = findDistrictFile(pdir, district);
      if (df && fs.existsSync(df)) {
        const list = JSON.parse(fs.readFileSync(df, 'utf8'));
        return res.json(Array.isArray(list) ? list : []);
      }
    }

    // layout B (fallback): schools/<Province>.json with { "District": [...] }
    const pfiles = [
      path.join(schoolsRoot, `${province}.json`),
      path.join(schoolsRoot, `${province.replace(/\s+/g, '')}.json`),
      path.join(schoolsRoot, `${province.replace(/\s+/g, '_')}.json`),
    ];
    for (const pf of pfiles) {
      if (fs.existsSync(pf)) {
        const byDistrict = JSON.parse(fs.readFileSync(pf, 'utf8'));
        const key =
          byDistrict[district] ||
          byDistrict[district?.toLowerCase?.()] ||
          byDistrict[Object.keys(byDistrict).find((k) => norm(k) === norm(district))];
        return res.json(Array.isArray(key) ? key : []);
      }
    }
    return res.json([]);
  } catch (e) {
    console.error(e);
    return res.status(500).json([]);
  }
};

// Universities list can be an array or an object map
export const getUniversities = (_req, res) => {
  if (Array.isArray(universitiesList)) return res.json(universitiesList);
  return res.json(Object.keys(universitiesList || {}));
};

// Departments: prefer per-university JSON file; fallback to object map (if provided)
export const getDepartments = (req, res) => {
  const { university } = req.query;
  try {
    if (!university) return res.json([]);

    // 1) per-university JSON file
    const f = findUniversityDeptFile(university);
    if (f) {
      const arr = JSON.parse(fs.readFileSync(f, 'utf8'));
      return res.json(Array.isArray(arr) ? arr : []);
    }

    // 2) fallback to object map in universities.json
    if (!Array.isArray(universitiesList) && universitiesList?.[university]) {
      return res.json(universitiesList[university]);
    }

    return res.json([]);
  } catch (e) {
    console.error(e);
    return res.status(500).json([]);
  }
};

/* -------------- REGISTRATION -------------- */
export const registerVisitor = async (req, res) => {
  try {
    const mapType = {
      SCHOOL: 'SCHOOL_STUDENT',
      UNIVERSITY: 'UNIVERSITY_STUDENT',
      GENERAL: 'GENERAL_PUBLIC',
    };
    const group_type = mapType[req.body?.type];
    if (!group_type) return res.status(400).json({ error: 'invalid type' });

    let organization = null;
    let extra = {};

    if (req.body.type === 'SCHOOL') {
      const { province, district, schoolName } = req.body;
      if (!province || !district || !schoolName) return res.status(400).json({ error: 'province, district, schoolName required' });
      organization = `${schoolName}, ${district}, ${province}`;
      extra = { province, district, schoolName };
    } else if (req.body.type === 'UNIVERSITY') {
      const { university, department } = req.body;
      if (!university || !department) return res.status(400).json({ error: 'university, department required' });
      organization = `${department}, ${university}`;
      extra = { university, department };
    } else {
      const { ageRange, sex } = req.body;
      if (!ageRange || !sex) return res.status(400).json({ error: 'ageRange, sex required' });
      extra = { ageRange: String(ageRange).toUpperCase(), sex: String(sex).toUpperCase() };
    }

    const { rows } = await pool.query(
      `INSERT INTO visitors (name, group_type, organization, status, contact_number, age_range, gender)
       VALUES ($1, $2::group_type, $3, 'ACTIVE'::status_type, $4, $5::age_range_type, $6::gender_type)
       RETURNING id`,
      [null, group_type, organization, null, extra.ageRange || null, extra.sex || null]
    );
    return res.json({ ok: true, visitorId: rows?.[0]?.id || null, summary: { type: group_type, organization, ...extra } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
};
