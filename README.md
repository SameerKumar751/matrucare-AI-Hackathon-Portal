# MatruCare AI – Hackathon Registration Portal

A MERN application where participants sign up, verify their email with an OTP, log in to a dashboard and register for the hackathon with full team management. Emails are sent through Nodemailer (Gmail SMTP) as **MatruCare AI &lt;sameergaurgkp@gmail.com&gt;**.

## Features
- Signup (bcrypt-hashed password) → 6-digit OTP email → verification → login
- OTP: cryptographically random, stored only as an HMAC hash, expires in 10 min, single use, max 5 wrong attempts, 60 s resend cooldown, rate limited
- JWT in an HTTP-only cookie, session restored on refresh, protected routes (client + server)
- Dashboard with profile, verification status, saved registration, team and confirmation-email status
- Registration form (all 14 fields), dynamic team members (team size 1–5, leader counts as one), client + server validation, one registration per user (unique index)
- Confirmation email with project, domain, college, team and links
- Contact form → email to sameergaurgkp@gmail.com
- CSRF protection (Origin/Referer validation + session-bound CSRF token), Helmet, CORS with credentials, NoSQL-injection sanitising, rate limiting, central error handling that never leaks internals
- Failed confirmation emails can be retried by the registration owner from the dashboard (no duplicate registration)

## Tech stack
React 18 + Vite, Tailwind CSS, React Router, Axios, Lucide · Node.js, Express 4, MongoDB + Mongoose · JWT, bcrypt · Nodemailer (Gmail SMTP)

## Structure
```
matrucare-ai/
├── client/   React app (src/pages, components, context, services, config, utils)
├── server/   Express API (config, controllers, middleware, models, routes, services, templates, utils)
├── README.md
└── .gitignore
```

## Local setup
Requirements: Node 18+, MongoDB (local or Atlas).
```bash
# 1. API
cd server && cp .env.example .env     # fill in values (see below)
npm install && npm run dev            # http://localhost:5000

# 2. Frontend (new terminal)
cd client && cp .env.example .env
npm install && npm run dev            # http://localhost:5173 (proxies /api to :5000)
```
On start the server logs `[mail] SMTP connection verified` or the exact reason it is not ready. `npm run test:email` (in `server/`) sends a real test email to `EMAIL_USER`.

## MongoDB
- Local: `MONGO_URI=mongodb://127.0.0.1:27017/matrucare`
- Atlas: create a free cluster → Database Access user → Network Access (allow your IP / Render's) → Connect → Drivers → copy the `mongodb+srv://…` string into `MONGO_URI`.

## Gmail App Password
1. Sign in to the matrucareai@gmail.com Google account → Security → enable **2-Step Verification**.
2. Open https://myaccount.google.com/apppasswords → create an app password (name e.g. "MatruCare server").
3. Copy the 16-character password into `EMAIL_PASS` in `server/.env` (spaces are ignored). Never commit it.
If credentials are missing/invalid, the API returns the precise reason (e.g. `Gmail rejected the credentials…`) and nothing is reported as sent.

## Environment variables
| File | Variable | Purpose |
|---|---|---|
| server | `PORT`, `NODE_ENV` | port / `production` in prod |
| server | `MONGO_URI` | MongoDB connection string |
| server | `JWT_SECRET`, `JWT_EXPIRES_IN` | JWT signing (also keys the OTP HMAC) |
| server | `CLIENT_URL` | allowed frontend origin(s), comma separated. **Must exactly match the browser origin** (e.g. `https://my-app.vercel.app`, no path): it is used for CORS and CSRF origin validation |
| server | `COOKIE_SAMESITE` | optional `lax`/`strict`/`none` (default `lax` dev, `none` prod) |
| server | `EMAIL_USER` | **must be exactly `matrucareai@gmail.com`**; any other value is rejected (`EMAIL_SENDER_MISMATCH`) so the sender identity cannot change silently |
| server | `EMAIL_PASS` | Gmail App Password |
| server | `MONGO_URI_TEST` | optional, tests only: use this database instead of the in-memory one |
| server | `DISABLE_RATE_LIMIT` | tests only; never set in production |
| client | `VITE_API_URL` | optional API origin; empty = same-origin `/api` |

## API
All responses: `{ success, message, data? }`; errors may include `errors` (field map).
| Method & path | Auth | Description |
|---|---|---|
| POST `/api/auth/signup` | – | `fullName,email,password,confirmPassword` → creates unverified user, emails OTP |
| POST `/api/auth/verify-otp` | – | `email,otp` → verifies account |
| POST `/api/auth/resend-otp` | – | `email` (60 s cooldown) |
| POST `/api/auth/login` | – | sets HTTP-only cookie; 403 `EMAIL_NOT_VERIFIED` if unverified |
| POST `/api/auth/logout` | – | clears cookie |
| GET `/api/user/me` | ✔ | current user |
| PUT `/api/user/update` | ✔ | update `fullName` |
| POST `/api/hackathon/register` | ✔ | create registration + send confirmation (409 if duplicate) |
| GET `/api/hackathon/my-entry` | ✔ | `data.registration` or `null` |
| POST `/api/hackathon/:id/resend-confirmation` | ✔ owner | retry a failed confirmation email (403 if not owner, 409 if already sent, 429 within 60 s of last attempt, 502 if SMTP fails again; max 5/hour) |
| DELETE `/api/hackathon/:id` | ✔ owner | delete own registration |
| POST `/api/contact` | ✔ | send message to matrucareai@gmail.com |
| GET `/api/health` | – | health check |

## Editing event content
Dates and prizes were not provided in the assignment, so they are placeholders ("TBA") in `client/src/config/eventConfig.js`.

Dropdown options, **including the college list**, live in `client/src/config/options.json` and `server/config/options.json`. The server rejects any college not in its list, so edit **both files identically** (the test `tests/unit/options.test.js` fails if they differ). The default colleges are generic placeholders, not an official list.

## Design system (visual redesign)
Dark cinematic event look, defined in `client/tailwind.config.js` and `client/src/index.css`:
`void #080711` (page), `night #100D1D`, `surface #171425`, `magenta #FF2DAA`, `neon #00E5FF`, `gold #F5C879`, `fg #F7F4ED`, `muted #A5A1B5`. Fonts: Space Grotesk (headings), Inter (body), Space Mono (technical labels), loaded from Google Fonts in `client/index.html`.
- Home sections live in `client/src/components/home/` (Hero, Highlights, Domains, Timeline, Prizes, About, FinalCta). The hero artwork is layered SVG + CSS (no 3D library, no new dependencies).
- **Countdown:** set `eventDate` (ISO string) in `client/src/config/eventConfig.js` to enable it. While it is `null` the countdown is disabled and shows "Event date - to be announced".
- Animations are CSS/IntersectionObserver based and are reduced to instant states under `prefers-reduced-motion`.
- Internal pages (Signup, OTP, Login, Dashboard, Register, Contact) share the same `.btn-*`, `.input`, `.card` and `.page-title` styles.

## Security notes
- **Auth:** bcrypt (cost 12), JWT in an HTTP-only cookie (`Secure` + `SameSite` configurable in production).
- **CSRF (two layers):**
  1. Every POST/PUT/PATCH/DELETE under `/api` has its `Origin` (or `Referer`) validated against `CLIENT_URL`; a request with a cookie but no Origin/Referer is rejected.
  2. Authenticated writes must send `X-CSRF-Token`, an HMAC bound to the session JWT. The SPA receives it in the JSON body of `POST /api/auth/login` and `GET /api/user/me` (unreadable cross-site because of CORS) and keeps it in memory. This is compatible with the Vercel `/api` proxy because the browser's Origin stays the frontend origin.
- **OTP:** HMAC-hashed, 10-min expiry, single use, 5 wrong attempts, 60 s cooldown shared by signup and resend (repeat signups cannot bypass it).
- **Email identity:** always `MatruCare AI <matrucareai@gmail.com>`; a mismatching `EMAIL_USER` is refused.
- **Errors:** all errors use `{ success:false, message, code?, errors?, retryAfter? }`. Unknown errors return a generic 500 and are logged server-side only; models never serialise password/OTP fields or raw SMTP error text.

## Testing
```bash
cd server
npm install
npm run test:unit          # pure unit tests, no database needed
npm run test:integration   # API tests: needs devDependencies; downloads an in-memory MongoDB on first run
npm test                   # both
```
Unit tests cover validators (signup, registration, team size, college), OTP hashing, email templates (HTML + plain text), sender identity, CSRF/origin guard and error handling. Integration tests cover signup, OTP verify/expiry/single use/attempt limit, signup cooldown, login, protected routes, CSRF, registration validation, duplicates, email failure and retry, and contact. Email transport is stubbed in tests (no real email is sent); use `npm run test:email` for a real SMTP check.
Client: `cd client && npm run build` must complete without errors.

## Deployment
**Backend (Render/Railway):** root `server`, build `npm install`, start `npm start`; set all server env vars, `NODE_ENV=production`, `CLIENT_URL=https://<your-frontend>`.
**Frontend (Vercel/Netlify):** root `client`, build `npm run build`, output `dist`.
- Recommended (Vercel): edit `client/vercel.json` and replace `YOUR-BACKEND.onrender.com` with your API host. `/api` is then same-origin, so cookies work in Safari too; set `COOKIE_SAMESITE=lax` and `CLIENT_URL` to your exact Vercel URL.
- Netlify: add a proxy rule `/api/*` → your backend in `netlify.toml`, or set `VITE_API_URL` to the API origin and keep `COOKIE_SAMESITE=none`.

## Screenshots
Add screenshots to `docs/` and link them here after running the app (Home, Signup, OTP, Dashboard, Registration, confirmation email).

## Demo checklist (3–5 min)
Signup → OTP email → verify → login → dashboard ("Register Now") → registration with a team → confirmation email → dashboard shows saved data.
# matrucare-AI-Hackathon-Portal
