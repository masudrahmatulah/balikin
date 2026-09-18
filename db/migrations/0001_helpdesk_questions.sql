CREATE TABLE IF NOT EXISTS balikin_helpdesk_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL DEFAULT 'balikin_id',
  question text NOT NULL,
  conversation jsonb,
  answer text,
  status text NOT NULL DEFAULT 'unreviewed',
  reviewed_by text REFERENCES balikin_user(id) ON DELETE SET NULL,
  reviewed_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_helpdesk_questions_status
  ON balikin_helpdesk_questions (app_id, status, created_at DESC);
