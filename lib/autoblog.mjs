#!/usr/bin/env node
/**
 * Binatec Autoblog CLI: the thin client the Claude Code skills call. No
 * dependencies (Node 20+). Everything valuable runs on the licence API.
 *
 * Key:  AUTOBLOG_KEY env, else saved by `autoblog login <key>`
 * Site: AUTOBLOG_SITE env, --site <id>, the saved default, or your only site
 * API:  AUTOBLOG_API_URL env (default https://api.binatecagency.com)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HELP = `autoblog <command>

  login <key>                 save your licence key (or set AUTOBLOG_KEY)
  me                          plan, usage and sites
  portal                      billing portal link (change plan, card, cancel)
  recover <email>             email a new key to the licence owner
  sites                       list your sites
  site add <site.json>        register a site (settings + CMS credentials)
  site update <site.json>     change a site's settings
  site test                   check the CMS connection (creates and deletes a draft)
  context                     today's format, categories, recent posts, playbook, usage
  brief [--format pillar|how-to|news]   today's full instructions
  demand [extra,seeds]        question discovery (2-6 minutes)
  validate <post.json> [--quick]        quality gates, live sources, fact check
  preview <post.json>         render charts, screenshots and cover into ./out
  publish <post.json>         publish (a draft unless the site earned auto-publish)
  learn <learning.json>       add a playbook learning
  retire <id> <reason...>     retire one of your learnings

Options: --site <id>`;

const CONF_DIR = join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'binatec-autoblog');
const CONF = join(CONF_DIR, 'config.json');
const conf = existsSync(CONF) ? JSON.parse(readFileSync(CONF, 'utf8')) : {};
const saveConf = (patch) => { mkdirSync(CONF_DIR, { recursive: true }); writeFileSync(CONF, JSON.stringify({ ...conf, ...patch }, null, 2), { mode: 0o600 }); };

const API = (process.env.AUTOBLOG_API_URL || conf.apiUrl || 'https://api.binatecagency.com').replace(/\/$/, '');
const KEY = process.env.AUTOBLOG_KEY || conf.key;

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(`--${name}`); if (i === -1) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const has = (name) => { const i = args.indexOf(`--${name}`); if (i === -1) return false; args.splice(i, 1); return true; };
// Flags are read before the positional arguments
const OPT = { site: flag('site'), format: flag('format'), quick: has('quick') };

const out = (v) => console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 2));
const die = (msg, code = 1) => { console.error(msg); process.exit(code); };
const readJson = (f) => { if (!f) die('Give a JSON file'); try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { return die(`Can't read ${f}: ${e.message}`); } };

async function api(method, path, body, { auth = true, raw = false } = {}) {
    if (auth && !KEY) die('No licence key. Run: autoblog login <key>  (or set AUTOBLOG_KEY)');
    const res = await fetch(`${API}${path}`, {
        method,
        headers: { ...(auth && { Authorization: `Bearer ${KEY}` }), ...(body && { 'Content-Type': 'application/json' }) },
        body: body ? JSON.stringify(body) : undefined,
    });
    const warning = res.headers.get('x-autoblog-warning');
    if (warning) console.error(`Warning: ${warning}`);
    const text = await res.text();
    if (raw && res.ok) return text;
    let data;
    try { data = JSON.parse(text); } catch { data = { error: text }; }
    if (!res.ok) {
        if (data.problems) { out(data); die(`\n${data.problems.length} problem(s). Fix them and run again.`); }
        die(`Error ${res.status}: ${data.error || text}`);
    }
    return data;
}

async function siteId() {
    const s = OPT.site || process.env.AUTOBLOG_SITE || conf.site;
    if (s) return s;
    const sites = await api('GET', '/v1/sites');
    if (sites.length === 1) return sites[0].id;
    return die(sites.length ? `Several sites; pass --site <id>: ${sites.map((x) => `${x.id} (${x.url})`).join(', ')}` : 'No site yet. Run /autoblog:setup');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
    const [cmd, a, ...rest] = args;
    switch (cmd) {
        case 'login':
            if (!/^abk_(live|test)_/.test(a || '')) die('That does not look like a licence key (abk_live_…)');
            saveConf({ key: a });
            {
                const res = await fetch(`${API}/v1/me`, { headers: { Authorization: `Bearer ${a}` } });
                if (!res.ok) die(`Saved, but the API rejected the key: ${(await res.text()).slice(0, 200)}`);
            }
            return out('Key saved and accepted.');
        case 'me': return out(await api('GET', '/v1/me'));
        case 'portal': return out((await api('POST', '/v1/portal')).url);
        case 'recover': return out((await api('POST', '/v1/keys/recover', { email: a }, { auth: false })).message);
        case 'sites': return out(await api('GET', '/v1/sites'));
        case 'site': {
            if (a === 'add') {
                const site = await api('POST', '/v1/sites', readJson(rest[0]));
                saveConf({ site: site.id });
                return out({ ...site, note: 'Saved as your default site. Next: autoblog site test' });
            }
            if (a === 'update') return out(await api('PUT', `/v1/sites/${await siteId()}`, readJson(rest[0])));
            if (a === 'test') return out(await api('POST', `/v1/sites/${await siteId()}/test`));
            return die(HELP);
        }
        case 'context': return out(await api('GET', `/v1/sites/${await siteId()}/context`));
        case 'brief': {
            const { format } = OPT;
            return out(await api('GET', `/v1/sites/${await siteId()}/brief${format ? `?format=${encodeURIComponent(format)}` : ''}`, null, { raw: true }));
        }
        case 'demand': {
            const id = await siteId();
            const job = await api('POST', `/v1/sites/${id}/demand`, { extraSeeds: (a || '').split(',').map((s) => s.trim()).filter(Boolean) });
            console.error('Discovering questions (2-6 minutes)…');
            for (let i = 0; i < 60; i++) {
                await sleep(10000);
                const j = await api('GET', `/v1/jobs/${job.jobId}`);
                if (j.status === 'done') return out(j.result);
                if (j.status === 'failed') die(`Discovery failed: ${j.error}`);
            }
            return die(`Still running. Check later: autoblog job ${job.jobId}`);
        }
        case 'job': return out(await api('GET', `/v1/jobs/${a}`));
        case 'validate': {
            const { quick } = OPT;
            const r = await api('POST', `/v1/sites/${await siteId()}/validate${quick ? '?quick=1' : ''}`, readJson(a));
            out(r);
            if (!r.ok) die(`\n${r.problems.length} problem(s). Fix them and run validate again.`);
            return;
        }
        case 'preview': {
            const r = await api('POST', `/v1/sites/${await siteId()}/preview`, readJson(a));
            mkdirSync('out', { recursive: true });
            for (const img of r.images) {
                const res = await fetch(img.url);
                const file = join('out', img.name);
                writeFileSync(file, Buffer.from(await res.arrayBuffer()));
                console.log(`${file}  (open it and check it)`);
            }
            for (const p of r.photos) console.log(`photo: ${p.page}`);
            for (const l of r.log) console.log(`note: ${l}`);
            return;
        }
        case 'publish': return out(await api('POST', `/v1/sites/${await siteId()}/publish`, readJson(a)));
        case 'learn': return out(await api('POST', `/v1/sites/${await siteId()}/learn`, readJson(a)));
        case 'retire': return out(await api('POST', `/v1/learnings/${a}/retire`, { reason: rest.join(' ') }));
        default: return out(HELP);
    }
}

main().catch((err) => die(err.message));
