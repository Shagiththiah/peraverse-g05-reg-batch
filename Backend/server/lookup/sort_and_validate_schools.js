/*
Sort all school lists alphabetically and validate district files per province.
Run with: node Backend/server/lookup/sort_and_validate_schools.js
*/

import fs from "fs";
import path from "path";

const lookupDir = path.join(process.cwd(), "Backend", "server", "lookup");
const schoolsRoot = path.join(lookupDir, "schools");
const districtsMapPath = path.join(lookupDir, "districts_by_province.json");

function readJson(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(text);
}

function writeJson(filePath, data) {
  const content = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(filePath, content, "utf-8");
}

function sortStrings(arr) {
  return [...arr]
    .map(s => (typeof s === "string" ? s.trim() : s))
    .filter(s => typeof s === "string" && s.length > 0)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function main() {
  const report = { updatedFiles: [], unchangedFiles: [], missingDistrictFiles: {}, extraDistrictFiles: {}, errors: [] };

  const districtsByProvince = readJson(districtsMapPath);
  const provinces = Object.keys(districtsByProvince);

  for (const province of provinces) {
    const expectedDistricts = new Set(districtsByProvince[province] || []);
    const provinceDir = path.join(schoolsRoot, province);

    if (!fs.existsSync(provinceDir)) {
      report.missingDistrictFiles[province] = Array.from(expectedDistricts);
      continue;
    }

    const files = fs.readdirSync(provinceDir).filter(f => f.endsWith(".json"));
    const actualDistricts = new Set(files.map(f => f.replace(/\.json$/i, "")));

    // Missing district files
    const missing = Array.from(expectedDistricts).filter(d => !actualDistricts.has(d));
    if (missing.length) report.missingDistrictFiles[province] = missing;

    // Extra district files
    const extra = Array.from(actualDistricts).filter(d => !expectedDistricts.has(d));
    if (extra.length) report.extraDistrictFiles[province] = extra;

    // Sort each district's school list
    for (const file of files) {
      const filePath = path.join(provinceDir, file);
      try {
        const data = readJson(filePath);
        if (!Array.isArray(data)) {
          report.errors.push(`${province}/${file}: not an array`);
          continue;
        }
        const sorted = sortStrings(data);
        // Compare as strings to avoid whitespace diff issues
        const before = JSON.stringify(data);
        const after = JSON.stringify(sorted);
        if (before !== after) {
          writeJson(filePath, sorted);
          report.updatedFiles.push(`${province}/${file}`);
        } else {
          report.unchangedFiles.push(`${province}/${file}`);
        }
      } catch (e) {
        report.errors.push(`${province}/${file}: ${e.message}`);
      }
    }
  }

  // Print report
  console.log("Updated:", report.updatedFiles.length);
  report.updatedFiles.forEach(f => console.log("  +", f));

  if (Object.keys(report.missingDistrictFiles).length) {
    console.log("\nMissing district files:");
    for (const [prov, list] of Object.entries(report.missingDistrictFiles)) {
      console.log(`  ${prov}: ${list.join(", ")}`);
    }
  }

  if (Object.keys(report.extraDistrictFiles).length) {
    console.log("\nExtra district files:");
    for (const [prov, list] of Object.entries(report.extraDistrictFiles)) {
      console.log(`  ${prov}: ${list.join(", ")}`);
    }
  }

  if (report.errors.length) {
    console.log("\nErrors:");
    report.errors.forEach(e => console.log("  !", e));
  }
}

main();


