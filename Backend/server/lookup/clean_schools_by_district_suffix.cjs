/*
Clean school lists by removing entries whose trailing location equals a different district name.
Safer than naive substring checks; minimizes false positives like 'Gallella'.
Run: node Backend/server/lookup/clean_schools_by_district_suffix.cjs
*/

const fs = require("fs");
const path = require("path");

const lookupDir = path.join(process.cwd(), "Backend", "server", "lookup");
const schoolsRoot = path.join(lookupDir, "schools");
const districtsMapPath = path.join(lookupDir, "districts_by_province.json");

function readJson(fp) {
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

function writeJson(fp, data) {
  const txt = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(fp, txt, "utf-8");
}

function listProvinceDirs(root) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

function main() {
  const districtsByProvince = readJson(districtsMapPath);
  const allDistricts = new Set(Object.values(districtsByProvince).flat());
  const allDistrictsLc = new Set(Array.from(allDistricts).map((d) => normalize(d)));

  const provinces = listProvinceDirs(schoolsRoot);

  const removed = []; // { province, district, school, reason }
  const updatedFiles = [];

  for (const prov of provinces) {
    const provDir = path.join(schoolsRoot, prov);
    const files = fs.readdirSync(provDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const district = file.replace(/\.json$/i, "");
      const districtLc = normalize(district);
      const fp = path.join(provDir, file);
      const list = readJson(fp);
      if (!Array.isArray(list)) continue;

      const kept = [];
      let changed = false;

      for (const item of list) {
        if (typeof item !== "string") {
          kept.push(item);
          continue;
        }
        const parts = item.split(",");
        const loc = normalize(parts[parts.length - 1]);
        // If suffix equals a known district and it's NOT this district, remove
        if (allDistrictsLc.has(loc) && loc !== districtLc) {
          removed.push({ province: prov, district, school: item, reason: `suffix '${parts[parts.length - 1].trim()}' is other district` });
          changed = true;
          continue;
        }
        kept.push(item);
      }

      if (changed) {
        // sort for consistency
        const sorted = kept.slice().sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: "base" }));
        writeJson(fp, sorted);
        updatedFiles.push(`${prov}/${file}`);
      }
    }
  }

  console.log(`Updated files: ${updatedFiles.length}`);
  updatedFiles.forEach((f) => console.log("  +", f));

  if (removed.length) {
    console.log("\nRemoved entries (first 50):");
    removed.slice(0, 50).forEach((r) => console.log(`  - [${r.province}/${r.district}] ${r.school} (${r.reason})`));
    if (removed.length > 50) console.log(`  ... and ${removed.length - 50} more`);
  } else {
    console.log("No entries removed by suffix rule.");
  }
}

main();
