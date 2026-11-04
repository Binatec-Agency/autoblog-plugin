---
description: Research, write, check and publish one article with Binatec Autoblog. Use when the user asks for a blog post on their Autoblog site, or when a scheduled Autoblog run starts.
argument-hint: "[--site <id>] [--format pillar|how-to|news]"
---

# Write one article

The `autoblog` command is on your PATH while this plugin is enabled (if not,
use `node "${CLAUDE_PLUGIN_ROOT}/lib/autoblog.mjs"`). Pass `--site <id>` to
every command if the user has more than one site.

1. Work in an empty folder (e.g. `mkdir -p autoblog-run && cd autoblog-run`).
2. Run `autoblog context`. If it reports a quota or payment problem, stop and
   tell the user exactly what it says.
3. Run `autoblog brief` (add `--format <x>` only if the user asked for one).
4. **Follow the brief exactly**, top to bottom: topic, beat page one, research
   with web search, write `post.json`, `autoblog validate post.json` until it
   passes, `autoblog preview post.json` and look at every image in `./out`,
   then `autoblog publish post.json`.
5. Never weaken a fact to pass the fact check: use the source's exact figure,
   or find and cite the page that has it.

When you finish, tell the user in a few lines: the title, the query it
targets, where it landed (a WordPress/CMS draft, a GitHub pull request, or
their endpoint's response) and any warnings.
