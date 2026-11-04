---
description: Weekly Binatec Autoblog review - check what was published and approved, and add or retire playbook learnings from real results. Use when the user asks how Autoblog is doing or for the weekly review.
---

# Weekly review

1. Run `autoblog me` and `autoblog context`. Report: articles this billing
   period vs the allowance, articles approved so far, and the recent posts.
2. Ask whether Search Console is available in this session (a Search Console
   connector, or an export they can share). If yes, look at the last 28 days
   for the Autoblog posts: impressions, clicks, average position, and queries
   on page 2 that a better article could win.
3. From what the data shows (never guesses), add at most 2 learnings, each a
   specific instruction for future runs:

   ```json
   { "area": "blog", "rule": "…", "why": "what the data showed, with dates", "source": "search-console: <numbers>" }
   ```

   Save as `learning.json`, run `autoblog learn learning.json`. If one of
   their learnings from `context` is now wrong or stale, run
   `autoblog retire <id> <reason>`.
4. Suggest pillar or schedule changes only if the data supports them; apply
   them with `autoblog site update` after the user agrees.
