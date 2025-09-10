/*
Audit school lists for potential mismatches by detecting mentions of other district names.
Run: node Backend/server/lookup/audit_schools.cjs
*/

const fs = require("fs");
const path = require("path");

const lookupDir = path.join(process.cwd(), "Backend", "server", "lookup");
const schoolsRoot = path.join(lookupDir, "schools");
const districtsMapPath = path.join(lookupDir, "districts_by_province.json");

function readJson(fp) {
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

function listProvinceDirs(root) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function main() {
  const districtsByProvince = readJson(districtsMapPath);
  const allDistricts = new Set(Object.values(districtsByProvince).flat());
  const provinces = listProvinceDirs(schoolsRoot);

  const report = {};

  for (const prov of provinces) {
    const expectedDistricts = new Set(districtsByProvince[prov] || []);
    const provDir = path.join(schoolsRoot, prov);
    const files = fs.readdirSync(provDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const district = file.replace(/\.json$/i, "");
      const list = readJson(path.join(provDir, file));
      const suspects = [];

      for (const item of list) {
        if (typeof item !== "string") continue;
        const lower = item.toLowerCase();
        for (const otherDist of allDistricts) {
          if (otherDist === district) continue;
          if (lower.includes(otherDist.toLowerCase())) {
            suspects.push({ school: item, mentions: otherDist });
            break;
          }
        }
      }

      if (suspects.length) {
        if (!report[prov]) report[prov] = {};
        report[prov][district] = suspects;
      }
    }
  }

  // Print concise report
  for (const [prov, districts] of Object.entries(report)) {
    console.log(`\n[${prov}]`);
    for (const [district, suspects] of Object.entries(districts)) {
      console.log(`  ${district}: ${suspects.length} suspect entries`);
      // Show up to 10 examples
      suspects
        .slice(0, 10)
        .forEach((s) => console.log(`    - ${s.school} (mentions: ${s.mentions})`));
      if (suspects.length > 10) console.log(`    ... and ${suspects.length - 10} more`);
    }
  }

  if (Object.keys(report).length === 0) {
    console.log("No obvious cross-district mentions found.");
  }
}

main();
