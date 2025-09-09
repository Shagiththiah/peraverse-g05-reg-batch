import fs from 'fs';
import path from 'path';
import provinces from '../lookup/provinces.json' with { type: 'json' };
import map from '../lookup/districts_by_province.json' with { type: 'json' };

const root = path.resolve('server/lookup/schools');
const exists = p => fs.existsSync(p);

let problems = 0;

for (const prov of provinces) {
  const districts = map[prov] || [];
  const provDirs = [
    path.join(root, prov),
    path.join(root, prov.replace(/\s+/g, '')),
    path.join(root, prov.replace(/\s+/g, '_'))
  ];
  const pdir = provDirs.find(exists);
  if (!pdir) {
    console.log(`❌ Province folder missing for "${prov}"`);
    problems++;
    continue;
  }
  for (const d of districts) {
    const files = [
      path.join(pdir, `${d}.json`),
      path.join(pdir, `${d.toLowerCase()}.json`),
      path.join(pdir, `${d.replace(/\s+/g,'')}.json`),
      path.join(pdir, `${d.replace(/\s+/g,'_')}.json`)
    ];
    if (!files.some(exists)) {
      console.log(`❌ District file missing: ${path.basename(pdir)}/${d}.json`);
      problems++;
    }
  }
}
console.log(problems ? `Found ${problems} problem(s).` : 'All good!');
