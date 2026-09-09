#!/usr/bin/env node
// Static site builder. No dependencies.
//   node build.mjs           -> dist/ (tools with publish:false are left out)
//   node build.mjs --draft   -> dist/ with every tool and a visible DRAFT banner
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as content from './content/content.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(here, 'site.config.json'), 'utf8'));
const DRAFT = process.argv.includes('--draft');
const out = join(here, 'dist');
const base = cfg.basePath || '';
const url = (p) => base + p;
const site = `https://${cfg.domain}`;
const cssHash = createHash('sha1').update(readFileSync(join(here, 'src', 'site.css'))).digest('hex').slice(0, 8);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mailto = `mailto:${cfg.email}`;

// The brand mark, inline: ink cells take currentColor, the pointer cell takes --accent.
const mark = `<svg viewBox="0 0 38 14" aria-hidden="true" focusable="false">
<rect x="0" y="0" width="6" height="6" fill="currentColor"/><rect x="8" y="0" width="6" height="6" fill="currentColor"/><rect x="16" y="0" width="6" height="6" fill="currentColor"/><rect x="24" y="0" width="6" height="6" fill="currentColor"/><rect x="32" y="0" width="6" height="6" fill="currentColor"/>
<rect x="0" y="8" width="6" height="6" fill="currentColor"/><rect x="8" y="8" width="6" height="6" fill="currentColor"/><rect x="16" y="8" width="6" height="6" style="fill:var(--accent)"/><rect x="24" y="8" width="6" height="6" fill="currentColor" opacity=".18"/><rect x="32" y="8" width="6" height="6" fill="currentColor" opacity=".18"/>
</svg>`;
// Animated mark (SMIL): scans the current line, completes it, shifts rows up, starts a new line; one cycle on page load.
const DUR = 2.6, PH = [0.40, 0.35, 0.35, 0.50, 0.25, 0.35, 0.35, 0.05];
const K = PH.reduce((a, p) => (a.push(+(a[a.length - 1] + p / DUR).toFixed(4)), a), [0]);
const kt = K.slice(0, -1).join(';');
const seq = (k) => { const st = (p) => (k < p ? ['I', 1] : k === p ? ['P', 1] : ['G', 0.18]); return [st(2), st(3), st(4), ['I', 1], ['I', 1], st(0), st(1), st(2)]; };
const animCells = () => {
  const ink = 'currentColor', gold = 'var(--accent)';
  let o = '';
  for (let i = 0; i < 5; i++) o += `<rect x="${8 * i}" y="0" width="6" height="6" fill="currentColor"/>`;
  for (let i = 0; i < 5; i++) {
    const sq = seq(i);
    o += `<rect x="${8 * i}" y="8" width="6" height="6" fill="currentColor"><animate attributeName="fill" values="${sq.map((v) => (v[0] === 'P' ? gold : ink)).join(';')}" keyTimes="${kt}" calcMode="discrete" dur="${DUR}s" begin="0.4s" repeatCount="1" fill="freeze"/><animate attributeName="fill-opacity" values="${sq.map((v) => v[1]).join(';')}" keyTimes="${kt}" calcMode="discrete" dur="${DUR}s" begin="0.4s" repeatCount="1" fill="freeze"/></rect>`;
  }
  for (let i = 0; i < 5; i++) o += `<rect x="${8 * i}" y="16" width="6" height="6" fill="currentColor" fill-opacity="0.18"/>`;
  o += `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -8;0 0;0 0" keyTimes="0;${K[4]};${K[5]};${K[5]};1" calcMode="linear" dur="${DUR}s" begin="0.4s" repeatCount="1" fill="freeze"/>`;
  return o;
};
const markAnimated = `<svg class="mk-anim" viewBox="0 0 38 14" aria-hidden="true" focusable="false"><defs><clipPath id="lbclip"><rect width="38" height="14"/></clipPath></defs><g clip-path="url(#lbclip)"><g>${animCells()}</g></g></svg>`;
const markStatic = mark.replace('<svg ', '<svg class="mk-static" ');
const lockup = (cls = '', animated = false) => `<a class="lockup ${cls}" href="${url('/')}" aria-label="${esc(cfg.displayName)} home">${animated ? markAnimated + markStatic : mark}<span class="wm">${esc(cfg.name)}</span></a>`;

const tools = cfg.tools.filter((t) => DRAFT || t.publish);
const hidden = cfg.tools.filter((t) => !t.publish);

function page({ path, title, description, body, current }) {
  const fullTitle = path === '/' ? `${cfg.displayName} — ${cfg.descriptor}` : `${title} — ${cfg.displayName}`;
  const nav = cfg.nav
    .map((n) => `<a href="${url(n.href)}"${current === n.href ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`)
    .join('');
  const html = `<!doctype html>
<html lang="${cfg.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${site}${url(path)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.displayName)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${site}${url(path)}">
<meta property="og:image" content="${site}${url('/og.png')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B0F18">
<script>(function(){try{if(localStorage.getItem('lb-theme')==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}})();</script>
<link rel="icon" href="${url('/brand/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${url('/brand/app-icon.svg')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;500;600;700&family=Overpass+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${url('/site.css')}?v=${cssHash}">
</head>
<body>
${DRAFT ? '<div class="draft-banner">Draft build · not for publishing · includes tools with publish:false</div>' : ''}
<header class="site-hdr"><div class="wrap">${lockup('', true)}<div class="right"><nav aria-label="Main">${nav}</nav><button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to light theme" title="Light theme"><svg class="ico-sun" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="square"><path d="M8 1.2v1.8M8 13v1.8M1.2 8H3M13 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M3.2 12.8l1.3-1.3M11.5 4.5l1.3-1.3"/></g></svg><svg class="ico-moon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M13.6 10.2A6 6 0 0 1 5.8 2.4a6.2 6.2 0 1 0 7.8 7.8z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></button></div></div></header>
<main>
${body}
</main>
<footer class="site-ftr"><div class="wrap">
  <div class="col">
    ${lockup()}
    <div>${esc(cfg.descriptor)}</div>
    <div>Founded by ${esc(cfg.founder)}${cfg.location ? ` · ${esc(cfg.location)}` : ''}</div>
  </div>
  <div class="col" style="text-align:right">
    <a href="${mailto}">${esc(cfg.email)}</a>
    <div>© ${cfg.year} ${esc(cfg.legalName || cfg.displayName)}</div>
  </div>
</div></footer>
<script>(function(){var b=document.querySelector('[data-theme-toggle]');if(!b)return;var r=document.documentElement;function paint(){var light=r.getAttribute('data-theme')==='light';b.setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme');b.setAttribute('title',light?'Dark theme':'Light theme');}b.addEventListener('click',function(){var light=r.getAttribute('data-theme')==='light';if(light){r.removeAttribute('data-theme');}else{r.setAttribute('data-theme','light');}try{localStorage.setItem('lb-theme',light?'dark':'light')}catch(e){}paint();});paint();})();</script>
<script>(function(){document.querySelectorAll('.svc-head').forEach(function(b){b.addEventListener('click',function(){var card=b.closest('.svc');var open=card.classList.toggle('open');b.setAttribute('aria-expanded',open?'true':'false');});});var h=location.hash&&document.querySelector(location.hash+' .svc-head');if(h){h.click();}})();</script>
</body>
</html>
`;
  const dir = join(out, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  return path;
}

const contactStrip = (title, body) => `
<section class="contact"><div class="wrap"><div class="inner">
  <h2>${esc(title)}</h2>
  <p class="muted">${esc(body)}</p>
  <a class="email" href="${mailto}">${esc(cfg.email)}</a>
</div></div></section>`;


// Service figures: 120x64 line diagrams, currentColor strokes, one gold element each.
const FIG = {
  'sensor-controller': `<svg viewBox="0 0 120 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="8" width="44" height="44"/><path d="M19 8v44M30 8v44M41 8v44M8 19h44M8 30h44M8 41h44" opacity=".45"/></g><rect x="8" y="19" width="44" height="11" style="fill:var(--accent)" opacity=".28"/><rect x="2" y="19" width="3" height="11" style="fill:var(--accent)"/><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="miter"><path d="M64 20h4v-8h4v8h4v-8h4v8h4v-8h4v8h4v-8h4v8h4v-8h4v8h4v-8h4v8"/><path d="M64 36h8v-8h6v8h38"/><path d="M64 52h14v-8h30v8h8"/></g></svg>`,
  'video-bridging': `<svg viewBox="0 0 120 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 14h36M4 22h36M4 30h36M4 38h36M4 46h36M4 54h36"/><rect x="40" y="8" width="40" height="48"/><path d="M48 20L60 32M48 32h12M48 44L60 32M60 32h14"/><path d="M80 22h36M80 27h36M80 39h36M80 44h36"/></g><circle cx="60" cy="32" r="3" style="fill:var(--accent)"/></svg>`,
  'fpga': `<svg viewBox="0 0 120 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><rect x="30" y="6" width="60" height="52"/><path d="M24 14h6M24 22h6M24 30h6M24 38h6M24 46h6M90 14h6M90 22h6M90 30h6M90 38h6M90 46h6"/><g opacity=".6"><rect x="38" y="14" width="8" height="8"/><rect x="50" y="14" width="8" height="8"/><rect x="62" y="14" width="8" height="8"/><rect x="74" y="14" width="8" height="8"/><rect x="38" y="26" width="8" height="8"/><rect x="50" y="26" width="8" height="8"/><rect x="74" y="26" width="8" height="8"/><rect x="38" y="38" width="8" height="8"/><rect x="50" y="38" width="8" height="8"/><rect x="62" y="38" width="8" height="8"/><rect x="74" y="38" width="8" height="8"/></g></g><rect x="62" y="26" width="8" height="8" style="fill:var(--accent)"/><path d="M70 30H96" fill="none" stroke-width="1.5" style="stroke:var(--accent)"/></svg>`,
  'image-processing': `<svg viewBox="0 0 120 64" aria-hidden="true"><g fill="currentColor"><rect x="4" y="30" width="4" height="4"/><rect x="10" y="30" width="4" height="4"/><rect x="16" y="30" width="4" height="4"/><rect x="22" y="30" width="4" height="4"/><rect x="94" y="30" width="4" height="4"/><rect x="100" y="30" width="4" height="4"/><rect x="106" y="30" width="4" height="4"/><rect x="112" y="30" width="4" height="4"/></g><path d="M26 32h9M85 32h9" fill="none" stroke="currentColor" stroke-width="1.5"/><g transform="translate(37 23.6) scale(1.2)"><rect x="0" y="0" width="6" height="6" fill="currentColor"/><rect x="8" y="0" width="6" height="6" fill="currentColor"/><rect x="16" y="0" width="6" height="6" fill="currentColor"/><rect x="24" y="0" width="6" height="6" fill="currentColor"/><rect x="32" y="0" width="6" height="6" fill="currentColor"/><rect x="0" y="8" width="6" height="6" fill="currentColor"/><rect x="8" y="8" width="6" height="6" fill="currentColor"/><rect x="16" y="8" width="6" height="6" style="fill:var(--accent)"/><rect x="24" y="8" width="6" height="6" fill="currentColor" opacity=".18"/><rect x="32" y="8" width="6" height="6" fill="currentColor" opacity=".18"/></g></svg>`,
  'analog-pcb': `<svg viewBox="0 0 120 64" aria-hidden="true"><defs><pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v4" stroke="currentColor" stroke-width="1" opacity=".5"/></pattern></defs><g fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="10" width="108" height="44"/><circle cx="11" cy="15" r="1.6"/><circle cx="109" cy="15" r="1.6"/><circle cx="11" cy="49" r="1.6"/><circle cx="109" cy="49" r="1.6"/><rect x="16" y="20" width="22" height="16"/><rect x="76" y="18" width="26" height="26"/><path d="M82 24h14M82 30h14M82 36h14" opacity=".5"/><path d="M60 28v4M56 32h8M56 36h8M60 36v6"/></g><rect x="46" y="18" width="24" height="28" fill="url(#hatch)" stroke="none"/><path d="M38 28H76" fill="none" stroke-width="2" style="stroke:var(--accent)"/></svg>`,
  'camera-hw': `<svg viewBox="0 0 120 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 14C30 24 30 40 22 50C14 40 14 24 22 14Z"/><path d="M27 32H44" stroke-dasharray="2 3"/><rect x="44" y="14" width="6" height="36"/><rect x="62" y="10" width="6" height="44"/><rect x="80" y="18" width="6" height="28"/><rect x="50" y="28" width="12" height="8"/><rect x="68" y="28" width="12" height="8"/><path d="M86 32C96 32 100 20 114 20"/></g><rect x="44" y="26" width="6" height="12" style="fill:var(--accent)"/></svg>`,
};
const fig = (slug) => (FIG[slug] ? `<div class="fig">${FIG[slug]}</div>` : '');

// Collapsed cards: figure + title; click expands to the summary, three bullets and a link to the detail page.
const serviceCards = (items, withLinks) => `<div class="grid g2fixed">${items
  .map(
    (s) => `<article class="card svc" id="card-${s.slug}">
  <button class="svc-head" type="button" aria-expanded="false" aria-controls="svc-${s.slug}">
    ${fig(s.slug)}
    <span class="svc-text"><h3>${esc(s.title)}</h3><span class="muted small">${esc(s.short)}</span></span>
    <span class="svc-ind" aria-hidden="true"></span>
  </button>
  <div class="svc-body" id="svc-${s.slug}"><div class="svc-inner">
    <ul class="small">${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    ${withLinks ? `<a class="more" href="${url('/services/#' + s.slug)}">Read more<span class="sr-only"> about ${esc(s.title)}</span></a>` : ''}
  </div></div>
</article>`
  )
  .join('')}</div>`;

const stepsBlock = (steps) => `<div class="steps">${steps
  .map(
    (s, i) => `<div class="step"><div class="n">${String(i + 1).padStart(2, '0')}</div><div><h3>${esc(s.title)}</h3><p class="muted">${esc(s.body)}</p></div></div>`
  )
  .join('')}</div>`;

const workList = (items) => `<div class="work">${items
  .map(
    (w) => `<article class="item">
  <div><h3>${esc(w.title)}</h3><p class="muted">${esc(w.body)}</p></div>
  <div class="delivered"><h4>Delivered</h4><ul class="small">${w.delivered.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>
</article>`
  )
  .join('')}</div>`;

const toolCards = (list) => `<div class="tools">${list
  .map((t) => {
    const c = content.tools.byName[t.slug];
    const status = t.status === 'browser' ? '<span class="pill acc">runs in the browser</span>' : '<span class="pill">on request</span>';
    const shot = t.hero
      ? `<a class="tool-shot" href="${url('/tools/' + t.slug + '/')}" tabindex="-1" aria-hidden="true"><img src="${url(`/img/${t.slug}/${t.hero}-750.webp`)}" srcset="${url(`/img/${t.slug}/${t.hero}-750.webp`)} 750w, ${url(`/img/${t.slug}/${t.hero}.webp`)} 1500w" sizes="(max-width: 720px) 100vw, 60vw" width="750" height="475" loading="lazy" alt=""></a>`
      : `<div class="tool-shot tool-shot-empty" aria-hidden="true">${mark}</div>`;
    return `<article class="tool">
  ${shot}
  <div class="tool-text">
    <div class="head"><h3><a href="${url('/tools/' + t.slug + '/')}">${esc(t.name)}</a></h3><span class="ver">v${esc(t.version)}</span></div>
    ${status}
    <p class="muted">${esc(c.lede)}</p>
    <a class="more" href="${url('/tools/' + t.slug + '/')}">About ${esc(t.name)}</a>
  </div>
</article>`;
  })
  .join('')}</div>`;

const pages = [];
const H = content.home;

// Home
pages.push(
  page({
    path: '/',
    current: '/',
    title: cfg.displayName,
    description: `${cfg.displayName}: ${cfg.descriptor.toLowerCase()}. Sensor and ROIC controllers, video bridges, FPGA design and verification, real-time image processing, analog and camera hardware.`,
    body: `
<section class="hero"><div class="wrap"><div class="inner">
  <h1>${esc(H.title)}</h1>
  <p class="lede">${esc(H.lede)}</p>
  <div class="btns"><a class="btn primary" href="${url(H.ctaPrimary.href)}">${esc(H.ctaPrimary.label)}</a><a class="btn" href="${mailto}">${esc(H.ctaSecondary.label)}</a></div>
</div></div></section>

<section id="services"><div class="wrap">
  <div class="sec-head"><h2>What we do</h2><p class="muted">${esc(content.services.intro)}</p></div>
  ${serviceCards(content.services.items, true)}
</div></section>

${tools.length ? `<section><div class="wrap">
  <div class="sec-head"><h2>Tools</h2><p class="muted">${esc(content.tools.intro)}</p></div>
  ${toolCards(tools)}
</div></section>` : ''}

${contactStrip(H.contact.title, H.contact.body)}
`,
  })
);

// Services
pages.push(
  page({
    path: '/services/',
    current: '/services/',
    title: 'Services',
    description: 'Image sensor and ROIC controller design, video bridging, FPGA design and verification, real-time image processing, low-noise analog PCB design and camera hardware.',
    body: `
<section class="hero"><div class="wrap"><div class="inner">
  <h1>What we do, in detail</h1>
  <p class="lede">${esc(content.services.intro)}</p>
</div></div></section>
${content.services.items
  .map(
    (s) => `<section id="${s.slug}"><div class="wrap"><div class="grid g2" style="align-items:start">
  <div>${fig(s.slug)}<h2>${esc(s.title)}</h2><p class="muted" style="margin-top:12px">${esc(s.short)}</p></div>
  <ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
</div></div></section>`
  )
  .join('')}
<section><div class="wrap">
  <div class="sec-head"><h2>${esc(content.services.engagements.title)}</h2></div>
  <div class="grid g4">${content.services.engagements.items.map((e) => `<article class="card"><h3>${esc(e.title)}</h3><p class="muted small">${esc(e.body)}</p></article>`).join('')}</div>
</div></section>
${contactStrip(H.contact.title, H.contact.body)}
`,
  })
);

// Tools index
pages.push(
  page({
    path: '/tools/',
    current: '/tools/',
    title: 'Tools',
    description: 'Small, exact design tools that grew out of client work: an on-screen-display designer that exports verified RTL, an image-sensor timing editor, a SystemRDL register map editor.',
    body: `
<section class="hero"><div class="wrap"><div class="inner">
  <h1>Tools</h1>
  <p class="lede">${esc(content.tools.intro)}</p>
</div></div></section>
<section><div class="wrap">${tools.length ? toolCards(tools) : '<p class="muted">Nothing published yet.</p>'}</div></section>
${contactStrip('A problem that keeps coming back in your flow?', 'Most of these tools are small. If yours is the same kind of problem, ask.')}
`,
  })
);

// Tool pages
for (const t of tools) {
  const c = content.tools.byName[t.slug];
  const gallery = t.screenshots.length
    ? `<section><div class="wrap"><div class="sec-head"><h2>Screens</h2></div><div class="gallery">${t.screenshots
        .map(
          (s) => `<figure><a href="${url(`/img/${t.slug}/${s.file}.webp`)}"><img src="${url(`/img/${t.slug}/${s.file}-750.webp`)}" srcset="${url(`/img/${t.slug}/${s.file}-750.webp`)} 750w, ${url(`/img/${t.slug}/${s.file}.webp`)} 1500w" sizes="(max-width: 720px) 100vw, 50vw" width="750" height="475" loading="lazy" alt="${esc(t.name)}: ${esc(s.caption)}"></a><figcaption>${esc(s.caption)}</figcaption></figure>`
        )
        .join('')}</div></div></section>`
    : '';
  const cta =
    t.status === 'browser'
      ? `<a class="btn primary" href="${url(t.app)}">Open in the browser</a><a class="btn" href="${mailto}?subject=${encodeURIComponent(t.name)}">Ask about desktop and CLI</a>`
      : `<a class="btn primary" href="${mailto}?subject=${encodeURIComponent(t.name)}">Ask for access</a>`;
  pages.push(
    page({
      path: `/tools/${t.slug}/`,
      current: '/tools/',
      title: t.name,
      description: c.summary,
      body: `
<section class="hero"><div class="wrap"><div class="tool-hero">
  <div class="head"><h1>${esc(t.name)}</h1><span class="ver">v${esc(t.version)}</span>${t.status === 'browser' ? '<span class="pill acc">runs in the browser</span>' : '<span class="pill">on request</span>'}</div>
  <p class="lede">${esc(c.lede)}</p>
  <div class="btns">${cta}</div>
  ${DRAFT && t.rightsNote ? `<p class="small" style="color:var(--accent)">Draft note: ${esc(t.rightsNote)}</p>` : ''}
</div></div></section>
${gallery}
<section><div class="wrap">
  <div class="sec-head"><h2>What it does</h2></div>
  <div class="features">${c.features.map(([k, v]) => `<div class="row"><div class="k">${esc(k)}</div><div class="muted">${esc(v)}</div></div>`).join('')}</div>
</div></section>
<section><div class="wrap"><div class="prose">
  <h2>Availability</h2>
  <p class="muted" style="margin-top:12px">${esc(c.availability)}</p>
</div></div></section>
${contactStrip('Questions about ' + t.name + '?', 'Write with what you are trying to build; a short answer usually comes back the same day.')}
`,
    })
  );
}

// About
pages.push(
  page({
    path: '/about/',
    current: '/about/',
    title: 'About',
    description: `${cfg.displayName} is the digital design and verification practice of ${cfg.founder}, focused on image sensors, ASICs and FPGAs.`,
    body: `
<section class="hero"><div class="wrap"><div class="inner">
  <h1>${esc(content.about.title)}</h1>
  <div class="lede">${content.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
</div></div></section>
<section><div class="wrap"><div class="grid g2" style="align-items:start">
  <div><h2>${esc(content.about.name.title)}</h2><p class="muted" style="margin-top:12px">${esc(content.about.name.body)}</p></div>
  <div><h2>${esc(content.about.contact.title)}</h2><p class="muted" style="margin-top:12px">${esc(content.about.contact.body)}</p><p style="margin-top:12px"><a href="${mailto}">${esc(cfg.email)}</a></p></div>
</div></div></section>
`,
  })
);

// 404
mkdirSync(out, { recursive: true });
page({
  path: '/404/',
  title: 'Not found',
  description: 'Page not found.',
  body: `<section class="hero"><div class="wrap"><div class="inner"><h1>Nothing at this address.</h1><p class="lede">The page may have moved. <a href="${url('/')}">Back to the start.</a></p></div></div></section>`,
});
cpSync(join(out, '404', 'index.html'), join(out, '404.html'));
rmSync(join(out, '404'), { recursive: true });

// Static files
cpSync(join(here, 'public'), out, { recursive: true });
cpSync(join(here, 'src', 'site.css'), join(out, 'site.css'));
if (!DRAFT) {
  // Keep unpublished tools' assets out of the public build.
  for (const t of hidden) {
    for (const p of [join(out, 'tools', t.slug), join(out, 'img', t.slug)]) if (existsSync(p)) rmSync(p, { recursive: true });
  }
}
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site}${url('/sitemap.xml')}\n`);
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map((p) => `  <url><loc>${site}${url(p)}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
if (cfg.domain && !base) writeFileSync(join(out, 'CNAME'), cfg.domain + '\n');

console.log(`${DRAFT ? 'Draft' : 'Public'} build: ${pages.length} pages -> dist/`);
if (hidden.length) console.log(`Tools ${DRAFT ? 'included as draft' : 'left out'} (publish:false): ${hidden.map((t) => t.name).join(', ')}`);
