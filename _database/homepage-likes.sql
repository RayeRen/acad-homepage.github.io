-- Run once in the Supabase SQL Editor for the homepage project.
-- Production likes are kept separate from preview test records.
BEGIN;
CREATE TABLE public.homepage_likes (
  browser_id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.homepage_likes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.homepage_likes FROM anon, authenticated;

CREATE FUNCTION public.homepage_like_state(p_browser_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT jsonb_build_object(
   'count', (SELECT count(*) FROM public.homepage_likes),
   'liked', EXISTS (SELECT 1 FROM public.homepage_likes WHERE browser_id = p_browser_id)
 );
$$;

CREATE FUNCTION public.homepage_add_like(p_browser_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
 IF p_browser_id IS NULL THEN
   RAISE EXCEPTION 'Browser identity is required';
 END IF;
 INSERT INTO public.homepage_likes(browser_id) VALUES (p_browser_id)
 ON CONFLICT (browser_id) DO NOTHING;
 RETURN public.homepage_like_state(p_browser_id);
END;
$$;

REVOKE ALL ON FUNCTION public.homepage_like_state(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.homepage_add_like(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.homepage_like_state(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.homepage_add_like(uuid) TO anon;

CREATE VIEW public.homepage_daily_likes AS
 SELECT (created_at AT TIME ZONE 'Asia/Hong_Kong')::date AS day,
        count(*) AS likes
 FROM public.homepage_likes
 GROUP BY day ORDER BY day DESC;
REVOKE ALL ON public.homepage_daily_likes FROM anon, authenticated;
COMMIT;
