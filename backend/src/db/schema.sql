CREATE TABLE IF NOT EXISTS lead_requests (
  id SERIAL PRIMARY KEY,
  transcript TEXT NOT NULL,
  force_error BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES lead_requests(id) ON DELETE CASCADE,
  lead_name TEXT NOT NULL,
  lead_email TEXT NOT NULL,
  representative TEXT NOT NULL,
  budget TEXT NOT NULL,
  destinations_json JSONB NOT NULL,
  guest_count_range TEXT NOT NULL,
  adults_only BOOLEAN NOT NULL,
  flights_needed BOOLEAN NOT NULL,
  raw_response_json JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_logs (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NULL REFERENCES lead_requests(id) ON DELETE SET NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata_json JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_budget ON leads (budget);
CREATE INDEX IF NOT EXISTS idx_leads_representative ON leads (representative);
CREATE INDEX IF NOT EXISTS idx_request_logs_request_id ON request_logs (request_id);
