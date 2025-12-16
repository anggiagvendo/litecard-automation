 # Playwright test commands and GitHub Actions notes

## Quick commands

- Run all tests (default projects from playwright.config)
```
npm run test
```

- Run only UI tests
```
npm run test:ui
```

- Run only API tests (script uses `tests/API`)
```
npm run test:api
```

- Run API tests on Chromium only (direct npx command)
```
npx playwright test tests/API --project=chromium
```

- Open the HTML report locally after a run (Playwright generates `playwright-report/`)
```
npm run show-report
```

- Run UI tests with custom options (headed, trace enabled)
```
npx playwright test tests/UI --project=chromium --headed --trace=on
```

- Run a single test file (example)
```
npx playwright test tests/UI/public_test.spec.ts --headed --project=chromium --trace=on
```

---

## How to run tests with environment variables (local)
Set environment variables before running so tests use the correct base URLs and credentials.

PowerShell example (dev):
```powershell
$env:BASE_URL='https://bff-api.dev.litecard.io'
$env:API_USERNAME='qa-dev@litecard.com.au'
$env:API_PASSWORD='Litecard@123!'
$env:UI_BASE_URL='https://app.dev.litecard.io'
$env:UI_USERNAME='qa-dev@litecard.com.au'
$env:UI_PASSWORD='Litecard@123!'
npx playwright test tests/API --project=chromium
```

## GitHub Actions — how to run (env file mode)

- The repository includes two workflows: **UI Tests** and **API Tests**.
- These workflows load environment variables from `env/<environment>.env` files committed in the repository. This lets team members view and modify environment values directly in the repo.

Place the environment files in `env/` using the filenames `dev.env` and `demo.env` (already present). Each file must contain KEY=VALUE pairs, one per line, for these variables:

- `BASE_URL` — API base URL
- `UI_BASE_URL` — UI base URL
- `API_USERNAME` — API username
- `API_PASSWORD` — API password
- `UI_USERNAME` — UI username
- `UI_PASSWORD` — UI password
- `BUSINESS_ID` — Business ID used by API requests (API workflow only)

Example `env/dev.env` (already added):

```
BASE_URL="https://bff-api.dev.litecard.io"
UI_BASE_URL="https://app.dev.litecard.io"
API_USERNAME="qa-dev@litecard.com.au"
API_PASSWORD="Litecard@123!"
UI_USERNAME="qa-dev@litecard.com.au"
UI_PASSWORD="Litecard@123!"
BUSINESS_ID="EHbF6Y4rlB-dNPzmw8Ids#3Bh4sUCq_ZD93CfQPLajn"
```

### Manual run from GitHub
1. Go to the **Actions** tab in your repository.
2. Select **UI Tests** or **API Tests**.
3. Click **Run workflow**.
4. Choose branch and `environment` input (`dev` or `demo`) and click **Run workflow**.

The workflow will load `env/<environment>.env` from the repo and export the variables to the job environment.

## Notes and tips

- These env files are stored in the repository and therefore visible to the team.
- If you prefer to keep credentials secret, continue using GitHub repository secrets instead.
- If an env file is missing or malformed, the workflow will fail early with an error.
- If your JSON payload files live in a custom location, pass `CREATE_TEMPLATE_PATH` via the workflow (or set it as a repo variable).
