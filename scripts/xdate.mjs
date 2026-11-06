// Prints the UTC time an X (Twitter) post was published, from its URL or numeric ID.
// X post IDs embed their creation time, so this needs no network access.
// Usage: node scripts/xdate.mjs https://x.com/OpenAI/status/2118390190246879554 [more...]
for (const arg of process.argv.slice(2)) {
  const m = String(arg).match(/(\d{15,20})/);
  if (!m) { console.log(`${arg}\tnot an X post URL or ID`); continue; }
  const ms = (BigInt(m[1]) >> 22n) + 1288834974657n;
  console.log(`${new Date(Number(ms)).toISOString().replace(/\.\d+Z$/, "Z")}\t${arg}`);
}
