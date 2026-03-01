-- Fix RLS policies for keywords and selections tables
-- The original policies had incorrect boolean logic in subqueries
-- The OR was inside the datasets subquery instead of being a separate condition

-- DROP old policies
DROP POLICY IF EXISTS "Keywords are viewable by workspace members" ON keywords;
DROP POLICY IF EXISTS "Keywords can be inserted by workspace owners or editors" ON keywords;
DROP POLICY IF EXISTS "Selections are viewable by workspace members" ON selections;
DROP POLICY IF EXISTS "Selections can be managed by workspace members" ON selections;

-- Recreate keywords policies with correct logic
CREATE POLICY "Keywords are viewable by workspace members" ON keywords
  FOR SELECT USING (
    dataset_id IN (
      SELECT id FROM datasets WHERE
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
        OR
        workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Keywords can be inserted by workspace owners or editors" ON keywords
  FOR INSERT WITH CHECK (
    dataset_id IN (
      SELECT id FROM datasets WHERE
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
        OR
        workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner'))
    )
  );

-- Add UPDATE policy for keywords (needed by recompute)
CREATE POLICY "Keywords can be updated by workspace owners or editors" ON keywords
  FOR UPDATE USING (
    dataset_id IN (
      SELECT id FROM datasets WHERE
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
        OR
        workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner'))
    )
  );

-- Recreate selections policies with correct logic
CREATE POLICY "Selections are viewable by workspace members" ON selections
  FOR SELECT USING (
    dataset_id IN (
      SELECT id FROM datasets WHERE
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
        OR
        workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Selections can be managed by workspace members" ON selections
  FOR ALL USING (
    dataset_id IN (
      SELECT id FROM datasets WHERE
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
        OR
        workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner'))
    )
  );
