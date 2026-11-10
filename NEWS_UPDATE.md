# News update

Instructions for the scheduled Claude job that keeps `news.json` current. It runs every two hours from about 08:00 to 24:00 Istanbul time (9 runs a day).
The page (`index.html`) reads `news.json`; nothing else in the repo changes during an update, except moving old items into `archive/` with the script below.

## Rules

- Edit **only** `news.json` (and `archive/` through `node scripts/archive.mjs`). Never edit code, styles or these instructions.
- **Window:** every run looks back **36 hours** from now, not just since the previous run. Runs overlap on purpose so a story one run missed is caught by the next; the duplicate check below keeps them from being added twice.
- **No limit on the number of items.** Add every story that is important; on a busy day that can be many. Zero is fine when nothing important happened. Never pad with minor stories.
- Skip anything already in `news.json` or `archive/` (same URL, or the same event from another outlet). If a story already listed has a genuinely new development (e.g. an announced model is now released), add it as a new item about that development.
- **Never invent anything.** Every item must come from a page you actually read in this run (or an official X post, see below), and its `url` must be that page or post. Do not add leaks, rumours or "reportedly" stories unless a reliable outlet confirms them on the record; when in doubt, leave it out.
- Prefer the primary source (the lab's own post, the paper, the official announcement) for `url`. Use a news outlet when it is the best or only reliable account.
- **Write in your own words.** `title` and `summary` are Turkish and written by you: don't translate the original headline word for word, don't copy sentences, no quotes longer than a few words. The summary says what happened and why it matters in 2–3 sentences (max 400 characters).
- Always set `checked` to the current UTC time. Commit and push even when no item was added.

## What counts as important

Three categories, in this order of priority:

| `cat` | Covers | Examples of "important" |
|---|---|---|
| `model` | Model and product releases | A new model or major version from a major lab (Anthropic, OpenAI, Google/DeepMind, Meta, xAI, Mistral, DeepSeek, Qwen/Alibaba, Moonshot/Kimi, Zhipu/Z.ai (GLM), MiniMax, Baidu (ERNIE), etc.); a significant open-weight release; major price, limit or availability changes; important new features in ChatGPT, Claude, Gemini, Copilot and similar tools. |
| `research` | Research | Papers or results that the field is clearly talking about: new state-of-the-art benchmark results, notable new methods, important safety/alignment findings, influential lab research posts. Not every arXiv paper. |
| `turkey` | AI news from Turkey | Turkish models and products, government AI strategy and regulation in Turkey, notable investments, university and company work from Turkey, global AI services launching or changing in Turkey. Bar is lower here: local relevance is enough. |

Not included: funding rounds, stock moves, opinion pieces, generic "AI will change X" articles, product rumours, minor app updates, sponsored content.

## Sources

This job runs unattended, so nothing may wait for an approval:

- `WebSearch` and `WebFetch` are pre-approved for this repo in `.claude/settings.json`, so they never wait for an approval.
- **Do all the work yourself. Never start subagents** (Agent/Task tool). A subagent starts without your search results, so it guesses URLs, its fetches get refused, and it uses up the run's time.
- **`WebFetch` only URLs that appeared in a `WebSearch` result or in a page you already fetched in this run.** Never type, guess or build a URL yourself (no index pages like `anthropic.com/news`, no site search pages like `techcrunch.com/?s=...`): those are refused with `PROVENANCE_REQUIRED`. The one exception is `https://huggingface.co/papers` (see below).
- **Don't use the `allowed_domains` filter, except `["x.com"]` for X posts.** Put the site name in the query instead (e.g. `The Verge OpenAI new model November 10 2026`). If an `x.com` filtered search fails, skip it; don't retry it.
- **Send independent searches in parallel**, several in the same turn, not one by one. Fetch only results that look inside the window and possibly important.
- Lab news index pages don't need to be opened; searches find their articles.
- Don't use `curl`, `wget` or scripts to reach websites; the shell can't reach them.
- If a fetch is refused or needs approval, skip that page and move on; note it in the final summary.

### Sweep: core every run, plus one rotating group

The full list is too long for one run, so it is split. **Every run does the core sweep, then exactly one rotating group.** Each group comes up three times a day, and the 36-hour window means nothing falls through. Finish the whole core and your whole group before you stop; never end a run with your assigned searches undone.

Pick the group from the Istanbul hour (`TZ=Europe/Istanbul date +%H`):

| Istanbul hour | Group |
|---|---|
| 07–08, 13–14, 19–20 | A |
| 09–10, 15–16, 21–22 | B |
| 11–12, 17–18, 23–00 (and any other hour) | C |

Use today's date in each query (e.g. `November 10 2026`). Generic queries like `AI news` miss big launches, so keep the lab names in the queries.

**Core (every run), about 10 searches, in parallel:**
1. `OpenAI launches <date>`, `Anthropic Claude launch <date>`, `Google Gemini DeepMind announces <date>`, `xAI Grok release <date>`, `Meta AI Llama launch <date>`.
2. Roundups: `AI news today <date>`, `this week in AI <date>`.
3. Follow-ups: for each model or product in `news.json` that was announced but not yet released, one search asking whether it has launched (at most 3).
4. X, with `allowed_domains: ["x.com"]`: `OpenAI introducing`, `Anthropic Claude introducing`, `Google DeepMind Gemini announcing`, each with the date.

**Group A, Chinese labs:** `DeepSeek release <date>`, `Qwen Alibaba release <date>`, `Kimi Moonshot release <date>`, `GLM Z.ai release <date>`, `MiniMax release <date>`, `Baidu ERNIE release <date>`; X: `DeepSeek Qwen Kimi announcing`, `Z.ai MiniMax announcing`.

**Group B, other labs and open weights:** `Microsoft Copilot AI new model <date>`, `Apple Intelligence update <date>`, `NVIDIA AI model release <date>`, `Mistral AI releases <date>`, `Hugging Face new open-weight model <date>`; X: `Mistral AI announcing`, `Microsoft AI NVIDIA AI announcing`, `sama OR Demis Hassabis OR Sundar Pichai AI launch`.

**Group C, research and Turkey:** `WebFetch https://huggingface.co/papers`, `new AI benchmark state of the art <date>`, `AI safety research <date>`; Turkey: `yapay zeka haber <tarih>`, `Türkiye yapay zeka <tarih>`, `Türkçe dil modeli`, `Webrazzi yapay zeka`, `Anadolu Ajansı yapay zeka`.

If a core search turns up a story from a group that isn't scheduled this run (e.g. a DeepSeek launch in a roundup), cover it anyway.

**A flagship launch from a major lab (a new GPT, Claude, Gemini, Llama or Grok model or a named variant such as a "Cyber", "Pro", "Mini" or "Flash" version) is always important.** If one happened inside the window and isn't in `news.json` yet, it must be added, ahead of anything else.

Lab sites (openai.com in particular) often refuse fetches. When the primary source can't be read, use a reliable outlet that reports it on the record (e.g. The Verge, TechCrunch, Reuters, SiliconANGLE, VentureBeat, CyberScoop, Ars Technica) and use that outlet's URL. Never drop a major story only because the lab's own page wouldn't load.

The sites below are where to look (as names to put in search queries), not URLs to open:

- **model:** anthropic.com/news, openai.com/news, blog.google/technology/ai and deepmind.google/discover/blog, ai.meta.com/blog, mistral.ai/news, x.ai/news, api-docs.deepseek.com/news, qwenlm.github.io/blog, kimi.ai/blog and moonshot.ai, z.ai/blog, minimax.io/news, yiyan.baidu.com and ernie.baidu.com, huggingface.co (new open-weight model pages); outlets: The Verge (AI), TechCrunch (AI), Ars Technica, VentureBeat (AI), Reuters (technology).
- **research:** huggingface.co/papers (daily trending papers), lab research blogs above, arXiv links that the outlets above or the labs point to.
- **turkey:** aa.com.tr (bilim-teknoloji), webrazzi.com (yapay zeka), donanimhaber.com, shiftdelete.net, t3vakfi.org, tubitak.gov.tr, cbddo.gov.tr; search in Turkish too (e.g. `yapay zeka Türkiye haber`, `Türkçe dil modeli`).

If a site can't be read (HTTP 403/4xx, timeout, DNS failure, or a bot check page such as Anubis or Cloudflare), don't retry it. If the page carried a story that may belong on the list, search for the same story on another outlet (the outlets above, or the lab's own page) and use that one; drop the story only if no readable source confirms it. Small blogs and SEO aggregators are never needed as the source. Note unreadable pages in the final summary with the exact error, in one line each.

Thin results are normal, especially for Turkey and research: zero items in a category is fine. For research, `WebFetch https://huggingface.co/papers` (the daily trending list) is allowed directly as a known stable page; for Turkey, the Webrazzi and Anadolu Ajansı searches in group C cover the main outlets.

## X (Twitter)

Labs often announce on X first. X pages can't be fetched (`robots_disallowed`): don't try to open x.com links, and don't use mirrors or other workarounds. Use `WebSearch` with `allowed_domains: ["x.com"]` instead; each result's title carries the post's text and author.

- The X searches to run are listed in the sweep above (core and the rotating groups). Accounts that count as official: `OpenAI`, `OpenAI Developers`, `Anthropic`, `Claude`, `Google DeepMind`, `Google AI`, `Gemini`, `AI at Meta`, `xAI`, `Grok`, `Mistral AI`, `DeepSeek`, `Qwen`, `Kimi.ai` / `Moonshot AI`, `Z.ai`, `MiniMax`, `Baidu Inc.`, `Microsoft AI`, `NVIDIA AI`, `Hugging Face`, and the leaders who announce launches: Sam Altman (`sama`), Greg Brockman (`gdb`), Dario Amodei, Demis Hassabis, Sundar Pichai, Elon Musk (AI launches only), Mustafa Suleyman.
- Get the post's time with `node scripts/xdate.mjs <post URL>` (the ID encodes it) and keep only posts inside the window.
- **An official account's own launch post is a primary source.** If its full text is in the search result, you may use it: `url` is the post URL, `source` is e.g. `"OpenAI (X)"`, `date` from `xdate.mjs`. If a news outlet or the lab's page has the same story and you can read it, prefer that URL (it has more detail) and use the X post only to find it.
- Posts from anyone else (leakers, influencers, newsletters, "reportedly") are leads, never sources. Add the story only after you read it from an official account or a reliable outlet.

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

End the run with a short summary in Turkish: which group (A, B or C) ran, how many items were added (titles), which sources couldn't be read and why.
