# Connecting each platform

Each section gives: what the owner does, then `cmsOptions` (not secret) and
`credentials` (secret) for `site.json`, then how approval works.

## WordPress (`wordpress`)

1. Create a WordPress user for Autoblog with the **Author** role (never administrator).
2. Logged in as that user: Users > Profile > Application Passwords > name it "Binatec Autoblog" > Add. Copy the password (spaces are fine).
3. The site must use HTTPS.

Pick the mode:

- `blocks` (default): the block editor (Gutenberg).
- `classic`: Classic Editor, or a theme/page builder that shows the normal post content.
- `elementor`: posts open and edit in **Elementor**. Most Elementor sites style blog posts with an Elementor Theme Builder "Single Post" template, which shows normal post content, so `blocks` or `classic` already looks right there. Choose `elementor` only if they edit each post in Elementor. It needs the free **Binatec Autoblog Connector** plugin: download `binatec-autoblog-connector.zip` from https://www.binatecagency.com/products/autoblog/docs, then Plugins > Add New > Upload Plugin > Activate. It only lets Autoblog save Elementor layouts on posts that user can edit.

```json
"cmsOptions": { "mode": "blocks" },
"credentials": { "username": "autoblog", "appPassword": "abcd efgh ijkl mnop qrst uvwx" }
```

Approval: posts arrive as **drafts**; publishing one in WordPress approves it.
Troubleshooting: 401 = wrong user or application password; 404 on `/wp-json` = permalinks set to "Plain" or a security plugin blocking the REST API (allow application passwords); "Connector plugin" error = install and activate it, or switch mode.

## GitHub-based sites (`github`)

For sites whose content is Markdown in a GitHub repo and deploy on push (Netlify, Vercel, GitHub Pages, Cloudflare Pages…).

1. Find in the repo: the folder posts live in, how files are named (look at two existing posts), the frontmatter fields they use, where images go and how the built site serves them, and the URL pattern of a live post.
2. The owner creates a **fine-grained personal access token**: GitHub > Settings > Developer settings > Fine-grained tokens > Generate. Repository access: only this repo. Permissions: Contents read/write, Pull requests read/write.

```json
"cmsOptions": {
  "repo": "owner/name", "branch": "main",
  "postsDir": "src/content/blog", "fileName": "{slug}.md",
  "assetsDir": "public/images/blog", "assetsUrl": "/images/blog",
  "urlPattern": "/blog/{slug}",
  "frontmatter": { "title": "title", "description": "description", "date": "pubDate", "image": "heroImage", "category": null, "author": "author", "slug": null, "draft": null, "imageAlt": null },
  "extraFrontmatter": {},
  "categories": []
},
"credentials": { "token": "github_pat_…" }
```

Common setups: **Jekyll** `postsDir: "_posts"`, `fileName: "{date}-{slug}.md"`, `assetsDir: "assets/images"`, `assetsUrl: "/assets/images"`, `extraFrontmatter: { "layout": "post" }`, `urlPattern` per `permalink` in `_config.yml`. **Hugo** `postsDir: "content/posts"`, `assetsDir: "static/images"`, `assetsUrl: "/images"`, `urlPattern: "/posts/{slug}"`. **Astro** starter: `src/content/blog`, `pubDate`, `heroImage`. Use `.mdx` in `fileName` if the site uses MDX. Set a frontmatter field to `null` to leave it out; match the existing posts exactly or the build may fail.

Approval: each article arrives as a **pull request** with the post and its images in one commit; **merging** it publishes and approves it. Auto-publish commits straight to the branch.
Troubleshooting: 404 = wrong repo name or the token isn't granted that repo; 403 = token lacks Contents write.

## Sanity (`sanity`)

1. sanity.io/manage > the project > API > Tokens > Add API token, permission **Editor**.
2. Find the post document type and its field names in the Studio schema (`schemaTypes/`): title, slug, excerpt/description, body (Portable Text), publish date, main image.
3. Hotlinked stock photos need a block type in the body's Portable Text array. Ask them (or their developer) to add this object type and include it in the body field's `of` list, or set `externalImageType: null` to leave stock photos out:

```js
defineType({ name: 'externalImage', type: 'object', title: 'Photo (hotlinked)', fields: [
  { name: 'url', type: 'url' }, { name: 'alt', type: 'string' }, { name: 'caption', type: 'string' },
  { name: 'credit', type: 'object', fields: [{ name: 'photographer', type: 'string' }, { name: 'photographerUrl', type: 'url' }, { name: 'source', type: 'string' }, { name: 'sourceUrl', type: 'url' }] },
] })
```

```json
"cmsOptions": { "projectId": "abc123", "dataset": "production", "docType": "post", "urlPattern": "/blog/{slug}",
  "fields": { "title": "title", "slug": "slug", "excerpt": "excerpt", "body": "body", "publishedAt": "publishedAt", "mainImage": "mainImage", "category": null, "author": null },
  "externalImageType": "externalImage" },
"credentials": { "token": "sk…" }
```

Approval: documents arrive as **drafts** in Studio; publishing approves.

## Ghost (`ghost`)

Ghost Admin > Settings > Integrations > Add custom integration "Binatec Autoblog". Copy the **Admin API key** and the **API URL**.

```json
"cmsOptions": { "apiUrl": "https://yoursite.ghost.io" },
"credentials": { "adminKey": "id:secret" }
```

Approval: posts arrive as **drafts**; publishing approves. Categories come from Ghost tags.

## Contentful (`contentful`)

1. Settings > CMA tokens > Create personal access token.
2. Note the Space ID, environment (usually `master`), the blog content type id, and its field ids. The body field must be **Long text (Markdown)**; a Rich Text body isn't supported yet.

```json
"cmsOptions": { "spaceId": "…", "environment": "master", "contentType": "blogPost", "locale": "en-US", "urlPattern": "/blog/{slug}",
  "fields": { "title": "title", "slug": "slug", "excerpt": "description", "body": "body", "image": "heroImage", "date": "publishDate", "category": null, "author": null } },
"credentials": { "token": "CFPAT-…" }
```

Approval: entries arrive **unpublished**; publishing approves. `autoblog site test` checks every mapped field exists.

## Strapi (`strapi`)

1. Settings > API Tokens > Create: custom type, with create/find/findOne on the article collection and upload on Upload.
2. The collection needs **Draft & Publish** on, and a Rich text (Markdown) body field. (The v5 "Blocks" editor field isn't supported yet.)

```json
"cmsOptions": { "apiUrl": "https://cms.example.com", "version": 5, "collection": "articles", "urlPattern": "/blog/{slug}",
  "fields": { "title": "title", "slug": "slug", "excerpt": "description", "body": "content", "image": "cover" } },
"credentials": { "token": "…" }
```

Approval: entries arrive as **drafts**; publishing approves.

## Custom-built sites (`webhook`)

For hand-built sites or any platform not listed. Their developer adds one HTTPS endpoint that receives each article; the reference receiver and payload are in the setup guide: https://www.binatecagency.com/products/autoblog/docs#webhook.

1. Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Give it to the developer for verifying signatures.
2. Get the endpoint URL (and optionally a status URL that reports which articles they published, so auto-publish can unlock).

```json
"cmsOptions": { "url": "https://example.com/api/autoblog", "statusUrl": null, "postsPath": "/blog", "categories": [] },
"credentials": { "secret": "<64 hex characters>" }
```

Approval: the payload says `"status": "draft"`; their site decides how drafts are reviewed. `autoblog site test` sends a signed ping.
