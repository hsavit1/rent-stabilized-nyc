# n8n Affordable Scraping Design

## Goal
Build a reliable n8n pipeline that scrapes Craigslist and LeaseBreak listings, stores them in Postgres, and curates affordable listings automatically.

## Workflows

1. `Scrape Craigslist NYC Apartments`
- Trigger: every 30 minutes
- Steps: fetch RSS -> parse listings -> filter empty -> upsert to `scraped_listing`
- Guarantees: URL dedupe, `last_seen_at` refresh, `is_active=true`

2. `Scrape LeaseBreak NYC Listings`
- Trigger: every 6 hours
- Steps: Puppeteer scrape -> normalize records -> filter empty -> upsert to `scraped_listing`
- Guarantees: URL dedupe, `last_seen_at` refresh, `is_active=true`

3. `Curate Affordable Listings`
- Trigger: every 2 hours
- Steps: fetch candidates -> score affordability -> persist score/status
- Outputs:
  - `affordability_score`
  - `affordable_flag`
  - `affordable_reason`
  - `monthly_income_required`
  - `curation_status`

4. `Deactivate Stale Listings`
- Trigger: daily
- Steps: deactivate rows unseen past source-specific windows
- Uses `last_seen_at` rather than `created_at`

## Data Model Changes

Added columns to `scraped_listing`:
- `last_seen_at TIMESTAMPTZ`
- `affordability_score INTEGER`
- `affordable_flag BOOLEAN`
- `affordable_reason TEXT`
- `monthly_income_required INTEGER`
- `curation_status TEXT`
- `curated_at TIMESTAMPTZ`

## Curation Policy

- `auto_approved`: high confidence affordability
- `pending_review`: borderline affordable candidates
- `rejected`: above affordability thresholds

## Runtime Requirements

- n8n image includes Chromium + Puppeteer
- `NODE_FUNCTION_ALLOW_EXTERNAL=puppeteer`
- Fly VM memory increased to `1024mb`

## Next Iteration

- Add manual curation endpoint/workflow for approve/reject overrides
- Add alerting workflow (Error Trigger -> Slack/email)
- Update app query layer to show only curated affordable records when desired
