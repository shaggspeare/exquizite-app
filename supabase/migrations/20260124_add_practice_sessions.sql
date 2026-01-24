-- Create practice_sessions table to track game mode completions
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    set_id UUID REFERENCES public.word_sets(id) ON DELETE CASCADE NOT NULL,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('flashcard', 'match', 'quiz', 'fill-blank')),
    score INTEGER, -- Optional: percentage score for quiz/fill-blank modes
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_set_id ON public.practice_sessions(set_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_set ON public.practice_sessions(user_id, set_id);

-- Enable RLS
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own practice sessions
CREATE POLICY "Users can view own practice sessions"
    ON public.practice_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice sessions"
    ON public.practice_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own practice sessions"
    ON public.practice_sessions FOR DELETE
    USING (auth.uid() = user_id);
