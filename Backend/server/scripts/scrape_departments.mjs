import { writeFile, mkdir } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetch } from 'undici';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../lookup/universities');
await mkdir(root, { recursive: true });

/** Config: add/adjust selectors or URLs if sites change */
const CONFIG = [
  {
    name: 'University of Colombo',
    url: 'https://cmb.ac.lk/academics/',
    selectorHints: ['.departments li','ul li','a'],
    filter: /department|dept|studies|school|program/i
  },
  { name: 'University of Peradeniya', url: 'https://www.pdn.ac.lk/academics/faculties', selectorHints: ['a'], filter:/faculty|department|studies/i },
  { name: 'University of Moratuwa', url: 'https://uom.lk/faculties', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'University of Sri Jayewardenepura', url: 'https://www.sjp.ac.lk/faculties/', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'University of Kelaniya', url: 'https://news.kln.ac.lk/index.php/faculties', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'University of Jaffna', url: 'https://www.jfn.ac.lk/faculties/', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'University of Ruhuna', url: 'https://www.ruh.ac.lk/index.php/academics', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'The Open University of Sri Lanka', url: 'https://ou.ac.lk/units/', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'Eastern University, Sri Lanka', url: 'https://www.esn.ac.lk/academics', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'South Eastern University of Sri Lanka', url: 'https://www.seu.ac.lk/faculties.php', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'Rajarata University of Sri Lanka', url: 'https://www.rjt.ac.lk/faculties', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'Sabaragamuwa University of Sri Lanka', url: 'https://www.sab.ac.lk/academic', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'Wayamba University of Sri Lanka', url: 'https://www.wyb.ac.lk/faculties/', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'Uva Wellassa University', url: 'https://www.uwu.ac.lk/academic/', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'Gampaha Wickramarachchi University of Indigenous Medicine', url: 'https://www.gw.ac.lk/academics/', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'University of Vavuniya, Sri Lanka', url: 'https://www.vau.ac.lk/academics/', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'Institute of Technology University of Moratuwa', url: 'https://itum.mrt.ac.lk/', selectorHints: ['a'], filter:/department|division|section|technology/i },
  { name: 'General Sir John Kotelawala Defence University', url: 'https://www.kdu.ac.lk/academics/', selectorHints: ['a'], filter:/department|dept|studies|school/i },
  { name: 'University of Vocational Technology', url: 'https://www.univotec.ac.lk/degree-programs', selectorHints: ['a'], filter:/technology|department|study/i },
  { name: 'Ocean University of Sri Lanka', url: 'https://ocu.ac.lk/academic/', selectorHints: ['a'], filter:/department|school|division|technology/i },

  /* Non-state (degree awarding) — selectors may need tuning */
  { name: 'Sri Lanka Institute of Information Technology (SLIIT)', url: 'https://www.sliit.lk/faculties/', selectorHints: ['a'], filter:/department|school|discipline|degree/i },
  { name: 'NSBM Green University', url: 'https://www.nsbm.ac.lk/faculties/', selectorHints: ['a'], filter:/department|school|degree/i },
  { name: 'SLTC Research University', url: 'https://www.sltc.ac.lk/academics/', selectorHints: ['a'], filter:/department|school|program/i },
  { name: 'CINEC University', url: 'https://www.cinec.edu/academics/', selectorHints: ['a'], filter:/department|school|program/i },
  { name: 'Horizon Campus', url: 'https://horizoncampus.edu.lk/academic-faculties/', selectorHints: ['a'], filter:/department|school|program/i },
  { name: 'APIIT University', url: 'https://apiit.lk/programmes/', selectorHints: ['a'], filter:/school|programme|computing|law|business/i },
  { name: 'ICBT University', url: 'https://www.icbt.lk/programmes', selectorHints: ['a'], filter:/school|programme|computing|business|engineering/i },
  { name: 'BCI Campus', url: 'https://bci.lk/programmes/', selectorHints: ['a'], filter:/programme|department|school/i }
];

function clean(text){
  return text.replace(/\s+/g,' ').trim();
}

async function scrapeOne({name,url,selectorHints,filter}){
  try{
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }});
    const html = await res.text();
    const $ = cheerio.load(html);
    const seen = new Set(), out = [];

    const push = t => {
      const s = clean(t);
      if(!s) return;
      if(filter && !filter.test(s)) return; // keep only likely department-ish items
      // drop the word department/school/etc. tail to keep it short
      const short = s.replace(/^(department of|school of)\s+/i,'');
      if(!seen.has(short.toLowerCase())) { seen.add(short.toLowerCase()); out.push(short); }
    };

    for(const sel of selectorHints){
      $(sel).each((_,el)=>{
        const t=$(el).text()||$(el).attr('title')||'';
        push(t);
      });
      if(out.length>=6) break;
    }

    // fallback: capture list items near the word "Department"
    if(out.length<4){
      $('li').each((_,el)=>{ const t=$(el).text(); if(/depart|school|technology|studies/i.test(t)) push(t); });
    }

    if(out.length){
      const file = path.join(root, `${name}.json`);
      await writeFile(file, JSON.stringify(out, null, 2));
      console.log('✓', name, `(${out.length})`);
    }else{
      console.log('… no matches for', name, '— edit CONFIG selectorHints');
    }
  }catch(e){
    console.log('x', name, e.message);
  }
}

for(const it of CONFIG){ // serial to be gentle
  /* eslint no-await-in-loop: 0 */
  await scrapeOne(it);
}
console.log('\nDone. Files at', root);
