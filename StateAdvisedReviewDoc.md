# StateAdvised Review Document

**Site:** [statesolaradvisors.com](https://statesolaradvisors.com/)  
**Codebase reviewed:** `StateAdvisors` (root + `docs/` publish copy)  
**Date:** August 3, 2026  
**Scope:** Public marketing site today; authenticated CRM / employee portal as the next major product track

---

## 0. Questions for you (please answer when ready)

Answer these so implementation choices stay aligned with how you actually run the business. Options are listed where it helps.

1. **Who uses the private portal?**  
   - A) Owners + employees only  
   - B) Owners + employees + subcontractors  
   - C) Later: limited customer “job status” views  

2. **Rough team size in year one of the portal?**  
   - A) 1–5  
   - B) 6–20  
   - C) 20+  

3. **Where should private data live geographically?**  
   - A) United States only (preferred for many small businesses)  
   - B) No strong preference if the vendor is reputable  

4. **Video hosting for training?**  
   - A) Managed video (Mux / Vimeo / similar) with signed / gated playback  
   - B) Object storage (S3-compatible) + signed URLs  
   - C) Decide later; start with checklist + PDF/docs only  

5. **Job workflow model?**  
   - A) Simple pipeline (Lead → Quote → Sold → Install → Complete)  
   - B) Detailed stages with checklists per stage  
   - C) Separate pipelines for Commercial / Residential / Church  

6. **Public site hosting going forward?**  
   - A) Keep GitHub Pages for marketing; new subdomain for the app (recommended)  
   - B) Move everything to one paid host  

7. **Is the live “Solar Production” monitor meant to stay illustrative, or become real telemetry later?**  
   - A) Stay demo / marketing graphic  
   - B) Eventually wire to real monitoring APIs  

8. **Business email:** stay on Gmail (`StateSolarAdvisors@gmail.com`) for the next 6–12 months, or migrate to a domain mailbox (`@statesolaradvisors.com`)?  

9. **Budget band for private-app hosting + auth in year one (ballpark)?**  
   - A) Under $50/month  
   - B) $50–200/month  
   - C) Willing to spend more for stronger security / support  

---

## 1. Intent, purpose, and direction

### What the public site is for today

**StateAdvisors Solar** (`statesolaradvisors.com`) is a **public marketing and lead-capture site**. It is not an operations system. Its job is to:

- Position the company as **commercial-first**, with clear **residential** and **church / community** paths.
- Explain benefits (ROI, incentives, process) and show installation imagery.
- Convert visitors into **quotes and calls** via the contact form (Formspree), calculator CTAs, phone, and email.
- Stay **fast to ship** on a static stack: HTML, CSS, and JavaScript on GitHub Pages with a custom domain (`CNAME` → `statesolaradvisors.com`).

Observed public structure on the live site and in code:

| Surface | Role |
|--------|------|
| `index.html` | Main funnel: hero, commercial, residential, calculator, solutions, portfolio, process, contact, “live” production demo |
| `church.html` | Faith / community outreach landing + church contact form |
| `about.html` | Company story / values / CTA back to contact |
| `styles.css` + `script.js` | Shared presentation and client-side behavior |
| `docs/` | Near-duplicate tree used for GitHub Pages deployment |

Brand contact points in the footer and CTAs include phone `(347) 308-4256`, email `StateSolarAdvisors@gmail.com`, and national service messaging (“Serving The United States”), with residential incentive copy oriented toward **New York / NYSERDA** and federal credits.

### Where the product is headed (from planning conversations)

The **next major goal is not another public page**. It is an **internal system**:

- **CRM-lite:** contacts, companies, notes, lead history.
- **Job portal:** employees (and you) submit jobs, assign work, and monitor progress.
- **Checklists:** templates and per-job completion tracking.
- **Training:** hosted videos and related materials.
- **Authentication:** account + password (and later MFA), with **security treated as a top priority**.

**Direction principle (confirmed in planning):** keep the **marketing site public and open**; put **all private operations on a separate authenticated application** (ideally `app.statesolaradvisors.com` or similar). Do not bolt login-protected business data onto the same static Pages site.

That split reduces risk: a compromise of the brochure site should not expose job files, employee training, or CRM data.

---

## 2. Current architecture (facts from the codebase)

### Stack

- Static front end only (no application server in this repo).
- Lead form on the main page posts to **Formspree** (`https://formspree.io/f/xwpqqoqp`).
- Third-party assets: Google Fonts (Inter), Font Awesome (cdnjs), some Unsplash images.
- Calculator and call-scheduling flows primarily use **browser `localStorage`** and `console.log` — they are **not** a CRM backend.
- Church form (`churchContactForm`) validates and shows a success alert, then **resets without submitting anywhere**.
- Empty / unused scaffolding: `src/lib`, `src/ui` (empty), `package-lock.json` without a root `package.json`, and a large `node_modules` tree that does not belong to the live static site.
- No `.gitignore` found — high risk of accidentally committing `node_modules` and junk.

### What works well today

- Clear commercial → residential → church narrative.
- Responsive nav and section structure suitable for a small solar shop’s marketing.
- Main contact path can deliver lead email via Formspree without running a server.
- Portfolio and featured project sections use real local photos under `Solar Photos/`.
- Domain and Pages wiring already exist for public publishing.

---

## 3. Where the site is lacking

### 3.1 Security (public site + readiness for a private portal)

The public site has **no login by design**. That is fine for marketing. Gaps matter for **lead privacy**, **trust**, and **future portal safety**.

| Issue | Why it matters | Severity |
|-------|----------------|----------|
| Church form does not send data anywhere | False sense of capture; lost leads; no audit trail | High (ops) |
| Calculator / schedule data stored in `localStorage` only | PII on the visitor’s device; never reaches your team unless they also use the contact form | High (ops / privacy) |
| Formspree endpoint ID is public in HTML | Normal for Formspree, but spam / abuse possible without rate limits, CAPTCHA, or monitoring | Medium |
| No Content-Security-Policy, no Subresource Integrity on CDN CSS/JS | Supply-chain or XSS blast radius if a third party is compromised | Medium |
| Business email is consumer Gmail | Weaker brand trust; harder professional controls (SPF/DKIM/DMARC on your domain) | Medium |
| Favicon files are 1 byte each | Broken branding; minor trust signal | Low |
| No privacy policy / cookie notice for lead forms | Growing expectation when collecting email/phone/address | Medium (legal / trust) |
| `docs/` vs root drift | Risk of publishing an older or different security-relevant form config than you edited locally | Medium |
| No auth, roles, encryption-at-rest story in this repo | Expected today; **must exist** before CRM / jobs / training videos | Critical for next phase |

**Important:** Putting CRM, checklists, or training videos “behind a password” **on this same static site** is not a viable security model. Static hosting cannot safely enforce per-user authorization or protect private media. The portal needs a real backend (or a reputable BaaS with correct row-level / storage rules), HTTPS, hashed passwords, session cookies or equivalent, RBAC, and gated file/video delivery (signed URLs).

### 3.2 Efficiency (performance and maintainability)

| Issue | Evidence | Impact |
|-------|----------|--------|
| Oversized images | `Solar Photos/pic 3.jpg` ~9.4 MB; `pic 7.jpg` ~7.7 MB; `StainedGlass.jpg` ~1.4 MB | Slow mobile loads, poor SEO Core Web Vitals |
| Duplicate publish tree | Root + `docs/` copies of HTML/CSS/JS/photos (~38 MB photos alone across both) | Double edits; deploy mistakes; repo bloat |
| Unminified CSS/JS | `styles.css` ~2.3k lines; `script.js` ~972 lines | Extra bytes on every visit |
| CSS injected from JS | Notification / hamburger styles created at runtime | Harder to maintain; FOUC risk |
| Orphaned Node tooling | `node_modules` + lockfile without project `package.json` | Confusion, disk waste, accidental commits |
| External font + icon CSS on every page | Google Fonts + Font Awesome | Extra requests; privacy / CSP complexity |
| Simulated address lookup in calculator | Fake street list from ZIP | Wasted UX steps; erodes trust if noticed |

README still describes a simpler file tree and Formspree placeholder text, and claims “Fast Loading” / “Optimized images” that the asset sizes contradict.

### 3.3 Features (product gaps)

**Public marketing gaps**

- No analytics wired (README shows a placeholder only).
- Footer **Careers** links to `#careers` — no section exists.
- Open Graph / Twitter cards not present (weak social sharing).
- Structured data (LocalBusiness / Organization) not present.
- Savings calculator is heuristic (25–50% of bill); tax-credit line stays “Waiting for missing information.”
- “Live Solar Production” is a **simulated chart**, not live inverter data.
- Church page still uses **image placeholders** for gift-basket / outreach content.
- About page leans on a stock Unsplash team image.
- No lead pipeline visibility for staff after Formspree email arrives.

**Private product gaps (explicit next goal — currently absent)**

- Accounts, passwords, password reset, MFA.
- Roles (admin vs employee).
- Jobs CRUD, status pipeline, assignment.
- Checklists and completion history.
- Training library with access control.
- Audit logs and backup/restore story.

---

## 4. Planned upgrades (with basic implementation steps)

Treat these as two tracks that can run in parallel without blocking each other.

### Track A — Harden and tidy the public site (weeks)

**A1. Single source of truth for deploy**

1. Decide: GitHub Pages from `/docs` **or** root — not both as edit targets.  
2. Prefer editing one tree; automate copy into the publish folder **or** switch Pages to the root of a dedicated `gh-pages` branch.  
3. Add `.gitignore` for `node_modules/`, OS junk, and env files.  
4. Remove unused `src/` empties and orphan `node_modules` unless you intentionally start a build pipeline.

**A2. Image pipeline**

1. Resize/compress portfolio photos (target typically &lt;300 KB each for web, WebP/AVIF where practical).  
2. Replace or compress `StainedGlass.jpg`.  
3. Use `width`/`height` and lazy-loading on below-the-fold images.  
4. Keep originals offline; commit only web-optimized assets.

**A3. Lead capture integrity**

1. Wire `church.html` to Formspree (or the future CRM API) the same way as `solar-form`.  
2. On calculator “Schedule Call” / estimate completion, **POST the lead** to Formspree or a webhook — do not rely on `localStorage`.  
3. Add spam protection (Formspree settings and/or a reputable CAPTCHA).  
4. Add a short privacy statement near forms.

**A4. Marketing hygiene**

1. Fix or remove `#careers`.  
2. Add real favicons.  
3. Add Open Graph tags and basic analytics if desired.  
4. Update README to match the real tree (`about.html`, `church.html`, `docs/`, Formspree ID handling).

**A5. Front-end cleanup**

1. Move injected CSS from `script.js` into `styles.css`.  
2. Split `script.js` by concern (nav, form, calculator, monitor) only if you stay on static JS; or adopt a small build step later.  
3. Prefer self-hosted or subset icons/fonts to reduce third-party dependency surface.

### Track B — Private CRM / employee portal (phased)

**B1. Foundations (security first)**

1. New repo or monorepo app folder separate from static Pages.  
2. Choose stack from **documented, free/reputable** options (examples to evaluate, not dictate): Next.js or similar + managed Postgres; or Supabase Auth + Postgres with **Row Level Security**; Auth.js / Clerk / similar for auth. Prefer vendors with clear docs and licenses.  
3. Deploy to `app.` subdomain with HTTPS, secrets in the host vault, never in the client.  
4. Implement email/password auth, secure cookies, rate-limited login, password reset. Plan MFA early.

**B2. Domain model (minimum)**

- Users, Roles  
- Contacts / Companies  
- Jobs (status, assignee, property type: commercial / residential / church)  
- ChecklistTemplate → ChecklistInstance → ChecklistItem  
- TrainingAsset (metadata) + completion records  
- Activity / audit events  

**B3. MVP features**

1. Login shell + RBAC middleware on every API.  
2. Create/list/update jobs; status board.  
3. Attach checklist template to a job; mark items done.  
4. Upload or link training videos with **signed URLs** (no permanent public links).  
5. Optional: ingest Formspree webhooks into Contacts/Jobs so marketing leads enter the CRM.

**B4. Hardening before “real” employee use**

1. Backup + restore drill.  
2. Dependency updates and automated scans.  
3. Access review (who is admin).  
4. Security checklist pass (OWASP-oriented: auth, injection, CSRF, storage rules).

---

## 5. Redundancy and repetitiveness — findings and change plan

### Findings

1. **Dual site trees:** Root and `docs/` both hold `index.html`, `script.js`, `styles.css`, `about.html`, `church.html`, logos, and `Solar Photos/`. `script.js` / `styles.css` hashes matched at review time; **`index.html` did not** (root vs `docs` content drift). That is the highest-risk redundancy.  
2. **Nav / footer duplicated** across `index.html`, `about.html`, and `church.html` with slight menu differences (easy to go stale).  
3. **Church page embeds a large `<style>` block** and a page-specific `<script>`, while still loading global `styles.css` and `script.js`.  
4. **Portfolio carousel + featured projects** both showcase installations — overlapping story, double maintenance of captions/stats.  
5. **Benefit / solution card patterns** repeat markup heavily (acceptable for static HTML, but painful without components or includes).  
6. **Lead capture exists in three places** with three behaviors: Formspree contact form (real), calculator (local only), church form (alert only).  
7. **Tooling redundancy:** Vite/React-related `node_modules` and lockfile sit beside a pure static site with no `package.json`.  
8. **CDN + local assets:** Font Awesome remotely while logo/photos are local — mixed ownership of presentation assets.

### Change plan (recommended order)

| Step | Action | Outcome |
|------|--------|---------|
| R1 | Pick one publish root; automate or delete the second editable copy | End deploy drift |
| R2 | Add `.gitignore`; delete committed/untracked `node_modules` from the working tree | Clean repo |
| R3 | Unify lead endpoints (contact + church + calculator → same backend) | One truth for leads |
| R4 | Extract shared nav/footer (build-time includes, small SSG, or later framework layout) | Fewer copy/paste bugs |
| R5 | Move church-only CSS/JS into `church.css` / `church.js` (or a shared module) | Clearer ownership |
| R6 | Compress images once; reference from a single `assets/images/` folder | Smaller, faster site |
| R7 | Optionally merge “showcase” into one gallery component with filters | Less repetitive content ops |
| R8 | Keep marketing static; build CRM as a **separate app** — do not duplicate CRM UI into `docs/` | Security boundary |

---

## 6. Success criteria (how we will know direction is working)

**Public site**

- Edits publish from one tree without silent drift.  
- All public lead forms deliver to a monitored inbox or CRM.  
- Typical mobile homepage loads without multi‑MB images.  
- Broken links (`#careers`) and 1-byte favicons are gone.

**Private portal (MVP)**

- You and employees sign in with individual accounts.  
- Jobs and checklists are not reachable without auth.  
- Training media cannot be hotlinked by the public.  
- Marketing site remains public; portal is a separate origin.

---

## 7. Summary

**Today:** a capable **static marketing funnel** for StateAdvisors Solar — commercial emphasis, residential incentives, church outreach, Formspree on the main contact form, GitHub Pages + custom domain.

**Lacking:** consistent lead capture, image/performance discipline, deploy single-sourcing, basic web security headers/hygiene, and — most importantly — any authenticated operations layer.

**Direction:** keep the public brochure; build a **separate, login-protected CRM/portal** for jobs, progress, checklists, and training, with security designed in from foundations (auth, RBAC, gated media, secrets management).

**Immediate practical wins:** fix church + calculator lead paths, compress images, eliminate root/`docs` edit drift, add `.gitignore`, then begin portal foundations on a dedicated subdomain.

---

*Document generated from a full pass of the StateAdvisors codebase (HTML/CSS/JS pages, `docs/` publish copy, assets, README/CHURCH notes) and the live public site, plus prior planning direction for the employee CRM/portal.*
