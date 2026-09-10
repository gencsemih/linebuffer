#!/usr/bin/env node
// Copies the tools' browser builds into public/ so the site build does not
// depend on sibling repositories. Run after rebuilding a tool.
//
// Only the hosted web demo of a tool is ever published here: the edition
// whose bundle carries no export capability (OSD Design Studio spec 16.1a).
// The copy is refused unless the page is tagged as that edition and contains
// none of the strings the RTL generator always emits.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const sources = [
  { slug: 'osd-design-studio', app: '../osd-menu/web/dist-demo/index.html', edition: 'web-demo', forbidden: ['endmodule', '$readmemh("', '`timescale'] },
  // Add Timing Studio / Register Studio here once they may be published (demo builds only).
];
let failed = false;
for (const s of sources) {
  const src = join(here, s.app);
  if (!existsSync(src)) { console.warn(`skip ${s.slug}: ${src} not found (build it with: node build.mjs --demo)`); continue; }
  const html = readFileSync(src, 'utf8');
  const problems = [];
  if (!html.includes(`<meta name="application-edition" content="${s.edition}" />`)) problems.push(`page is not the ${s.edition} edition`);
  for (const f of s.forbidden) if (html.includes(f)) problems.push(`page contains "${f}"`);
  if (problems.length) { console.error(`REFUSED ${s.slug}: ${problems.join('; ')}`); failed = true; continue; }
  const dst = join(here, 'public', 'tools', s.slug, 'app');
  mkdirSync(dst, { recursive: true });
  writeFileSync(join(dst, 'index.html'), html);
  console.log(`${s.slug}: ${s.edition} app synced (${(html.length / 1024).toFixed(1)} kB)`);
}
process.exit(failed ? 1 : 0);
