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

## Mail: MTA-STS and TLS-RPT

`site.config.json` holds an `mtaSts` block; the build writes the policy to
`dist/.well-known/mta-sts.txt` **and** `dist/mta-sts/.well-known/mta-sts.txt`, so it lands in the
right place whether the subdomain shares the main document root or gets its own folder. The
build prints the DNS records to add.

Three things must be true for a sending server to honour the policy:

1. **Subdomain.** `mta-sts.linebuffer.com` exists and is served over HTTPS with a valid
   certificate for that exact name (DirectAdmin: create the subdomain, then issue Let's Encrypt
   for it). The policy fetch must not be redirected, so the file has to answer directly at
   `https://mta-sts.linebuffer.com/.well-known/mta-sts.txt`.
2. **TXT record** `_mta-sts.linebuffer.com` = `v=STSv1; id=<id from the config>`.
   **Bump the id whenever the policy text changes**, or senders keep the cached old policy.
3. **TLS-RPT (optional)** `_smtp._tls.linebuffer.com` = `v=TLSRPTv1; rua=mailto:<address>`.
   The mailbox must exist; reports arrive as daily JSON attachments.

### Rollout

Start in `mode: testing` with a short `max_age`. In testing, a sender that cannot negotiate a
matching certificate still delivers the mail and reports the failure, so a mistake cannot lose
mail. After a week of clean TLS-RPT reports, set `mode: enforce`, raise `max_age` to `604800`,
bump the `id`, rebuild, deploy and update the TXT record.

Going to `enforce` while the MX certificate does not match `mx.turkticaret.net` would make
compliant senders **refuse to deliver**. Verify first, from a machine with outbound port 25:

```sh
openssl s_client -connect mx.turkticaret.net:25 -starttls smtp \
  -servername mx.turkticaret.net -verify_hostname mx.turkticaret.net </dev/null
```

Expect `Verify return code: 0 (ok)` and the MX name in the certificate. Online checkers such as
Hardenize or the Google Admin Toolbox also report this.

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
