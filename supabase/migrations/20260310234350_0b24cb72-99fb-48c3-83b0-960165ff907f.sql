-- Create storage bucket for user-uploaded GLB models
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('models', 'models', true, 52428800, ARRAY['model/gltf-binary', 'application/octet-stream']);

-- Allow anyone to read models
CREATE POLICY "Public read models" ON storage.objects FOR SELECT USING (bucket_id = 'models');

-- Allow anyone to upload models (no auth required for simplicity)
CREATE POLICY "Public upload models" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'models');

-- Allow anyone to delete their uploaded models
CREATE POLICY "Public delete models" ON storage.objects FOR DELETE USING (bucket_id = 'models');