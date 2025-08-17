-- Create meals table
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can only access their own meals"
ON public.meals
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for meal thumbnails
INSERT INTO storage.buckets (id, name)
VALUES ('meal-thumbnails', 'meal-thumbnails');

-- Create policy for storage access
CREATE POLICY "Users can view all meal thumbnails"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'meal-thumbnails');

CREATE POLICY "Users can upload their own meal thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meal-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own meal thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meal-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own meal thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'meal-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
