# Studio website

Static site for the practice. Services first; the tools are a secondary section.
No framework, no dependencies: one Node script renders HTML from a config file
and a content module.

```
site.config.json     name, descriptor, domain, email, nav, tool list (publish flags)
content/content.mjs  every sentence on the site
src/site.css         styles: minimalist, dark by default with a light switch in the header (remembered per browser)
build.mjs            renders dist/
sync-tools.mjs       copies tool browser builds into public/tools/<slug>/app/
public/              static files: brand SVGs, screenshots, tool apps, og.png
dist/                output (ignored by git)
```

## Build and preview

```sh
export PATH=/home/sgenc/workspace/eyeo/timing_editor/web/.toolchain/node-v20.17.0-linux-x64/bin:$PATH
node build.mjs            # public build: tools with publish:false are left out
node build.mjs --draft    # everything, with a DRAFT banner, for review
python3 -m http.server 8090 --directory dist   # http://localhost:8090/
```

After rebuilding a tool, run `node sync-tools.mjs` to refresh its app under `public/`.

## Before publishing

1. **Name.** Everything reads `site.config.json`. Changing `name`, `displayName`,
   `descriptor`, `domain` and `email` renames the site. The brand mark is inline in
   `build.mjs` (`mark`) and the OG image is `public/og.png` (regenerate if the name changes).
2. **Tool rights.** Timing Studio and Register Studio have `publish: false` and a
   `rightsNote`; they were built in a client context. Set `publish: true` only after
   confirming they may be presented under this brand, then add their app builds to
   `sync-tools.mjs` if they should run in the browser.
3. **Placeholders.** Search `content/content.mjs` for `[` and fill the About paragraph.
4. **Confidentiality.** Review `work.items` in `content/content.mjs`; client names are
   withheld but the descriptions are specific.
5. **The OSD Designer app** under `public/tools/osd-designer/app/` still says
   "Semigen Engineering" in its header and About box. Rename it in the app repo and
   re-sync once the name is final.
6. **Email.** `hello@linebuffer.io` needs a mailbox or a forward once the domain exists.
7. **Fonts** (Overpass, Overpass Mono) load from Google Fonts. Self-host them (two WOFF2 files) if you prefer no
   third-party requests; `src/site.css` declares the fallback stacks.

## Deploy

- **Shared hosting (cPanel / DirectAdmin, Linux):** `public/.htaccess` ships with the build
  (HTTPS redirect, canonical host without www, 404 page, cache headers, MIME types).
  Copy `deploy.env.example` to `deploy.env`, fill in the account details, then `./deploy.sh`:
  it runs the public build and mirrors `dist/` to the document root over SSH (rsync) or
  FTPS (lftp). Choose the **Linux** flavour of the hosting package; Windows/IIS would need
  a `web.config` instead of `.htaccess`. Point the domain's A record at the server (or use
  the host's nameservers), enable AutoSSL / Let's Encrypt in the panel, and create the
  contact mailbox there so SPF, DKIM and DMARC are set on the domain.
- **GitHub Pages:** push this folder as a repository with `main` as the default branch;
  `.github/workflows/pages.yml` builds and deploys `dist/`. In Settings, Pages, choose
  "GitHub Actions" as the source and set the custom domain; `build.mjs` writes `CNAME`.
  Point the domain's DNS at GitHub Pages (A records to 185.199.108-111.153, `www` CNAME
  to `<user>.github.io`).
- **Cloudflare Pages or Netlify:** build command `node build.mjs`, output directory `dist`.
