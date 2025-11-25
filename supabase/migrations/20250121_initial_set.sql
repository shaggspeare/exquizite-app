-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT NOT NULL,
    is_guest BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    );

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
                                    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
                                    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Word sets table
CREATE TABLE IF NOT EXISTS public.word_sets (
                                                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_practiced TIMESTAMPTZ
    );

-- Enable Row Level Security
ALTER TABLE public.word_sets ENABLE ROW LEVEL SECURITY;

-- Word sets policies
CREATE POLICY "Users can view their own sets"
  ON public.word_sets FOR SELECT
                                     USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sets"
  ON public.word_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sets"
  ON public.word_sets FOR UPDATE
                                            USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sets"
  ON public.word_sets FOR DELETE
USING (auth.uid() = user_id);

-- Word pairs table
CREATE TABLE IF NOT EXISTS public.word_pairs (
                                                 id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    set_id UUID REFERENCES public.word_sets(id) ON DELETE CASCADE NOT NULL,
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
    );

-- Enable Row Level Security
ALTER TABLE public.word_pairs ENABLE ROW LEVEL SECURITY;

-- Word pairs policies (inherit from word_sets)
CREATE POLICY "Users can view word pairs from their sets"
  ON public.word_pairs FOR SELECT
                                      USING (
                                      EXISTS (
                                      SELECT 1 FROM public.word_sets
                                      WHERE word_sets.id = word_pairs.set_id
                                      AND word_sets.user_id = auth.uid()
                                      )
                                      );

CREATE POLICY "Users can create word pairs for their sets"
  ON public.word_pairs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.word_sets
      WHERE word_sets.id = word_pairs.set_id
      AND word_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update word pairs in their sets"
  ON public.word_pairs FOR UPDATE
                                             USING (
                                             EXISTS (
                                             SELECT 1 FROM public.word_sets
                                             WHERE word_sets.id = word_pairs.set_id
                                             AND word_sets.user_id = auth.uid()
                                             )
                                             );

CREATE POLICY "Users can delete word pairs from their sets"
  ON public.word_pairs FOR DELETE
USING (
    EXISTS (
      SELECT 1 FROM public.word_sets
      WHERE word_sets.id = word_pairs.set_id
      AND word_sets.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_word_sets_user_id ON public.word_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_word_pairs_set_id ON public.word_pairs(set_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for word_sets
CREATE TRIGGER update_word_sets_updated_at
    BEFORE UPDATE ON public.word_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO public.profiles (id, email, name, is_guest)
VALUES (
           NEW.id,
           NEW.email,
           COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'User'),
           COALESCE((NEW.raw_user_meta_data->>'is_guest')::boolean, false)
       );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
