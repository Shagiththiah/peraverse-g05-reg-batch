/*
Remove entries in Sabaragamuwa/Ratnapura.json whose trailing location equals a known non-Ratnapura town.
Run: node Backend/server/lookup/targeted_clean_ratnapura.cjs
*/

const fs = require("fs");
const path = require("path");

const ratnapuraPath = path.join(process.cwd(), "Backend", "server", "lookup", "schools", "Sabaragamuwa", "Ratnapura.json");

// Extend this list if needed
const NON_LOCAL_TOWNS = new Set([
  "Gampola",
  "Katugastota",
  "Ambalangoda",
  "Peradeniya",
  "Kundasale",
  "Nawalapitiya",
  "Digana",
  "Gelioya",
  "Akurana",
  "Batagolladeniya",
  "Udatalawinna",
  "Hatton",
]);

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

function main() {
  if (!fs.existsSync(ratnapuraPath)) {
    console.error("Ratnapura.json not found at:", ratnapuraPath);
    process.exit(1);
  }
  const list = JSON.parse(fs.readFileSync(ratnapuraPath, "utf-8"));
  if (!Array.isArray(list)) {
    console.error("Ratnapura.json is not an array");
    process.exit(1);
  }

  const nonLocalLc = new Set(Array.from(NON_LOCAL_TOWNS).map(normalize));
  const removed = [];
  const kept = [];

  for (const item of list) {
    if (typeof item !== "string") { kept.push(item); continue; }
    const parts = item.split(",");
    const suffix = parts[parts.length - 1];
    const locLc = normalize(suffix);
    if (nonLocalLc.has(locLc)) {
      removed.push(item);
    } else {
      kept.push(item);
    }
  }

  // Sort the kept list consistently
  const sorted = kept.slice().sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: "base" }));
  fs.writeFileSync(ratnapuraPath, JSON.stringify(sorted, null, 2) + "\n", "utf-8");

  console.log(`Removed ${removed.length} entries.`);
  removed.slice(0, 50).forEach(e => console.log("-", e));
  if (removed.length > 50) console.log(`... and ${removed.length - 50} more`);
}

main();
