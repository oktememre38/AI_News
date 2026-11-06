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

### Required sweep, every run

Generic queries like `AI news` miss big launches. Run **all** of these searches every time (use today's and yesterday's date, e.g. `November 6 2026`), and read the top results that fall inside the window:

1. One search per major lab, with a launch verb: `OpenAI launches`, `OpenAI announces`, `Anthropic launches Claude`, `Google Gemini launch`, `Google DeepMind announces`, `Meta AI launches`, `xAI Grok release`, `Mistral releases`, `DeepSeek releases`, `Qwen release`, `Microsoft Copilot new model`, `Apple Intelligence update`, `NVIDIA AI model release`. Add the date to each.
2. Product names in the news: `GPT`, `Claude`, `Gemini`, `Llama`, `Grok` each with `new model` and the date. Also any model or product named in an item already in `news.json` (e.g. an announced or "upcoming" model): search whether it has now launched.
3. Roundups: `AI news today <date>`, `this week in AI <date>`.
4. Research: `Hugging Face daily papers <date>`, `new AI benchmark state of the art <date>`, `AI safety research <date>`.
5. Turkey: `yapay zeka haber <tarih>`, `Türkiye yapay zeka <tarih>`, `Türkçe dil modeli`, `yapay zeka Webrazzi`.

**A flagship launch from a major lab (a new GPT, Claude, Gemini, Llama or Grok model or a named variant such as a "Cyber", "Pro", "Mini" or "Flash" version) is always important.** If one happened inside the window and isn't in `news.json` yet, it must be added, ahead of anything else.

Lab sites (openai.com in particular) often refuse fetches. When the primary source can't be read, use a reliable outlet that reports it on the record (e.g. The Verge, TechCrunch, Reuters, SiliconANGLE, VentureBeat, CyberScoop, Ars Technica) and use that outlet's URL. Never drop a major story only because the lab's own page wouldn't load.

The sites below are where to look (as search terms and `allowed_domains`), not URLs to open:

- **model:** anthropic.com/news, openai.com/news, blog.google/technology/ai and deepmind.google/discover/blog, ai.meta.com/blog, mistral.ai/news, x.ai/news, api-docs.deepseek.com/news, qwenlm.github.io/blog; outlets: The Verge (AI), TechCrunch (AI), Ars Technica, VentureBeat (AI), Reuters (technology).
- **research:** huggingface.co/papers (daily trending papers), lab research blogs above, arXiv links that the outlets above or the labs point to.
- **turkey:** aa.com.tr (bilim-teknoloji), webrazzi.com (yapay zeka), donanimhaber.com, shiftdelete.net, t3vakfi.org, tubitak.gov.tr, cbddo.gov.tr; search in Turkish too (e.g. `yapay zeka Türkiye haber`, `Türkçe dil modeli`).

If a site can't be read (HTTP 403, timeout, DNS failure), move on and note it in the final summary with the exact error.

## X (Twitter)

Labs often announce on X first. X pages can't be fetched (`robots_disallowed`): don't try to open x.com links, and don't use mirrors or other workarounds. Use `WebSearch` with `allowed_domains: ["x.com"]` instead; each result's title carries the post's text and author.

- Every run, search X for the official accounts: `OpenAI`, `OpenAI Developers`, `Anthropic`, `Claude`, `Google DeepMind`, `Google AI`, `Gemini`, `AI at Meta`, `xAI`, `Grok`, `Mistral AI`, `DeepSeek`, `Qwen`, `Microsoft AI`, `NVIDIA AI`, `Hugging Face`, and the leaders who announce launches: Sam Altman (`sama`), Greg Brockman (`gdb`), Dario Amodei, Demis Hassabis, Sundar Pichai, Elon Musk (AI launches only), Mustafa Suleyman. Query e.g. `OpenAI introducing`, `Anthropic introducing`, `Google DeepMind announcing`, with the date.
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

End the run with a short summary in Turkish: how many items were added (titles), which sources couldn't be read and why.
