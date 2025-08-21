-- Create storage bucket for meal thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-thumbnails', 'meal-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
UPDATE storage.buckets
SET public = false
WHERE id = 'meal-thumbnails';

-- Create policy to allow authenticated users to upload their own files
CREATE POLICY "Allow users to upload their own meal thumbnails"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'meal-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to read their own files
CREATE POLICY "Allow users to read their own meal thumbnails"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'meal-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to update their own files
CREATE POLICY "Allow users to update their own meal thumbnails"
ON storage.objects FOR UPDATE TO authenticated
WITH CHECK (
  bucket_id = 'meal-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own meal thumbnails"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'meal-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public to view meal thumbnails
CREATE POLICY "Allow public to view meal thumbnails"
ON storage.objects FOR SELECT TO anon
USING (
  bucket_id = 'meal-thumbnails'
);

-- Create meals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fats DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on meals table
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own meals
CREATE POLICY "Users can view their own meals"
ON public.meals FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create policy to allow users to insert their own meals
CREATE POLICY "Users can insert their own meals"
ON public.meals FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create policy to allow users to update their own meals
CREATE POLICY "Users can update their own meals"
ON public.meals FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Create policy to allow users to delete their own meals
CREATE POLICY "Users can delete their own meals"
ON public.meals FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.meals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
