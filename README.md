# Midwest Institutions Directory

Next.js org directory backed by Airtable.

## Environment Variables

Set these on the server:

- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`

## Airtable Tables

The app expects these Airtable tables:

- `Groups`
- `People`
- `Display Sections`
- `Memberships`
- `Unit Placements`

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm run start
```

## GitHub Actions FTP Deploy

The repo includes `.github/workflows/ftp-deploy.yml` with two deploy targets:

- Push to `main` deploys to the FastComet Node app root `org-chart-prod`
- Push to `dev` deploys to the FastComet Node app root `org-chart-dev`

Required GitHub repository secrets:

- `FTP_DEV_SERVER`
- `FTP_DEV_USERNAME`
- `FTP_DEV_PASSWORD`
- `FTP_DEV_PORT` (optional, defaults to `21`)
- `FTP_PROD_SERVER`
- `FTP_PROD_USERNAME`
- `FTP_PROD_PASSWORD`
- `FTP_PROD_PORT` (optional, defaults to `21`)
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`

The workflow builds a standalone Next.js bundle and uploads it over FTP with branch-specific `basePath` values:

- `main` uses `/org-chart`
- `dev` uses `/org-chart/dev`

FastComet Node Application settings should be:

- Production application root: `org-chart-prod`
- Production application URL: `https://your-domain.tld/org-chart`
- Development application root: `org-chart-dev`
- Development application URL: `https://your-domain.tld/org-chart/dev`
- Application startup file: `server.js`

The FTP accounts should be rooted directly at those app directories. With that setup, the workflow uploads to `/` for each branch-specific FTP account rather than trying to navigate from a shared FTP home.

The deploy workflow also writes `tmp/restart.txt` on each upload so Passenger reloads the app after FTP deployment.

This setup requires Node-capable hosting. Plain static FTP hosting is not enough for this project because it uses Next.js server rendering, API routes, Airtable requests, and MySQL-backed auth routes.
