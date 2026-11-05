// Moves items older than 30 days (by publication date) from news.json into archive/YYYY-MM.json
// and keeps archive/index.json (the list of months, newest first) in step.
// Usage: node scripts/archive.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const root = new URL("..", import.meta.url);
const file = p => new URL(p, root);
const read = p => JSON.parse(readFileSync(file(p), "utf8"));
const write = (p, v) => writeFileSync(file(p), JSON.stringify(v, null, 2) + "\n");

const KEEP_DAYS = 30;
const news = read("news.json");
const cutoff = new Date(Date.now() - KEEP_DAYS * 864e5).toISOString().slice(0, 10);

const keep = [], old = [];
for (const it of news.items) (it.date < cutoff ? old : keep).push(it);
if (!old.length) { console.log("archive: nothing older than " + cutoff); process.exit(0); }

const byMonth = new Map();
for (const it of old) {
  const m = it.date.slice(0, 7);
  if (!byMonth.has(m)) byMonth.set(m, []);
  byMonth.get(m).push(it);
}
const months = new Set(existsSync(file("archive/index.json")) ? read("archive/index.json") : []);
for (const [m, items] of byMonth) {
  const p = `archive/${m}.json`;
  const cur = existsSync(file(p)) ? read(p) : [];
  const urls = new Set(cur.map(i => i.url));
  for (const it of items) if (!urls.has(it.url)) cur.push(it);
  cur.sort((a, b) => (b.date + b.added).localeCompare(a.date + a.added));
  write(p, cur);
  months.add(m);
}
news.items = keep;
write("news.json", news);
write("archive/index.json", [...months].sort().reverse());
console.log(`archive: moved ${old.length} item(s) into ${[...byMonth.keys()].join(", ")}`);
