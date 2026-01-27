# Weather App

A React single-page app for logging in, saving a zip code, and viewing today’s weather. It talks to a .NET Core backend API for auth, zip storage, and weather data.

## Tech stack

- **React 19** + **TypeScript**
- **Vite 7** – dev server and production build
- **CSS** – plain CSS (no framework), light/dark via `prefers-color-scheme`

All API calls use a base URL from environment variables (see [Environment variables](#environment-variables)).

---

## Project structure

```
src/
├── api.ts           # getBaseUrl() – dev vs prod API base URL
├── types.ts         # RegisterResponse, LoginResponse, WeatherResponse
├── App.tsx          # Root: state, routing, loadWeather, page composition
├── App.css          # Layout and component styles
├── index.css        # Global (root, body, h1, button)
├── main.tsx         # Entry: React root mount
└── pages/
    ├── AuthPage.tsx   # Login / register form
    ├── ZipPage.tsx    # Enter or update zip code (POST/PUT /zip)
    └── WeatherPage.tsx # Weather card + “Change Location” button
```

- **App** holds `userId`, `zip`, `showZipForm`, and weather state. It decides which page to show and calls the weather API when `zip` is set.
- **Pages** are presentational and callback-driven; they call `getBaseUrl()` and the API, then report back via props (`onSuccess`, `onChangeLocation`, etc.).

---

## User flow and features

1. **Auth** – One form that can switch between Log in and Create account.
   - Username and password only (password masked), each limited to 100 characters.
   - **Register:** `POST /user` with `{ username, password }`. On success, app stores `id` and shows the main flow.
   - **Login:** `POST /login` with `{ username, password }`. On success, app stores `id` and, if present, `zip` from the response.

2. **Main flow after login**
   - If the user has no zip (e.g. new account or login didn’t return one): **Zip form** – “Enter your zip code” with validation (exactly 5 digits). Submit sends `POST /zip` with `{ zip, userId }` (zip as string). On success, app stores zip and loads weather.
   - If the user has a zip: **Weather view** – today’s weather for that zip. Data comes from `POST /weatherforecast` with `{ zip }`.

3. **Change location** – On the weather view, “Change Location” opens the zip form again in “update” mode (“Update your zip code”), pre-filled with the current zip. Submit sends `PUT /zip` with `{ zip, userId }`. On success, app updates zip, clears weather, and fetches weather for the new zip.

---

## API contract

Base URL is taken from env (no trailing slash). All request bodies are JSON.

| Endpoint           | Method | Body                         | Success response (relevant fields) |
|--------------------|--------|------------------------------|------------------------------------|
| `/user`            | POST   | `{ username, password }`     | `{ id: string }`                   |
| `/login`           | POST   | `{ username, password }`     | `{ id: string, zip?: string }`     |
| `/zip`             | POST   | `{ zip: string, userId }`    | (success = 2xx)                    |
| `/zip`             | PUT    | `{ zip: string, userId }`    | (success = 2xx)                    |
| `/weatherforecast` | POST   | `{ zip: string }`            | `{ location, high, low, summary }` |

All API responses use lowercase field names (`id`, `zip`, etc.).

---

## Environment variables

Create a `.env` in the project root. **Do not commit tokens or secrets.**

| Variable                   | When used | Purpose |
|---------------------------|-----------|---------|
| `VITE_API_BASE_URL_LOCAL` | Development (`npm run dev`) | API base URL. Default: `http://localhost:7071/api`. |
| `VITE_API_BASE_URL`       | Production build             | API base URL for the deployed app. Required at build time if you deploy. |

- In **dev**, `getBaseUrl()` uses `VITE_API_BASE_URL_LOCAL` or falls back to `http://localhost:7071/api`.
- In **production**, it uses `VITE_API_BASE_URL` and throws if it’s missing.

Vite only exposes variables that start with `VITE_`.

---

## Development

```bash
npm install
npm run dev
```

Runs the Vite dev server. Ensure your backend is reachable at the URL defined by `VITE_API_BASE_URL_LOCAL` (or the default). The app will call it for auth, zip, and weather.

---

## Build for production

```bash
npm run build
```

Output is in `dist/`. Set `VITE_API_BASE_URL` in `.env` (or in the build environment) to the API URL the deployed app should use.

---

## Deploy to Azure Static Web Apps

The app deploys to the Static Web App **ReactASPTestStatic** (Production). You can deploy via **GitHub Actions** (automatic on push to `main`) or **npm** (manual).

---

### GitHub Actions (automatic)

Pushing to the `main` branch of [react-weather-app](https://github.com/Cjay1019/react-weather-app) triggers a build and deploy to **ReactASPTestStatic** Production.

**Workflow:** [`.github/workflows/azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml)

**Required GitHub secrets** (repo **Settings → Secrets and variables → Actions**):

| Secret | Description |
|--------|-------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token. Azure Portal → **ReactASPTestStatic** → **Manage deployment token** → copy. |
| `VITE_API_BASE_URL` | Production API base URL (e.g. `https://your-api.azurewebsites.net/api`). Used at build time so the deployed app calls the right backend. |

- **Push to `main`** → build and deploy to Production.
- **Pull request to `main`** → build and deploy to a staging URL for that PR.
- **PR closed** → staging deployment is cleaned up.

Do not commit these values; keep them as repo secrets.

---

### npm (manual)

1. **Deployment token**  
   Azure Portal → **Static Web Apps** → **ReactASPTestStatic** → **Manage deployment token** → copy.

2. **Deploy**  
   Set the token, then run:

   **PowerShell:**
   ```powershell
   $env:SWA_CLI_DEPLOYMENT_TOKEN = "<paste-token>"
   npm run deploy
   ```

   **Bash:**
   ```bash
   export SWA_CLI_DEPLOYMENT_TOKEN="<paste-token>"
   npm run deploy
   ```

   `npm run deploy` runs `npm run build` and then deploys `./dist` with:

   ```text
   npx -y @azure/static-web-apps-cli deploy ./dist --env production --app-name ReactASPTestStatic
   ```

   Ensure `VITE_API_BASE_URL` is set (e.g. in `.env`) before building for production.
