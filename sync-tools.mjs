#!/usr/bin/env node
// Copies the tools' browser builds into public/ so the site build does not
// depend on sibling repositories. Run after rebuilding a tool.
//
// Only the hosted web demo of a tool is ever published here: the edition
// whose bundle carries no export capability (OSD Design Studio spec 16.1a).
// The copy is refused unless the page is tagged as that edition and contains
// none of the strings the RTL generator always emits.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const sources = [
  {
    slug: 'osd-design-studio', app: '../osd-menu/web/dist-demo/index.html', edition: 'web-demo', forbidden: ['endmodule', '$readmemh("', '`timescale'],
    // 2x PNG captures (3000x1900, from `node screenshot.mjs .shots-2x --scale 2`) become the 750/1500/3000 webp candidates.
    shots: '../osd-menu/web/.shots-2x',
  },
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
  if (s.shots) {
    const shotDir = join(here, s.shots);
    if (!existsSync(shotDir)) { console.warn(`skip ${s.slug} screenshots: ${shotDir} not found`); continue; }
    const imgDir = join(here, 'public', 'img', s.slug);
    mkdirSync(imgDir, { recursive: true });
    let n = 0;
    for (const f of readdirSync(shotDir).filter((f) => f.endsWith('.png')).sort()) {
      const name = f.slice(0, -4);
      for (const [suffix, width] of [['-3000', 3000], ['', 1500], ['-750', 750]]) {
        execFileSync('magick', [join(shotDir, f), '-resize', `${width}x`, '-quality', '100', join(imgDir, `${name}${suffix}.webp`)], { stdio: 'inherit' });
      }
      n++;
    }
    console.log(`${s.slug}: ${n} screenshots converted to webp`);
  }
}
process.exit(failed ? 1 : 0);
