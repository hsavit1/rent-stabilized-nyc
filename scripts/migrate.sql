-- Better Auth tables (camelCase columns required by Better Auth's Kysely adapter)
CREATE TABLE IF NOT EXISTS "user" (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  image           TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  id            TEXT PRIMARY KEY,
  "userId"      TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  "expiresAt"   TIMESTAMPTZ NOT NULL,
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "account" (
  id                      TEXT PRIMARY KEY,
  "userId"                TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accountId"             TEXT NOT NULL,
  "providerId"            TEXT NOT NULL,
  "accessToken"           TEXT,
  "refreshToken"          TEXT,
  "accessTokenExpiresAt"  TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope                   TEXT,
  "idToken"               TEXT,
  password                TEXT,
  "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id            TEXT PRIMARY KEY,
  identifier    TEXT NOT NULL,
  value         TEXT NOT NULL,
  "expiresAt"   TIMESTAMPTZ NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Building tracking table
CREATE TABLE IF NOT EXISTS building_tracking (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  building_id   TEXT NOT NULL,  -- BBL
  status        TEXT NOT NULL DEFAULT 'interested',
  -- 'interested' | 'contacted' | 'visited' | 'applied' | 'dismissed'
  is_favorite   BOOLEAN NOT NULL DEFAULT false,
  visited_date  DATE,
  notes         TEXT DEFAULT '',
  rating        INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  priority      INTEGER CHECK (priority IS NULL OR (priority >= 1 AND priority <= 3)),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, building_id)
);

CREATE INDEX IF NOT EXISTS idx_bt_user ON building_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_bt_fav ON building_tracking(user_id, is_favorite) WHERE is_favorite = true;

-- User income profile for Housing Connect eligibility
CREATE TABLE IF NOT EXISTS user_income_profile (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id        TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  household_size INTEGER NOT NULL CHECK (household_size >= 1 AND household_size <= 10),
  annual_income  INTEGER NOT NULL CHECK (annual_income >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uip_user ON user_income_profile(user_id);

-- Saved listings for Craigslist/LeaseBreak/other links
CREATE TABLE IF NOT EXISTS saved_listing (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  title         TEXT NOT NULL,
  listing_type  TEXT NOT NULL DEFAULT 'other',
  -- 'craigslist' | 'leasebreak' | 'other'
  price         INTEGER,
  bedrooms      INTEGER,
  neighborhood  TEXT,
  borough       TEXT,
  notes         TEXT DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'interested',
  -- 'interested' | 'contacted' | 'visited' | 'applied' | 'dismissed'
  is_favorite   BOOLEAN NOT NULL DEFAULT false,
  priority      INTEGER CHECK (priority IS NULL OR (priority >= 1 AND priority <= 3)),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, url)
);

CREATE INDEX IF NOT EXISTS idx_sl_user ON saved_listing(user_id);
CREATE INDEX IF NOT EXISTS idx_sl_user_status ON saved_listing(user_id, status);

-- Migrate existing 'checked' status to 'contacted'
UPDATE building_tracking SET status = 'contacted' WHERE status = 'checked';
