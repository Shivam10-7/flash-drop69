CREATE TABLE public.drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin text NOT NULL UNIQUE,
  type text NOT NULL,
  content text,
  file_path text,
  file_name text,
  file_size bigint,
  language text NOT NULL DEFAULT 'plaintext',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);
GRANT ALL ON public.drops TO service_role;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
CREATE INDEX drops_expires_idx ON public.drops (expires_at);