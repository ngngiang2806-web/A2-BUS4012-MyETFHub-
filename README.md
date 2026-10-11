# MyETFHub

MyETFHub is an ETF portfolio tracking application built with a React frontend, a Python FastAPI backend, and Supabase Auth/PostgreSQL. It records historical purchase information; it does not provide financial advice, live market prices, trading features, or investment recommendations.

## Implemented features

- Supabase email/password sign-up, sign-in, sign-out, and session restoration.
- Investor profiles with a full name, investment goal, risk preference, and investment timeframe.
- ETF holdings with ticker, units, purchase price, and purchase date.
- Portfolio total-invested and allocation calculations based on historical cost (`units × purchase price`).
- FastAPI endpoints protected by Supabase access tokens.
- Supabase Row Level Security (RLS) policies so users can access only their own profile and holdings.

## Prerequisites

- Git.
- Node.js and npm. This repository includes `package-lock.json`; use npm for the frontend.
- Python 3.11 or a compatible Python 3 version, plus `pip`.
- A Supabase project with Email/Password Auth enabled.

## Frontend setup

From the repository root in Windows PowerShell:

```powershell
Set-Location 'C:\path\to\A2-BUS4012-MyETFHub-'
npm ci
Copy-Item '.env.example' '.env'
```

Edit the local `.env` file with your own Supabase project settings:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Start the frontend:

```powershell
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. If Vite uses another port, make the backend `FRONTEND_ORIGIN` match that exact URL without a trailing slash.

Available frontend scripts:

```powershell
npm run dev
npm run build
npm run preview
```

## Backend setup

Create and activate a virtual environment, then install the declared dependencies:

```powershell
Set-Location 'C:\path\to\A2-BUS4012-MyETFHub-\backend'
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item '.env.example' '.env'
```

Edit `backend\.env` with local values only:

```dotenv
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
FRONTEND_ORIGIN=http://localhost:5173
```

Start FastAPI:

```powershell
uvicorn main:app --reload
```

Then open:

- Health check: `http://127.0.0.1:8000/health`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

If PowerShell prevents activation of `.venv`, run the tools directly instead of changing system-wide execution policy:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

## Environment variables

| File | Variable | Purpose |
| --- | --- | --- |
| `.env` | `VITE_API_BASE_URL` | FastAPI base URL used by the browser application. |
| `.env` | `VITE_SUPABASE_URL` | Supabase project URL for browser authentication. |
| `.env` | `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key for browser authentication. |
| `backend\.env` | `SUPABASE_URL` | Supabase project URL used by FastAPI. |
| `backend\.env` | `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key used to verify authenticated requests and make RLS-aware database calls. |
| `backend\.env` | `FRONTEND_ORIGIN` | Exact Vite browser origin allowed by FastAPI CORS, for example `http://localhost:5173`. |

Create local files from the committed templates:

```powershell
Copy-Item '.env.example' '.env'
Copy-Item '.\backend\.env.example' '.\backend\.env'
```

The `.env.example` files contain placeholders and are safe to commit. Real credentials belong only in ignored local `.env` files. The normal application flow does not require a database password, `DATABASE_URL`, or a Supabase service-role key.

## Supabase migration

The SQL migration is located at:

```text
backend\migrations\001_create_investor_profiles_and_etf_holdings.sql
```

It defines `public.investor_profiles` and `public.etf_holdings`, foreign keys to `auth.users`, constraints, indexes, timestamp triggers, and RLS policies.

To apply it manually:

1. Open the intended Supabase project.
2. Open **SQL Editor**.
3. Open the migration file above in VS Code and review its SQL.
4. Check for existing tables or object-name conflicts in the target project.
5. Copy the SQL statements from the file into Supabase SQL Editor and run them only when they are appropriate for that database.
6. Verify the resulting tables, columns, relationships, constraints, and RLS policies in Supabase.

Do not paste the Windows file path into SQL Editor; paste the SQL contents. This repository does not use the Supabase CLI for migrations.

## API

Protected endpoints require a Supabase bearer access token.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Returns a simple API health response. |
| `POST` | `/investor-profile` | Creates or updates the authenticated user's investor profile. |
| `GET` | `/investor-profile` | Returns the authenticated user's profile. |
| `PUT` | `/investor-profile` | Updates editable profile fields. |
| `POST` | `/etf-holdings` | Creates an authenticated user's ETF holding. |
| `GET` | `/etf-holdings` | Lists the authenticated user's ETF holdings. |
| `GET` | `/etf-holdings/{holding_id}` | Returns one owned ETF holding. |
| `PUT` | `/etf-holdings/{holding_id}` | Updates one owned ETF holding. |
| `DELETE` | `/etf-holdings/{holding_id}` | Deletes one owned ETF holding. |

## Tests and checks

Run backend tests from the backend directory:

```powershell
Set-Location 'C:\path\to\A2-BUS4012-MyETFHub-\backend'
.\.venv\Scripts\python.exe -m pytest -q
```

Build the frontend from the repository root:

```powershell
Set-Location 'C:\path\to\A2-BUS4012-MyETFHub-'
npm run build
```

The repository does not currently define separate frontend test or lint scripts.

## Security

> **Security:** Never commit real `.env` files, database passwords, API secrets, access tokens, or Supabase service-role keys to GitHub. Keep real credentials in local environment files excluded by `.gitignore`. Commit only example configuration files containing placeholder values. If a secret has already been published, rotate or revoke it immediately.

The Supabase publishable key is intentionally used by the browser alongside Supabase Auth and RLS. It is not a replacement for RLS and must not be confused with a service-role key.