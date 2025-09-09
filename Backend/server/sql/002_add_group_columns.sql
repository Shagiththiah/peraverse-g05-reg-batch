-- Adds group registration fields for batch registrations

ALTER TABLE visitors
  ADD COLUMN IF NOT EXISTS group_size INTEGER CHECK (group_size IS NULL OR group_size >= 1),
  ADD COLUMN IF NOT EXISTS group_meta JSONB;

-- Optional: index for faster queries on group sizes
CREATE INDEX IF NOT EXISTS visitors_group_size_idx ON visitors (group_size);
