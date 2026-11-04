# Binatec Autoblog for Claude Code

One researched, sourced article a day for your website, written in your voice
and sent to your site as a draft for you to approve.

Autoblog finds the questions your customers search for, reads the pages that
rank for them, researches primary sources, writes the article, checks every
cited number against its source, adds its own charts and screenshots, and
publishes a draft to:

- **WordPress** (block editor, Classic Editor or Elementor)
- **Sites built from a GitHub repo** (Jekyll, Hugo, Astro, Next.js, Eleventy…): a pull request per article
- **Sanity, Ghost, Contentful, Strapi**
- **Custom-built sites**, through a signed webhook

It runs in Claude Code on your own Claude plan. This plugin is the client: it
needs a Binatec Autoblog licence, from
[binatecagency.com/products/autoblog](https://www.binatecagency.com/products/autoblog).

## Install

```bash
claude plugin marketplace add Binatec-Agency/autoblog-plugin
claude plugin install autoblog@binatec
```

Then, in a Claude Code session:

| Command | What it does |
|---|---|
| `/autoblog:setup` | Licence key, site connection, topics, voice, schedule |
| `/autoblog:write` | Research, write, check and publish one article |
| `/autoblog:schedule` | Run it automatically as a Claude Code scheduled task |
| `/autoblog:review` | Weekly look at results; updates what future runs learn |

The `autoblog` command-line tool comes with the plugin (`autoblog --help`).

Setup guide: [binatecagency.com/products/autoblog/docs](https://www.binatecagency.com/products/autoblog/docs)
Support: support@binatecagency.com

## Privacy

The plugin sends your site settings, articles and CMS credentials to
`api.binatecagency.com` to check, render and publish your articles. Credentials
are encrypted at rest and used only to publish to your site. It never sees your
Claude login. Privacy policy: [binatecagency.com/privacy](https://www.binatecagency.com/privacy).
