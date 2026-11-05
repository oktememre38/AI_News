// Checks news.json before it is committed.
// Errors (exit 1): broken structure, duplicates, too many new items.
// Warnings: things worth a second look.
// Usage: node scripts/validate.mjs [path-to-previous-news.json]
import { readFileSync, existsSync } from "node:fs";

const root = new URL("..", import.meta.url);
const file = p => new URL(p, root);
const read = p => JSON.parse(readFileSync(file(p), "utf8"));
const news = read("news.json");
const prevPath = process.argv[2];
const prev = prevPath && existsSync(prevPath) ? JSON.parse(readFileSync(prevPath, "utf8")) : null;

const errors = [], warnings = [];
const err = m => errors.push(m), warn = m => warnings.push(m);
const isDate = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const isTime = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z$/.test(s) && !isNaN(Date.parse(s));
const CATS = ["model", "research", "turkey"];
const MAX_NEW = 9;

if (news.schema !== 1) err("schema must be 1");
if (!isTime(news.checked)) err("checked must be a UTC time like 2026-11-05T13:46:00Z");
if (Date.parse(news.checked) > Date.now() + 5 * 60e3) err("checked is in the future");
if (!Array.isArray(news.items)) err("items must be an array");

// everything already in the archive
const archived = [];
if (existsSync(file("archive/index.json"))) {
  for (const m of read("archive/index.json")) {
    const p = `archive/${m}.json`;
    if (!existsSync(file(p))) { err(`archive/index.json lists ${m} but ${p} is missing`); continue; }
    archived.push(...read(p));
  }
}
const archUrls = new Set(archived.map(i => i.url)), archIds = new Set(archived.map(i => i.id));

const ids = new Set(), urls = new Set();
const today = new Date().toISOString().slice(0, 10);
const cutoff = new Date(Date.now() - 31 * 864e5).toISOString().slice(0, 10);
for (const it of news.items || []) {
  const at = `item "${it.id}"`;
  if (typeof it.id !== "string" || !/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(it.id)) err(`${at}: id must be YYYY-MM-DD-slug (lowercase ASCII)`);
  if (ids.has(it.id) || archIds.has(it.id)) err(`${at}: id used twice`);
  ids.add(it.id);
  if (!isDate(it.date)) err(`${at}: date must be YYYY-MM-DD`);
  else {
    if (it.date > today) err(`${at}: date is in the future`);
    if (it.date < cutoff) warn(`${at}: older than 30 days, run scripts/archive.mjs`);
    if (it.id && !it.id.startsWith(it.date)) warn(`${at}: id doesn't start with its date`);
  }
  if (!isTime(it.added)) err(`${at}: added must be a UTC time`);
  if (!CATS.includes(it.cat)) err(`${at}: cat must be one of ${CATS.join(", ")}`);
  if (typeof it.title !== "string" || it.title.length < 10 || it.title.length > 140) err(`${at}: title must be 10–140 characters`);
  if (typeof it.summary !== "string" || it.summary.length < 60) err(`${at}: summary must be at least 60 characters`);
  else if (it.summary.length > 400) err(`${at}: summary is ${it.summary.length} characters, max 400`);
  if (typeof it.source !== "string" || !it.source.trim()) err(`${at}: source missing`);
  let u = null;
  try { u = new URL(it.url); } catch { }
  if (!u || u.protocol !== "https:") err(`${at}: url must be a full https URL`);
  if (urls.has(it.url) || archUrls.has(it.url)) err(`${at}: url already listed`);
  urls.add(it.url);
  if (/["“”]/.test(it.summary || "") && (it.summary.match(/["“”][^"“”]{40,}["“”]/))) warn(`${at}: summary contains a long quote, rewrite it in your own words`);
}

if (prev) {
  const before = new Set((prev.items || []).map(i => i.id));
  const added = (news.items || []).filter(i => !before.has(i.id));
  if (added.length > MAX_NEW) err(`${added.length} new items, max ${MAX_NEW} per run`);
  for (const it of added) if (it.added !== news.checked) warn(`new item "${it.id}": added should equal checked`);
  const prevArchived = new Set(archived.map(i => i.id));
  for (const id of before) if (!ids.has(id) && !prevArchived.has(id)) err(`item "${id}" was removed without being archived`);
  console.log(`new items this run: ${added.length}`);
}

warnings.forEach(w => console.log("WARN  " + w));
errors.forEach(e => console.log("ERROR " + e));
console.log(errors.length ? `${errors.length} error(s)` : `news.json OK (${ids.size} items, ${warnings.length} warning(s))`);
process.exit(errors.length ? 1 : 0);
