# Kaka Motors — Phase-wise Development Plan

This file is the build order for turning the presentation handoff in `website.md` into a **dynamic showroom + Django backend**. The public React site and the Django admin panel share one PostgreSQL database. Staff add cars, galleries, locations, and copy in admin; visitors see that content live. Test-drive requests from the public form land in Django admin.

Do not skip phases. Each phase has a clear “done” line. Later phases assume earlier ones are working.

---

## How to use this file

1. Finish the current phase’s **acceptance criteria** before starting the next.
2. Keep the **visual language** from `website.md` on the public site (dark environment, scarlet signal, typography, motion). Do not keep its fictional car names.
3. **Apex R, Solara GT, and Vesper S are design placeholders only.** They appear in `website.md` because that file describes a static mock. They are not Kaka Motors products and must not be hardcoded in the app, seed, routes, or copy.
4. Every car on the live site comes from Django admin. The homepage hero is whichever published vehicle is marked featured — not a named flagship baked into the code.
5. Do not add 3D viewers, configurators, or WebGL until Phase 8+. The baseline must work without them.

---

## Product outcome

| Surface | Who uses it | What it does |
| --- | --- | --- |
| Public site (React) | Visitors | Browse cars, read the brand, book a private test drive |
| Django admin | Showroom staff | Manage cars, media, locations, content, and test-drive leads |
| Django API + PostgreSQL | Both | Single source of truth. No hardcoded car lists in production |

Public routes to keep (from `website.md`):

- `/` — showroom landing (hero + line-up from published vehicles)
- `/showcase` — filtered collection of whatever is in the catalog
- `/cars/:slug` — one detail template for every car
- `/test-drive` — request form (vehicle list from published catalog)
- `/about` — brand story
- 404 — “Signal lost”

There is no special `/cars/apex-r` page. If a car is not in the database, it does not exist on the site.

Staff admin (Django Admin, not a second React app in v1):

- `/admin/login/`
- `/admin/` — dashboard
- Vehicles, gallery inlines, publish/unpublish
- Test-drive inbox and status
- Locations, site content, settings

A custom React admin is **Phase 10+**. v1 uses Django Admin so catalog and leads are real from day one.

---

## Recommended stack

Split frontend and backend. Django owns data, auth, files, email, and staff UI. React owns the public showroom.

| Layer | Choice | Why |
| --- | --- | --- |
| Public site | React + Vite + TypeScript | Matches the handoff (Wouter, Framer Motion, Tailwind) |
| Public UI | Tailwind CSS, Framer Motion, Lucide | Same visual system as `website.md` |
| Backend | Django 5.x | Admin, ORM, auth, media, email |
| Public API | Django REST Framework | JSON for the React site |
| Database | PostgreSQL on Railway | Catalog, leads, and **image URLs** — never the image files |
| Validation | DRF serializers (server), Zod (public forms) | Server is source of truth |
| Staff auth | Django auth + session | Built-in admin login |
| Admin UI | Django Admin + Unfold (or Jazzmin) | Dark, usable CMS without a second frontend |
| Images | Cloudflare R2 | Files live in R2; Railway stores `image_url` (and the R2 object key) |
| Email | Django email backend (SMTP / Resend / Anymail) from Phase 5 | Lead notifications |
| CORS | django-cors-headers | Vite dev server → Django API |
| Env | django-environ | `SECRET_KEY`, `DATABASE_URL`, Cloudflare R2, CORS |

### Image storage (Cloudflare + Railway)

Do **not** save image files in PostgreSQL or on the Railway disk.

When staff add a car in admin:

1. They attach a picture and save the vehicle.
2. Django uploads the file to **Cloudflare R2**.
3. Cloudflare returns a public URL (custom domain or R2 public bucket URL).
4. Railway PostgreSQL stores only:
   - `hero_image_url` / `card_image_url` / gallery `image_url`
   - `*_image_key` (R2 object key, used if the image is replaced or deleted)

The public React site always renders `<img src={vehicle.heroImageUrl} />`. It never talks to R2 directly.

Wire the upload helper in Phase 0 (env + service). Call it from admin in Phase 4. Phase 1 mock images stay local files in `frontend/src/assets/` and are deleted when the catalog goes live.

Do not put the public showroom in Django templates. The cinematic site stays React. Django serves `/api/` and `/admin/`. Vehicle images are loaded from Cloudflare URLs.

### Suggested repo layout

```text
kaka-motors/
  backend/
    manage.py
    requirements.txt
    .env.example
    config/                 # project package
      settings/
        base.py
        local.py
        production.py
      urls.py
      wsgi.py
      asgi.py
    catalog/                # Vehicle, GalleryMedia
    leads/                  # TestDriveRequest
    studio/                 # Location, SiteContent, StudioSettings
    accounts/               # custom user if email-login is needed
    fixtures/               # optional JSON dumps
    catalog/management/commands/seed_showroom.py
  frontend/
    package.json
    src/
      app/
      components/
      pages/
      data/                 # mock data in Phase 1 only
      lib/api.ts            # Django API client
      styles/
    public/
  development-phases.md
  website.md
```

Local run (two processes):

```text
backend:  python manage.py runserver    → http://127.0.0.1:8000
frontend: npm run dev                    → http://localhost:5173
```

Vite proxies `/api` to Django in development so the browser can call one origin if you prefer. CORS is the fallback. Vehicle images are absolute Cloudflare URLs and do not go through the proxy.

---

## Shared data models

Lock these in Phase 0. Implement them as Django models. The TypeScript types below are the frontend contract.

```ts
type VehicleCategory = 'performance' | 'electric' | 'executive';
type VehicleStatus = 'draft' | 'published' | 'archived';
type GalleryKind = 'image' | 'video';
type TestDriveStatus =
  | 'new'
  | 'contacted'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

type Vehicle = {
  id: string;
  slug: string;                 // from the car name staff enter, e.g. fortuner
  name: string;                 // whatever staff type in admin
  category: VehicleCategory;
  statusLabel: string;          // e.g. "In showroom", "Coming soon"
  summary: string;
  description: string;
  interiorStory?: string;
  priceFrom?: number;
  currency: 'INR';
  heroImageUrl: string;         // Cloudflare public URL
  cardImageUrl: string;         // Cloudflare public URL
  specs: {
    power: string;
    acceleration: string;
    topSpeed: string;
    transmission?: string;
    weightBias?: string;
    length?: string;
  };
  features: string[];
  sortOrder: number;
  featuredOnHome: boolean;
  status: VehicleStatus;        // only published appear on the public site
};

type GalleryMedia = {
  id: string;
  vehicleId: string;
  kind: GalleryKind;
  imageUrl: string;             // Cloudflare public URL
  objectKey?: string;           // R2 key; admin-only, omit from public API
  alt: string;
  objectPosition?: string;
  sortOrder: number;
};

type Location = {
  id: string;
  city: string;
  studioName?: string;
  address?: string;
  active: boolean;
};

type TestDriveRequest = {
  id: string;
  reference: string;            // e.g. KM-24-1842
  name: string;
  email: string;
  phone?: string;
  city: string;
  locationId?: string;
  vehicleId: string;
  preferredDate: string;
  consent: boolean;
  source?: string;
  status: TestDriveStatus;
  adminNotes?: string;
  createdAt: string;
};

type SiteContent = {
  homeEyebrow: string;
  homeHeadline: string;
  homeCtaLabel: string;
  aboutIntro: string;
  founderQuote: string;
  founderName: string;
  brandHistory: string;
  values: { title: string; body: string }[];
  studioBlurb: string;
  responseTimeCopy: string;     // "under 24 hours"
};
```

### Django model sketch (Phase 0)

Use UUID primary keys. `User` is Django’s auth user (staff/superuser). Do not invent a parallel `AdminUser` table.

```python
class Vehicle(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='draft')
    status_label = models.CharField(max_length=80, blank=True)
    summary = models.TextField()
    description = models.TextField()
    interior_story = models.TextField(blank=True)
    price_from = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='INR')
    specs = models.JSONField(default=dict)          # power, acceleration, topSpeed, ...
    features = models.JSONField(default=list)
    sort_order = models.PositiveIntegerField(default=0)
    featured_on_home = models.BooleanField(default=False)
    card_image_url = models.URLField(max_length=500, blank=True)
    card_image_key = models.CharField(max_length=255, blank=True)
    hero_image_url = models.URLField(max_length=500, blank=True)
    hero_image_key = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class GalleryMedia(models.Model):
    vehicle = models.ForeignKey(Vehicle, related_name='gallery', on_delete=models.CASCADE)
    kind = models.CharField(max_length=16, choices=KIND_CHOICES, default='image')
    image_url = models.URLField(max_length=500)
    object_key = models.CharField(max_length=255, blank=True)
    alt = models.CharField(max_length=200)
    object_position = models.CharField(max_length=64, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_default_exterior = models.BooleanField(default=False)
    is_default_interior = models.BooleanField(default=False)

class StudioLocation(models.Model):
    city = models.CharField(max_length=80)
    studio_name = models.CharField(max_length=120, blank=True)
    address = models.TextField(blank=True)
    active = models.BooleanField(default=True)

class TestDriveRequest(models.Model):
    reference = models.CharField(max_length=24, unique=True, editable=False)
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    location = models.ForeignKey(StudioLocation, null=True, on_delete=models.SET_NULL)
    city = models.CharField(max_length=80)          # denormalized for history
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT)
    preferred_date = models.DateField()
    consent = models.BooleanField()
    source = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=16, choices=LEAD_STATUS, default='new')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class SiteContent(models.Model):
    """Singleton. Use an admin singleton pattern (one row)."""
    ...

class StudioSettings(models.Model):
    """Singleton: notification email, response-time copy, maintenance flag."""
    ...
```

### Public API contract (build in Phase 2, consume in Phase 4+)

Django REST Framework, mounted at `/api/`.

```text
GET    /api/vehicles/                    # published only; supports ?category=
GET    /api/vehicles/<slug>/
GET    /api/locations/                   # active cities for the form
POST   /api/test-drive-requests/         # public form
GET    /api/content/                     # about / home copy
GET    /api/settings/                    # public-safe settings only
```

Staff does **not** need a parallel `/api/admin/*` in v1. Django Admin writes the same tables the public API reads.

If a React admin is added later, then add session- or token-authenticated admin viewsets. Do not build those in Phases 0–9.

Public POST error shape:

```json
{ "error": "Validation failed", "details": { "email": ["Enter a valid email."] } }
```

---

## Phase 0 — Foundation

**Goal:** Django project, PostgreSQL, React shell, design tokens. No real pages yet.

### Backend

- Django 5 project `config`, apps: `catalog`, `leads`, `studio`, `accounts` if needed
- PostgreSQL via `DATABASE_URL` (Railway in production; SQLite is allowed locally if `DATABASE_URL` is unset)
- `django-environ`, `djangorestframework`, `django-cors-headers`, `boto3` (R2 is S3-compatible)
- Split settings: `base` / `local` / `production`
- `.env.example`: `SECRET_KEY`, `DEBUG`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, Cloudflare R2 keys
- First migrations: URL fields for images, not `ImageField` / `FileField`
- `catalog/services/cloudflare.py` upload helper (called from admin in Phase 4)
- `createsuperuser` documented; seed command can wait until Phase 2
- `/admin/` loads with Unfold (or default admin if Unfold is deferred to Phase 3)
- DRF browsable API at `/api/` with an empty router is enough
- `python manage.py check` passes

### Frontend

- Vite + React + TypeScript + Tailwind + ESLint
- Import palette, glass, noise, reveal, drift, and reduced-motion rules from `website.md`
- Self-host Space Grotesk, Manrope, and DM Mono (do not rely only on Google Fonts)
- Empty layout shell: header placeholder, footer placeholder, ambient background, grain overlay
- `src/lib/api.ts` with `API_BASE_URL` pointing at Django (`http://127.0.0.1:8000/api`)
- README: how to create the venv, migrate, run both servers

### Done when

- `python manage.py runserver` starts
- `python manage.py migrate` succeeds
- `npm run dev` starts
- Tokens render: scarlet CTA on `#090a10` background, glass panel, mono labels
- `/admin/` is reachable on port 8000

### Out of this phase

Public copy, car pages, serializers, uploads, seed catalog.

---

## Phase 1 — Public showroom with mock data

**Goal:** Visual and interaction parity with `website.md`, still using local mock objects. This proves the **layout and motion** before the CMS exists. Django can stay idle except for `/admin/`. Mock cars are throwaway layout fixtures — generic names only, never Apex R / Solara / Vesper.

### Build

Public pages, all using temporary `frontend/src/data/mock-vehicles.ts`. Mock entries exist only so the UI can be built; they are deleted in Phase 4.

Treat the home page as **data-driven even while mocked**:

- Hero image, name, CTA (“Meet {name}”), and stats come from the mock vehicle marked `featuredOnHome`
- Line-up is the rest of the mock list
- One car detail template for every slug. If a vehicle has a gallery, show the switcher. There is no “flagship-only” layout.

| Route | Must include |
| --- | --- |
| `/` | Full-viewport **featured vehicle** hero, wordmark, nav, location/time cue, Meet {featured name} + Explore collection CTAs, featured specs, brand narrative, line-up from the mock list, private-drive banner, footer |
| `/showcase` | Intro, All / Performance / Electric / Executive filters, animated grid, curated count, “Beyond the showroom” blocks |
| `/cars/:slug` | One template: status, gallery if present, description, power, 0–100, test-drive CTA |
| `/test-drive` | Intro, visual panel from featured or selected vehicle, name, email, date, city, vehicle buttons from the mock list, client-side validation, confirmation UI (not persisted yet) |
| `/about` | Intro, founder quote, history, “The Kaka code”, studio image, New Delhi location, CTA |
| `not-found` | Signal lost / 404 with route back to the studio |

Also:

- `PageShell` crossfade (`opacity` 0.35s)
- Header: desktop nav, mobile menu (`aria-expanded`), test-drive button
- Vehicle cards: image scale 1.05, scarlet arrow tile
- Reduced motion respected
- Responsive pass at the viewports listed in `website.md`

### Done when

- All public routes match the **look and motion** of the handoff at desktop and mobile
- Changing which mock car is `featuredOnHome` changes the hero without a layout rewrite
- Filters rearrange the grid instead of hard-refreshing
- Test-drive form shows a confirmation state in the browser only
- No Django writes are required to demo the public site
- Source contains no “Apex R”, “Solara”, or “Vesper” strings

### Out of this phase

API writes, serializers, real persistence, SEO metadata beyond basic titles.

---

## Phase 2 — Django APIs and studio seed

**Goal:** Locations and site copy live in PostgreSQL. Public read APIs work. The vehicle table can be empty until staff add cars. The React site may still be on mock data.

### Build

- Management command `seed_showroom`:
  - Locations: at least New Delhi, plus 2–3 other cities
  - Singleton `SiteContent` (home/about copy — brand language, not car names)
  - **Do not seed fictional vehicles.** Production catalog is created in admin.
  - Superuser is **not** created by seed (use `createsuperuser`)
- Optional: a separate `seed_dev_vehicles` command for local UI testing, clearly named, never run in production, and still not using Apex R / Solara / Vesper
- DRF viewsets / APIViews:
  - `VehicleViewSet` (read-only, published queryset — may return `[]`)
  - `Vehicle` by slug
  - `LocationViewSet` (active only)
  - `Content` retrieve singleton
- Unpublished vehicles must **not** appear on public GET
- Serializers nested: vehicle includes `gallery`, absolute media URLs
- Pagination off or large page size for a small catalog
- `django-filter` for `?category=`
- Throttling classes registered (even if limits are generous)
- Simple request logging (`django.request` or a thin middleware)

### Seed rules

- `slug` is unique and URL-safe when a vehicle exists
- Featured home vehicle is a flag on the model (`featured_on_home`), not a hardcoded name
- Alt text is real product language, not “image1”
- `seed_showroom` is safe to re-run (update_or_create locations and the content singleton)

### Done when

- `GET /api/vehicles/` returns a JSON list (empty is valid)
- Creating a published vehicle in a test / shell makes `GET /api/vehicles/<slug>/` return specs + gallery
- Draft vehicles are hidden from public endpoints
- `python manage.py seed_showroom` can be re-run in development without inventing a fake line-up

### Out of this phase

Wiring the public pages off mock data (Phase 4). Fancy admin inlines can wait for Phase 3–4, but registering models in admin now is useful.

---

## Phase 3 — Django admin authentication and shell

**Goal:** Only staff can reach `/admin/`. The panel is usable and themed.

### Build

- Unfold (preferred) or Jazzmin: dark theme, Kaka wordmark, scarlet accent where configurable
- Login: Django’s admin login, staff-only
- `is_staff` required; visitors have no accounts
- Admin index groups: Catalog, Leads, Studio
- Sidebar / app list: Vehicles, Test drives, Locations, Content, Settings
- Placeholder dashboard cards (counts can be zeros until Phase 7)
- `AXES` or Django’s `ADMINS` + `django-axes` / simple throttle on login
- Session cookie: `HttpOnly`, `Secure` in production, `SameSite=Lax`
- Change password via Django’s built-in form
- `DEBUG=False` must not serve a stack trace on failed login

### Done when

- Unknown users cannot open `/admin/`
- A superuser lands on the themed dashboard
- Logout returns to admin login
- Public Vite site remains reachable without a Django session

### Out of this phase

Full vehicle inlines and lead workflow (empty registered models are OK if list pages exist).

---

## Phase 4 — Vehicle CMS (admin → public catalog)

**Goal:** Staff can add, edit, publish, and unpublish cars in Django Admin. The public showroom and detail pages read from DRF. This is the first real public ↔ admin connection.

### Django admin

**Vehicle list**

- `list_display`: thumbnail, name, category, status, featured, updated
- `list_filter`: status, category, featured
- `search_fields`: name, slug
- `list_editable` or admin action: publish / unpublish
- `prepopulated_fields` for slug from name until published; freeze slug after first publish if you want stable URLs

**Vehicle change form**

- Fieldsets: identity, copy, specs, flags, card/hero uploads
- Upload widgets accept a file; on save, Django sends the file to Cloudflare R2 and writes `image_url` + `object_key` into Railway
- `GalleryMedia` stacked/tabular inline: upload, kind, alt, object-position, sort order, default exterior/interior
- Preview link to `FRONTEND_URL/cars/<slug>/` (only meaningful if published)
- Validation: cannot set `status=published` without `card_image_url`, name, slug, summary, power, acceleration

**Media rules**

- Never store image bytes in PostgreSQL or on the Railway filesystem
- Validate type and size before upload (JPEG, PNG, WebP, AVIF — no SVG)
- Replacing an image deletes the previous R2 object using `object_key`
- Public API returns only URLs, never R2 keys or credentials

### Public site changes

- Delete mock catalog usage
- `src/lib/api.ts` fetches `/api/vehicles/` and `/api/vehicles/:slug/`
- Home hero = the published vehicle with `featured_on_home=True` (if several, lowest `sort_order`). If none featured, first published by `sort_order`. If none published, branded empty state — never a fallback fake car.
- Home line-up = other published vehicles
- Showcase grid + category filters from API (`?category=` or client filter of the published list)
- `/cars/:slug` 404s for unknown or unpublished slugs
- Gallery switcher is data-driven for any car that has gallery items
- Empty states: “Collection in motion” if no published cars
- Loading and error states for failed Django requests
- CTA copy is interpolated (`Meet {name}`), never a hardcoded model name

### Done when

- Admin can create a car, publish it, and see it on `/showcase` without a frontend code change
- Marking a car featured updates the homepage hero
- Unpublishing that car removes it from home and showcase
- A gallery can have more than two images on any vehicle
- Direct load/refresh of `/cars/<slug>` still works (Wouter + Vite history fallback)

### Out of this phase

Test-drive persistence, about-page CMS, emails.

---

## Phase 5 — Test-drive pipeline

**Goal:** The public form creates a Django `TestDriveRequest`. Staff process it in admin. This is the second public ↔ admin connection.

### Public form

Replace client-only confirmation with `POST /api/test-drive-requests/`:

- Fields: name, email, preferred date, city (from `GET /api/locations/`), vehicle (from published vehicles)
- Consent checkbox required
- Client Zod + DRF serializer validation
- Loading, success, error, retry
- Success card shows **first name** + **reference number** + response-time copy
- Honeypot field + DRF throttle (`AnonRateThrottle` on this view)
- Do not list other visitors’ requests (create-only endpoint, no GET)

On save:

- `status='new'`
- Unique `reference` (`KM-YY-####`) in `save()` or a service function
- Store `source` (page path or UTM if present)
- `consent` must be `True` or the serializer rejects the row

### Django admin inbox

**List**

- Newest first (`ordering = ['-created_at']`)
- `list_filter`: status, vehicle, location, preferred_date
- `list_display`: reference, name, vehicle, city, preferred_date, status, created_at
- Badge / dashboard count of `status='new'` (can be a simple admin index module)

**Change form**

- Readonly: reference, payload fields (name, email, vehicle, date) — staff should not silently rewrite the visitor’s request
- Editable: status, admin notes
- Status workflow: New → Contacted → Scheduled → Completed, or Cancelled
- Link to the related Vehicle in admin
- Public API cannot PATCH status

### Email (minimum)

- `send_mail` (or Anymail) to `StudioSettings.notification_email` when a request is created
- Body: reference, name, vehicle, date, city
- Optional visitor confirmation email can wait until Phase 7; if built now, include the reference number

### Done when

- Submitting `/test-drive` inserts a row in PostgreSQL
- The request appears in `/admin/leads/testdriverequest/`
- Changing status in admin does not change the public catalog
- Invalid payloads never persist
- Rapid duplicate submits are throttled

### Out of this phase

Calendar sync, SMS, payment holds, driver assignment.

---

## Phase 6 — Locations, content, and settings

**Goal:** Almost nothing on the public site is hardcoded copy. Django admin owns cities, about-page story, and studio settings.

### Admin

**Locations** (`StudioLocation`)

- CRUD cities used by the test-drive select
- Active flag; inactive cities disappear from `GET /api/locations/`
- Optional address / studio name (New Delhi studio from the about page)

**Content** (`SiteContent` singleton)

- Home headline, eyebrow, CTA labels, narrative
- About: intro, founder quote, history, values (“The Kaka code”), studio blurb
- Test-drive intro and privacy reassurance
- Prevent adding a second row (admin + model `save`)

**Settings** (`StudioSettings` singleton)

- Studio display name and response-time copy
- Notification email
- Default currency
- Maintenance flag (optional): public site shows a branded pause state
- `GET /api/settings/` returns only public-safe fields (never the notification inbox address)

### Public site

- About page and home narrative read `GET /api/content/`
- City dropdown is live locations
- Footer snippets from public settings

### Done when

- Changing the founder quote in admin updates `/about`
- Adding “Mumbai” as an active location shows it on the form
- Disabling a city hides it without a frontend deploy

---

## Phase 7 — Polish the connected experience

**Goal:** Production-quality wiring: SEO, states, shortlist, and an admin dashboard. No new product areas.

### Django admin dashboard (`/admin/`)

- Counts: published vehicles, new test drives, this week’s requests
- Latest 5 leads
- Vehicles missing a hero image or specs
- Links into the relevant ModelAdmin

Unfold dashboard callbacks or a custom `AdminSite.index` template are enough.

### Public quality

- Unique `<title>`, meta description, OG title/description/image, canonical per route (`react-helmet-async`)
- Suggested titles from `website.md`
- `Vehicle` JSON-LD on detail pages
- `AutoDealer` / `Organization` JSON-LD on home/about
- Note: a Vite SPA will not give crawlers perfect OG tags. For production sharing, either:
  - prerender the five public routes, or
  - add thin Django templates that only emit meta tags and hydrate the React app
- Add-to-shortlist: `localStorage` in v1. Admin does not need shortlists
- Error, loading, and empty states on every public data view
- Keep `data-testid` hooks stable for tests

### Admin quality

- Publish validation stays in `Vehicle.clean()` / admin form
- Image alt required on gallery rows before publish
- Cannot publish a vehicle with no card image

### Django quality

- `select_related` / `prefetch_related` on vehicle+gallery queries
- API tests with Django’s test client / pytest-django for published-vs-draft and test-drive POST
- Frontend types generated optionally from OpenAPI (`drf-spectacular`) — nice, not required

### Done when

- Sharing `/cars/<slug>` shows that car’s title (and OG image if prerender/meta path exists)
- Dashboard numbers match the database
- A vehicle cannot be published incomplete
- pytest covers: draft hidden, published listed, test-drive creates reference

---

## Phase 8 — Performance, accessibility, and hardening

**Goal:** Launch checklist from `website.md` sections 8–9.

### Performance

- Responsive image derivatives (easy-thumbnails, ImageKit, or django-imagekit; AVIF/WebP)
- Mobile-specific hero crops + `object_position` from media metadata
- Preload only the home hero on the public site
- Lazy-load below-the-fold images
- Width/height or aspect-ratio boxes (no CLS on hero/cards)
- Self-hosted fonts with `font-display: swap`
- Cloudflare R2 remains the image origin; optional custom domain + cache
- WhiteNoise for Django static only (admin CSS/JS). Vehicle photos never go through WhiteNoise

### Accessibility

- Alt text on all images
- Labels on icon-only buttons
- Keyboard nav, visible scarlet focus, `aria-expanded` on the menu
- Form errors in an inline summary
- Contrast over photography
- `prefers-reduced-motion` still disables drift, reveal, and long crossfades
- Touch targets ≥ 44×44px

### Security and ops

- DRF throttle on `POST /api/test-drive-requests/`
- CORS allowlist (no `CORS_ALLOW_ALL_ORIGINS` in production)
- Django `CSRF`, `SECURE_SSL_REDIRECT`, HSTS, `SESSION_COOKIE_SECURE`
- `django-csp` or equivalent security headers
- Runtime error reporting (Sentry)
- Consent-aware analytics on the public site only
- PostgreSQL backups
- `LogEntry` is already Django’s audit trail; confirm it is visible in admin

### QA matrix

Test at: 320×568, 360×800, 390×844, 768×1024, 1024×768, 1280×800, 1440×1000, 1920×1080.

Browsers: Safari iOS, Chrome Android, Chrome desktop, Safari desktop.

### Done when

- LCP under 2.5s on a reasonable 4G profile for `/`
- No horizontal scroll at 320px
- Keyboard-only path can book a test drive
- Direct URL refresh works on every public route (Vite `historyApiFallback` / production Nginx try_files)
- `/admin/` still works after refresh
- No third-party manufacturer marks or unlicensed assets

---

## Phase 9 — Launch

**Goal:** A production environment with real staff users.

### Build

- Gunicorn (or uvicorn) + Nginx: static/media, reverse proxy to Django, SPA fallback to `frontend/dist`
- Production env: `DEBUG=False`, HTTPS, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`, `DATABASE_URL`
- Collectstatic + migrate as deploy steps
- Production superusers created by hand (no demo password in seed)
- Staging vs production: never point staging Django at the production database
- Uptime check on the public origin and `GET /api/vehicles/`
- Runbook: how to add a car in admin, how to process a lead, how to restore a backup
- Freeze visual language: no last-minute palette experiments

### Launch smoke test

1. Log into Django admin
2. Publish a small copy change on About
3. Confirm it on the public site
4. Add a draft car, confirm it is hidden, then publish
5. Submit a test-drive as a visitor
6. See the lead in admin, mark Contacted
7. Log out and confirm `/admin/` is blocked

### Done when

- Production URL serves the public site
- Staff can operate the showroom without a developer
- The items in `website.md` section 9 are ticked

---

## Later (not in v1)

Keep these off the critical path. They must not block Phases 0–9.

- Custom React admin consuming DRF (token/session)
- 360° / Three.js model viewer
- Paint / wheel / interior configurator
- Short silent drive films
- Visitor accounts and synced shortlists
- CRM export or HubSpot/Salesforce
- Django groups: sales vs content editor (`ModelAdmin` permissions)
- Multi-studio inventory and live slot booking
- Payments or reservation deposits

If any of these start, treat them as **Phase 10+** with the same rule: progressive enhancement, reduced-motion safe, never blocking the catalog or the test-drive form.

---

## Build sequence (week-style view)

This is a planning aid, not a deadline.

| Order | Phase | What you can demo at the end |
| --- | --- | --- |
| 0 | Foundation | React shell + Django project + Postgres |
| 1 | Public mock | Full cinematic site, fake data |
| 2 | APIs + studio seed | JSON API; catalog may be empty until admin adds cars |
| 3 | Admin auth | Themed, locked Django admin |
| 4 | Vehicle CMS | Add a car in admin, see it on the site |
| 5 | Test drives | Form → Django inbox → status |
| 6 | Content CMS | Edit about/home/cities without code |
| 7 | SEO + dashboard | Sharable pages, operational home |
| 8 | Hardening | Fast, accessible, safe |
| 9 | Launch | Live showroom |

The first moment the product is “dynamic” is the end of **Phase 4**. The first moment it is a working dealership loop is the end of **Phase 5**.

---

## Definition of “connected”

Use this as the integration test after Phase 6:

1. In Django admin, add any real showroom vehicle (name, category, hero, card, specs, two gallery images).
2. Publish it.
3. `/showcase` includes that vehicle; category filters still work.
4. `/cars/<its-slug>` renders its name, specs, gallery, and Reserve a drive.
5. Mark it featured; `/` hero uses that car’s image, name, and specs.
6. Visitor submits a test drive for that vehicle in New Delhi.
7. Admin inbox shows reference, visitor name, vehicle, city, date.
8. Staff sets status to Scheduled and writes a note.
9. Unpublish the vehicle.
10. Public showcase no longer lists it; the old lead remains in admin history.

If that loop works, the React site and Django admin are connected.

---

## Working agreements

- Public API never returns draft or archived vehicles.
- Django admin is the only writer for catalog, locations, and content.
- The test-drive form is the only public writer, and it can only insert leads.
- Image files live in Cloudflare R2. Railway PostgreSQL stores `image_url` (and the object key). Never store image bytes in the database.
- Never hardcode vehicle names, slugs, or specs in frontend components. `website.md` cars (Apex R, Solara GT, Vesper S) are mock-only and must not ship.
- Scarlet remains a signal on the public site: primary actions, active filters, focus, selected vehicle.
- Do not restyle every admin changelist to look like the showroom. Admin is a tool.
- Preserve `website.md` design principles on the React site while Django owns CMS behavior.
- When a phase is finished, update this file’s checklist below.

---

## Phase checklist

Copy this into issues or tick it here as you go.

- [x] Phase 0 — Foundation (Django + React + Postgres)
- [x] Phase 1 — Public showroom (mock data)
- [x] Phase 2 — DRF APIs and studio seed (Pakistan catalog)
- [x] Phase 3 — Django admin authentication and theme
- [x] Phase 4 — Vehicle CMS connected to public site
- [x] Phase 5 — Test-drive form connected to admin inbox
- [x] Phase 6 — Locations, content, settings
- [x] Phase 7 — Dashboard, SEO, publish rules
- [x] Phase 8 — Performance, a11y, hardening
- [ ] Phase 9 — Launch

When Phase 9 is ticked, this plan is complete. New work goes to Phase 10+ rather than reopening v1 scope.
