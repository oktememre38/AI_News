# News update

Instructions for the scheduled Claude job that keeps `news.json` current. It runs three times a day (around 08:00, 15:00 and 20:00 Istanbul time).
The page (`index.html`) reads `news.json`; nothing else in the repo changes during an update, except moving old items into `archive/` with the script below.

## Rules

- Edit **only** `news.json` (and `archive/` through `node scripts/archive.mjs`). Never edit code, styles or these instructions.
- **Window:** look for news published after `checked` in `news.json` (the previous run). If that is more than 24 hours ago, look back 24 hours only.
- **Add at most 9 items per run.** Fewer is normal. Zero is fine when nothing important happened. Never pad.
- Skip anything already in `news.json` or `archive/` (same URL, or the same event from another outlet). If a story already listed has a genuinely new development (e.g. an announced model is now released), add it as a new item about that development.
- **Never invent anything.** Every item must come from a page you actually read in this run, and its `url` must be that page. Do not add leaks, rumours or "reportedly" stories unless a reliable outlet confirms them on the record; when in doubt, leave it out.
- Prefer the primary source (the lab's own post, the paper, the official announcement) for `url`. Use a news outlet when it is the best or only reliable account.
- **Write in your own words.** `title` and `summary` are Turkish and written by you: don't translate the original headline word for word, don't copy sentences, no quotes longer than a few words. The summary says what happened and why it matters in 2–3 sentences (max 400 characters).
- Always set `checked` to the current UTC time. Commit and push even when no item was added, so the next run's window starts from here.

## What counts as important

Three categories, in this order of priority:

| `cat` | Covers | Examples of "important" |
|---|---|---|
| `model` | Model and product releases | A new model or major version from a major lab (Anthropic, OpenAI, Google/DeepMind, Meta, xAI, Mistral, DeepSeek, Qwen/Alibaba, etc.); a significant open-weight release; major price, limit or availability changes; important new features in ChatGPT, Claude, Gemini, Copilot and similar tools. |
| `research` | Research | Papers or results that the field is clearly talking about: new state-of-the-art benchmark results, notable new methods, important safety/alignment findings, influential lab research posts. Not every arXiv paper. |
| `turkey` | AI news from Turkey | Turkish models and products, government AI strategy and regulation in Turkey, notable investments, university and company work from Turkey, global AI services launching or changing in Turkey. Bar is lower here: local relevance is enough. |

Not included: funding rounds, stock moves, opinion pieces, generic "AI will change X" articles, product rumours, minor app updates, sponsored content.

## Sources

This job runs unattended, so nothing may wait for an approval:

- `WebSearch` and `WebFetch` are pre-approved for this repo in `.claude/settings.json`, so they never wait for an approval. Prefer fetching URLs that came from a `WebSearch` result or a page you already fetched; don't guess URLs that might not exist.
- Find pages with `WebSearch`: use the site and topic in the query (e.g. `Anthropic news November 2026`) or the `allowed_domains` filter (e.g. `["anthropic.com"]`), then fetch the result link.
- Don't use `curl`, `wget` or scripts to reach websites; the shell can't reach them.
- If a fetch is refused or needs approval, skip that page and move on; note it in the final summary.

Search the window's dates explicitly (e.g. `AI model release November 5 2026`). The sites below are where to look (as search terms and `allowed_domains`), not URLs to open:

- **model:** anthropic.com/news, openai.com/news, blog.google/technology/ai and deepmind.google/discover/blog, ai.meta.com/blog, mistral.ai/news, x.ai/news, api-docs.deepseek.com/news, qwenlm.github.io/blog; outlets: The Verge (AI), TechCrunch (AI), Ars Technica, VentureBeat (AI), Reuters (technology).
- **research:** huggingface.co/papers (daily trending papers), lab research blogs above, arXiv links that the outlets above or the labs point to.
- **turkey:** aa.com.tr (bilim-teknoloji), webrazzi.com (yapay zeka), donanimhaber.com, shiftdelete.net, t3vakfi.org, tubitak.gov.tr, cbddo.gov.tr; search in Turkish too (e.g. `yapay zeka Türkiye haber`, `Türkçe dil modeli`).

If a site can't be read (HTTP 403, timeout, DNS failure), move on and note it in the final summary with the exact error.

## news.json shape

```json
{
  "schema": 1,
  "checked": "2026-11-05T13:46:00Z",
  "items": [
    {
      "id": "2026-11-05-short-english-slug",
      "date": "2026-11-05",
      "added": "2026-11-05T13:46:00Z",
      "cat": "model",
      "title": "Türkçe başlık",
      "summary": "Türkçe 2–3 cümlelik özet.",
      "source": "Anthropic",
      "url": "https://..."
    }
  ]
}
```

- `id`: publication date + a short lowercase ASCII slug, unique across `news.json` and `archive/`.
- `date`: the date the source published it (YYYY-MM-DD). `added`: this run's time (same value as `checked`).
- `source`: the outlet or organisation name as people know it (e.g. `"OpenAI"`, `"Reuters"`, `"Webrazzi"`).
- `items` order doesn't matter; the page sorts them.

## Before you commit

```bash
git show HEAD:news.json > /tmp/prev.json
node scripts/archive.mjs
node scripts/validate.mjs /tmp/prev.json
```

`archive.mjs` moves items older than 30 days into `archive/YYYY-MM.json`. `validate.mjs` must print `news.json OK`. Fix every `ERROR`. For each `WARN`, look at the item once more and fix it or keep it on purpose.

Commit to `main` and push. Message: `news: YYYY-MM-DD HH:MM` (Istanbul time) followed by one line per added item (`[cat] title`). If nothing was added: `news: YYYY-MM-DD HH:MM kontrol, yeni haber yok`.

End the run with a short summary in Turkish: how many items were added (titles), which sources couldn't be read and why.
