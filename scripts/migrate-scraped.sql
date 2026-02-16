-- Scraped listings table (shared, not per-user)
-- Populated by n8n workflows scraping Craigslist + LeaseBreak
CREATE TABLE IF NOT EXISTS scraped_listing (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source          TEXT NOT NULL,  -- 'craigslist' | 'leasebreak'
  external_id     TEXT,           -- source-specific ID (CL post ID, LB listing slug)
  url             TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  price           INTEGER,
  bedrooms        INTEGER,
  bathrooms       NUMERIC(3,1),
  sqft            INTEGER,
  neighborhood    TEXT,
  borough         TEXT,
  address         TEXT,
  latitude        NUMERIC(10,7),
  longitude       NUMERIC(10,7),
  description     TEXT,
  image_urls      TEXT[],         -- array of image URLs
  lease_type      TEXT,           -- 'lease_break' | 'sublet' | 'new_lease' | null
  lease_end_date  DATE,           -- for lease breaks
  available_date  DATE,
  pet_friendly    BOOLEAN,
  posted_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  affordability_score INTEGER,    -- 0-100 score from curation workflow
  affordable_flag BOOLEAN,        -- true when listing meets affordability rules
  affordable_reason TEXT,         -- short explanation for scoring decisions
  monthly_income_required INTEGER,-- rough annual income estimate (rent * 40)
  curation_status TEXT,           -- null | pending_review | auto_approved | approved | rejected
  curated_at      TIMESTAMPTZ,    -- when manually or automatically curated
  raw_data        JSONB,          -- full scraped payload for debugging
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Backfill for existing environments where the table already exists
ALTER TABLE scraped_listing ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE scraped_listing ADD COLUMN IF NOT EXISTS affordability_score INTEGER;
ALTER TABLE scraped_listing ADD COLUMN IF NOT EXISTS affordable_flag BOOLEAN;
ALTER TABLE scraped_listing ADD COLUMN IF NOT EXISTS affordable_reason TEXT;
ALTER TABLE scraped_listing ADD COLUMN IF NOT EXISTS monthly_income_required INTEGER;
ALTER TABLE scraped_listing ADD COLUMN IF NOT EXISTS curation_status TEXT;
ALTER TABLE scraped_listing ADD COLUMN IF NOT EXISTS curated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_scr_source ON scraped_listing(source);
CREATE INDEX IF NOT EXISTS idx_scr_active ON scraped_listing(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scr_borough ON scraped_listing(borough);
CREATE INDEX IF NOT EXISTS idx_scr_price ON scraped_listing(price) WHERE price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scr_bedrooms ON scraped_listing(bedrooms) WHERE bedrooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scr_posted ON scraped_listing(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_scr_geo ON scraped_listing(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scr_seen ON scraped_listing(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_scr_affordable ON scraped_listing(affordable_flag) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scr_curation_status ON scraped_listing(curation_status);
