# Vulnerable Node App

Deliberately vulnerable Node/Express app for an SDLC security lab.
Used to demonstrate shift-left security gates in CI.

## What's planted in here

| # | Vuln | Where | Scanner that catches it |
|---|------|-------|------------------------|
| 1 | Command injection | `/ping` — `exec()` with `req.query.host` | **Semgrep (SAST)** |
| 2 | `eval()` on user input | `/calc` | **Semgrep (SAST)** |
| 3 | Hardcoded AWS keys + JWT secret | top of `server.js` | **Gitleaks (secrets)** |
| 4 | Prototype pollution via `_.merge` | `/merge` + old lodash | **Trivy (SCA)** + Semgrep |
| 5 | Outdated `lodash@4.17.4`, `axios@0.21.0`, `jsonwebtoken@8.5.0` | `package.json` | **Trivy (SCA)** |

## Run locally (optional)

```bash
npm install
npm start
# curl 'http://localhost:3000/ping?host=8.8.8.8'
```

## Do NOT deploy this. Ever.
