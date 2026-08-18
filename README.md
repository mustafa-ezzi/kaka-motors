# Kaka Motors

Premium showroom site (React) with a Django API and admin. Vehicle photos live in **Cloudflare R2**. Railway PostgreSQL stores `image_url` only.

Phase 0–5 is in place: Django APIs, Pakistan catalog seed, cinematic public site, React studio CMS, and a live test-drive inbox.

## Local setup

### Backend

```bash
cd backend
py -3 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
py manage.py migrate
py manage.py seed_showroom
py manage.py createsuperuser
py manage.py runserver 8001
```

- API health: http://127.0.0.1:8001/api/health/
- Vehicles: http://127.0.0.1:8001/api/vehicles/
- Admin (staff only): http://127.0.0.1:8001/admin/

Create a staff user once:

```bash
py manage.py createsuperuser
```

The admin uses a dark Unfold theme (Kaka Motors / scarlet). Failed logins lock after 6 tries for 15 minutes. Use **Change password** from the account menu. The public site does not require this login.

The API uses port **8001** so it does not collide with other local Django apps on 8000.

Add or publish cars in the React studio (staff login):

- Studio: http://localhost:5173/studio/login
- Vehicles, locations, drives, copy, and settings are full CRUD there.
- Public `/test-drive` creates a request; it appears under **Drives** in studio and in Django admin.

The Django admin at http://127.0.0.1:8001/admin/ still works as a backup.

Without `DATABASE_URL`, Django uses local SQLite. On Railway, set `DATABASE_URL` to the Postgres plugin.

`seed_showroom` writes Karachi / Karachi / Islamabad / Faisalabad plus the current floor:

- Honda Civic (featured)
- Toyota Corolla Grande
- Honda Vezel
- Suzuki Baleno
- Suzuki Hustler

Re-run it any time. Pass `--skip-vehicles` to refresh copy and cities only.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Public site: http://localhost:5173 (Vite will pick 5174/5175 if those ports are taken)

## Image storage

Staff attach a picture in Django admin. Django uploads it to **Cloudflare R2** when those env vars are set. Railway Postgres stores only `image_url` and `object_key`.

Locally, if R2 is not configured, files are saved under `backend/media/` so you can still add cars. Production (`config.settings.production`) refuses to start without R2.

Required env for production (see `backend/.env.example`):

- `CLOUDFLARE_R2_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET_NAME`
- `CLOUDFLARE_R2_PUBLIC_BASE_URL`

Build order: `development-phases.md`. Visual language: `website.md`.

## Phase 8 — hardening

- **Images:** public API can emit Cloudflare Image Resizing `srcSet` when `CLOUDFLARE_IMAGE_RESIZE_BASE` is set (example: `https://your-domain/cdn-cgi/image`). Local `/media` files are left as-is. The React site lazy-loads below-the-fold photos and preloads only the home hero.
- **Static:** WhiteNoise serves Django admin CSS/JS from `STATIC_ROOT`. Vehicle photos never go through WhiteNoise.
- **Security:** production requires a CORS allowlist and `CSRF_TRUSTED_ORIGINS`, sets HSTS, and sends a Content-Security-Policy. Test-drive posts stay throttled (`8/min`).
- **Errors:** set `SENTRY_DSN` to report Django exceptions.
- **Analytics:** set `VITE_PLAUSIBLE_DOMAIN` on the frontend. A consent banner loads Plausible only after the visitor allows it.
- **Backups:** `py manage.py backup_db` copies SQLite, or runs `pg_dump` when Postgres is configured. Files land in `backend/backups/`.
- **Audit:** Django `LogEntry` is in the admin sidebar under **Audit log**.
- **SPA refresh:** Vite `appType: 'spa'` plus `frontend/public/_redirects`. Production Nginx should use `try_files $uri /index.html;`.

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Railway

This is a **monorepo**. Create **two services**. Do not use one start command for both.

### Backend service

- **Root Directory:** `backend`
- **Start Command:** `sh start.sh`
- Variables: `DJANGO_SETTINGS_MODULE=config.settings.production`, `DEBUG=False`, `SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`, `CLOUDFLARE_R2_*`

### Frontend service

- **Root Directory:** `frontend`
- **Start Command:** `node server.mjs`
- Build happens via `npm run build` (Railpack / `package.json`)
- Variable: `VITE_API_BASE_URL=https://YOUR-BACKEND.up.railway.app/api` (set **before** build, then redeploy)

Do not put `$PORT` in any start command. Do not install/run `serve` with `-l $PORT`. Railway injects `PORT`; `server.mjs` reads it as a number.
