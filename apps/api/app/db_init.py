from app.db import conn_cursor

DDL = """
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  owner_id TEXT,
  title TEXT,
  url TEXT,
  chunk TEXT,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memory_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE,
  display_name TEXT,
  prefs JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memory_episodic (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  event_type TEXT,
  summary TEXT,
  data JSONB,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_episodic_user_time
  ON memory_episodic(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS memory_semantic (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  source TEXT,
  title TEXT,
  chunk TEXT,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_semantic_user ON memory_semantic(user_id);

-- Memory stack (short/medium/long) — simple note tables for now
CREATE TABLE IF NOT EXISTS memory_short (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  note TEXT,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memory_medium (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  note TEXT,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memory_long (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  note TEXT,
  created_at timestamptz DEFAULT now()
);

"""

def ensure_schema():
    with conn_cursor() as (conn, cur):
        cur.execute(DDL)
