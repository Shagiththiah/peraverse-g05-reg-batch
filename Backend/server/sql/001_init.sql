CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='group_type') THEN
    CREATE TYPE group_type AS ENUM ('SCHOOL_STUDENT','TEACHER','UNIVERSITY_STUDENT','COMPANY_REPRESENTATIVE','GENERAL_PUBLIC');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='status_type') THEN
    CREATE TYPE status_type AS ENUM ('ACTIVE','EXITED','INACTIVE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='age_range_type') THEN
    CREATE TYPE age_range_type AS ENUM ('CHILD','TEENAGER','ADULT','SENIOR');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='ticket_type') THEN
    CREATE TYPE ticket_type AS ENUM ('GENERAL_ADMISSION','STUDENT','CHILD');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NULL,
  group_type group_type NOT NULL,
  organization VARCHAR(255) NULL,
  rfid_tag VARCHAR(64) NULL,
  status status_type NOT NULL DEFAULT 'ACTIVE',
  visited_locations JSONB NULL,
  entry_time TIMESTAMPTZ NULL DEFAULT NOW(),
  exit_time TIMESTAMPTZ NULL,
  contact_number VARCHAR(32) NULL,
  age_range age_range_type NULL,
  gender gender_type NULL,
  ticket_type ticket_type NULL
);

CREATE INDEX IF NOT EXISTS idx_visitors_group_type ON visitors(group_type);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
