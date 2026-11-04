---
description: Put Binatec Autoblog on a schedule as a Claude Code scheduled task, so articles are written automatically at set times. Use when the user wants Autoblog to run on its own.
---

# Schedule Autoblog

Runs use the user's own Claude plan. One site at one post a day suits Pro;
more posts or several sites need Max (or an API key), because scheduled tasks
count against the same usage limits as normal sessions.

1. Run `autoblog me` and `autoblog sites` to get the site id(s) and plan.
2. For each site, read its schedule (times + time zone) and turn it into a
   cron expression in that time zone (one task per site; one line can carry
   several times, e.g. `0 9,15 * * *`).
3. Pick where it runs, and say why:
   - **Cloud (recommended):** runs with the computer off. Create it with
     `/schedule` (or at https://claude.ai/code/routines). In the task's cloud
     environment the user must add the environment variables `AUTOBLOG_KEY`
     (their licence key) and `AUTOBLOG_SITE` (the site id), and allow network
     access to `api.binatecagency.com` plus normal web access for research.
     Use the cloud prompt below.
   - **This computer:** a local scheduled task with the plugin installed; it
     only runs while the computer is on. Use the local prompt below.
4. Confirm the task exists and offer "Run now" once to test it.

## Cloud prompt

```text
Run Binatec Autoblog for one article.
1. curl -fsSL https://api.binatecagency.com/cli/autoblog.mjs -o /tmp/autoblog.mjs
2. Everywhere the brief says `autoblog`, run `node /tmp/autoblog.mjs` instead. AUTOBLOG_KEY and AUTOBLOG_SITE are set in the environment.
3. Work in a fresh folder. Run `node /tmp/autoblog.mjs context`, then `node /tmp/autoblog.mjs brief`, and follow the brief exactly until `publish` succeeds or prints why it can't.
4. Do not commit or push anything yourself. Finish with the title, the query it targets, where it landed and any warnings.
```

## Local prompt

```text
Run /autoblog:write for site <site id>. Finish with the title, the query it targets, where it landed and any warnings.
```
