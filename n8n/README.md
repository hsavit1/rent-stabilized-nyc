# n8n Scraper Setup

Automated scraping + affordability curation for Craigslist and LeaseBreak listings.

## 1) Deploy n8n to Fly.io

```bash
cd n8n

# Create the app
fly apps create rent-stabilized-n8n

# Create persistent volume for n8n data
fly volumes create n8n_data --size 1 --region ewr -a rent-stabilized-n8n

# Set n8n basic auth (change these)
fly secrets set N8N_BASIC_AUTH_ACTIVE=true -a rent-stabilized-n8n
fly secrets set N8N_BASIC_AUTH_USER=admin -a rent-stabilized-n8n
fly secrets set N8N_BASIC_AUTH_PASSWORD=your-secure-password -a rent-stabilized-n8n

# Deploy
fly deploy -a rent-stabilized-n8n
```

## 2) Apply database migration

Run `scripts/migrate-scraped.sql` against your app database before importing workflows.

This migration adds affordability + curation fields:
- `last_seen_at`
- `affordability_score`
- `affordable_flag`
- `affordable_reason`
- `monthly_income_required`
- `curation_status`
- `curated_at`

## 3) Configure n8n credentials

1. Open n8n at `https://rent-stabilized-n8n.fly.dev`
2. Go to **Settings -> Credentials** and add PostgreSQL credential:
   - Host: Neon host (e.g. `ep-xxx.us-east-2.aws.neon.tech`)
   - Database: `neondb`
   - User: Neon user
   - Password: Neon password
   - SSL: Require

## 4) Import workflows

Import these workflow JSON files:
- `workflow-craigslist.json` - Craigslist RSS scrape every 30 minutes
- `workflow-leasebreak.json` - LeaseBreak browser scrape every 6 hours
- `workflow-affordability-curation.json` - affordability scoring every 2 hours
- `workflow-deactivate-stale.json` - stale deactivation daily

In each Postgres node, select your PostgreSQL credential.

Activate all four workflows.

## Workflow behavior

### Craigslist scrape
- Uses Craigslist RSS search with affordability-related keywords
- Parses listing metadata and geodata
- Upserts by URL
- Refreshes `last_seen_at`, `is_active`, and `raw_data`

### LeaseBreak scrape
- Uses Puppeteer + Chromium to render listing pages
- Extracts title, rent, bedrooms, neighborhood, lease end
- Upserts by URL
- Refreshes `last_seen_at`, `is_active`, and `raw_data`

### Affordability curation
- Scores active listings from `0-100`
- Writes:
  - `affordability_score`
  - `affordable_flag`
  - `monthly_income_required` (`price * 40`)
  - `affordable_reason`
  - `curation_status`

`curation_status` meanings:
- `auto_approved`: strong affordable candidate (high score)
- `pending_review`: likely affordable, but should be manually reviewed
- `rejected`: not affordable by current thresholds

### Stale deactivation
- Uses `last_seen_at` (not `created_at`)
- Marks old unseen rows as inactive:
  - Craigslist: 5+ days unseen
  - LeaseBreak: 14+ days unseen

## Operational notes

- This stack installs Chromium and Puppeteer inside n8n Docker image.
- Fly VM memory is set to `1024mb` for browser scraping stability.
- Keep scrape intervals conservative and comply with source terms/robots requirements.
- Add alerting later (Slack/email) for failed workflow executions.
