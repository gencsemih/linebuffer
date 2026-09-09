#!/usr/bin/env node
// Copies the tools' browser builds and screenshots into public/ so the site build
// does not depend on sibling repositories. Run after rebuilding a tool.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const sources = [
  { slug: 'osd-design-studio', app: '../osd-menu/web/dist/index.html' },
  // Add Timing Studio / Register Studio here once they may be published:
  // { slug: 'timing-studio', app: '../../../eyeo/timing_editor/web/dist/index.html' },
];
for (const s of sources) {
  const src = join(here, s.app);
  if (!existsSync(src)) { console.warn(`skip ${s.slug}: ${src} not found`); continue; }
  const dst = join(here, 'public', 'tools', s.slug, 'app');
  mkdirSync(dst, { recursive: true });
  cpSync(src, join(dst, 'index.html'));
  console.log(`${s.slug}: app synced`);
}
