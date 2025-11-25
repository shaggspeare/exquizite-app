-- Enable RLS on both tables
ALTER TABLE word_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_pairs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own sets
CREATE POLICY "Users can insert their own sets"
  ON word_sets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

  -- Allow authenticated users to view their own sets
  CREATE POLICY "Users can view their own sets"
  ON word_sets FOR SELECT
                                       TO authenticated
                                       USING (auth.uid() = user_id);

-- Allow authenticated users to update their own sets
CREATE POLICY "Users can update their own sets"
  ON word_sets FOR UPDATE
                              TO authenticated
                              USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own sets
CREATE POLICY "Users can delete their own sets"
  ON word_sets FOR DELETE
TO authenticated
  USING (auth.uid() = user_id);

  -- Allow authenticated users to insert word pairs for their sets
  CREATE POLICY "Users can insert word pairs for their sets"
  ON word_pairs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM word_sets
      WHERE id = set_id AND user_id = auth.uid()
    )
  );

  -- Allow authenticated users to view word pairs for their sets
  CREATE POLICY "Users can view word pairs for their sets"
  ON word_pairs FOR SELECT
                                          TO authenticated
                                          USING (
                                          EXISTS (
                                          SELECT 1 FROM word_sets
                                          WHERE id = set_id AND user_id = auth.uid()
                                          )
                                          );

-- Allow authenticated users to update word pairs for their sets
CREATE POLICY "Users can update word pairs for their sets"
  ON word_pairs FOR UPDATE
                               TO authenticated
                               USING (
                               EXISTS (
                               SELECT 1 FROM word_sets
                               WHERE id = set_id AND user_id = auth.uid()
                               )
                               );

-- Allow authenticated users to delete word pairs for their sets
CREATE POLICY "Users can delete word pairs for their sets"
  ON word_pairs FOR DELETE
TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM word_sets
      WHERE id = set_id AND user_id = auth.uid()
    )
  );
