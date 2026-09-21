-- =============================================================================
-- 002_storage_policies.sql
-- EcoSort AI — private Storage bucket + per-user access policies
-- Run once against your Supabase project after 001_initial_schema.sql.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Create the private scan-images bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-images', 'scan-images', false)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Storage RLS: users can only upload to their own folder
--   Path convention: {auth.uid()}/{scan_id}.jpg
--   (storage.foldername(name))[1] returns the first path segment.
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can upload own scan images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'scan-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Storage RLS: users can read their own objects
--   Required so FastAPI (service-role key) can call createSignedUrl on behalf
--   of the owner; also allows direct reads if the user were to call Storage API.
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own scan images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'scan-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Storage RLS: users can delete their own objects
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can delete own scan images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'scan-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
