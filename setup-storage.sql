-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to images
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow service role to upload images (for API access)
CREATE POLICY "Service role can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'service_role');

-- Allow service role to update images
CREATE POLICY "Service role can update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'service_role');

-- Allow service role to delete images
CREATE POLICY "Service role can delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'service_role'); 