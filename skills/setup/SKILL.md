---
description: Set up Binatec Autoblog for a website - licence key, CMS connection (WordPress incl. Elementor, GitHub-based sites, Sanity, Ghost, Contentful, Strapi, or a custom site via webhook), niche, audience, voice, pillars, author, chart colours and schedule. Use when the user wants to start using Autoblog or add another site.
---

# Set up Binatec Autoblog

You are onboarding a website. Ask one short question at a time, in plain words,
and confirm each answer before moving on. The `autoblog` command is on your
PATH while this plugin is enabled (if not, use `node "${CLAUDE_PLUGIN_ROOT}/lib/autoblog.mjs"`).

## 1. Licence

Run `autoblog me`. If there's no key, ask for the licence key from the welcome
email (starts `abk_live_`) and run `autoblog login <key>`. No licence yet:
https://www.binatecagency.com/products/autoblog. Lost key: `autoblog recover <email>`.

## 2. Where the site's posts live

Ask how the site is built, then follow that section of
`${CLAUDE_PLUGIN_ROOT}/skills/setup/CONNECT.md` (read it now):

| The site is… | `cms` |
|---|---|
| WordPress (block editor, Classic Editor, or **Elementor**) | `wordpress` |
| Built from a GitHub repo (Jekyll, Hugo, Astro, Next.js, Eleventy, Gatsby, Docusaurus…) | `github` |
| Sanity | `sanity` |
| Ghost | `ghost` |
| Contentful | `contentful` |
| Strapi (v4 or v5) | `strapi` |
| Custom-built, or anything else with a developer who can add one endpoint | `webhook` |

If you can, check for yourself: fetch the homepage and look for
`wp-content`/`elementor` classes, a `generator` meta tag, or ask for the repo.
Credentials are encrypted on the Autoblog server; never paste them into chat
history twice, and delete any file that held them once it's saved.

## 3. The site

Ask for, or work out from the site and confirm:

- **Name** and **niche** (one line: who it serves and with what).
- **Offers**: what the business sells, in one or two lines.
- **Readers**: who they are, which country (`US`, `GB`, `CA`, `AU`…), US or UK spelling.
- **Author**: a real person's name, role and a short bio. No anonymous bylines.
- **Call to action**: the label and URL posts should invite readers to.
- **Pages to link**: read the sitemap (`/sitemap.xml`, `/sitemap_index.xml` or `/wp-sitemap.xml`) and propose 10-30 key pages with titles. They confirm.
- **YMYL**: does the site give health, legal or financial advice? If yes, drafts always need approval.
- **Chart colours**: brand accent `#rrggbb`; optional ink and background.
- **Schedule**: posts per day (1 recommended; the plan sets the maximum), times, and their IANA time zone.

## 4. Save and test

Write `site.json` in a temporary folder:

```json
{
  "name": "…", "url": "https://…", "cms": "<from step 2>",
  "cmsOptions": { "…": "non-secret settings from CONNECT.md" },
  "credentials": { "…": "secret values from CONNECT.md" },
  "niche": "…", "offers": "…",
  "audience": { "description": "…", "country": "US", "spelling": "US" },
  "author": { "name": "…", "role": "…", "bio": "…", "url": "…" },
  "cta": { "label": "…", "url": "https://…" },
  "links": [{ "title": "…", "url": "https://…" }],
  "pillars": [{ "name": "<the niche>", "seeds": ["…"] }],
  "ymyl": false,
  "approveFirst": true,
  "theme": { "accent": "#…" },
  "schedule": { "postsPerDay": 1, "times": ["09:00"], "timezone": "America/New_York" }
}
```

Run `autoblog site add site.json`, then **delete site.json**. Run
`autoblog site test`. If it fails, explain the error in plain words using the
troubleshooting notes in CONNECT.md, fix, and save again with
`autoblog site update site.json` (a file with only the fields that change).

## 5. Pillars

Run `autoblog demand "<3-5 seeds from the niche>"` (2-6 minutes; say so). From
the clusters, propose 5-7 pillars: themes with real search demand that lead to
what the business sells. Each has a name, 3-8 seed phrases and 1-3 of their
pages to link. Save the approved list with `autoblog site update`.

## 6. Voice

Ask for 2-3 links to posts or pages they wrote themselves (or pasted text).
Write a short voice guide (max 300 words): tone, sentence length, words they
use and avoid, formality, how they address the reader. Once approved, save it
as `"voice"` with `autoblog site update`.

## 7. Done

Summarise the settings, then offer `/autoblog:write` for the first article now
and `/autoblog:schedule` to run it on a schedule. Explain how approval works
for their platform (CONNECT.md lists it): after 10 approved articles they can
switch on auto-publish (`"approveFirst": false`), unless the site is YMYL.
