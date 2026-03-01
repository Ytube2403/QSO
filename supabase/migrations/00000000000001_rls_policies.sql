-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections ENABLE ROW LEVEL SECURITY;

-- workspaces
CREATE POLICY "Workspaces are viewable by owner" ON workspaces
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Workspaces can be updated by owner" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Workspaces can be deleted by owner" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Workspaces can be created by authenticated users" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspaces are viewable by members" ON workspaces
  FOR SELECT USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- workspace_members
CREATE POLICY "Workspace members are viewable by members" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can manage members" ON workspace_members
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- datasets
CREATE POLICY "Datasets are viewable by workspace members" ON datasets
  FOR SELECT USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Datasets can be inserted by workspace owners or editors" ON datasets
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner'))
  );

-- keywords
CREATE POLICY "Keywords are viewable by workspace members" ON keywords
  FOR SELECT USING (
    dataset_id IN (
      SELECT id FROM datasets WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()) OR
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Keywords can be inserted by workspace owners or editors" ON keywords
  FOR INSERT WITH CHECK (
    dataset_id IN (
      SELECT id FROM datasets WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()) OR
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner'))
    )
  );

-- presets
CREATE POLICY "Presets are viewable by workspace members" ON presets
  FOR SELECT USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Presets can be managed by workspace members" ON presets
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner'))
  );

-- selections
CREATE POLICY "Selections are viewable by workspace members" ON selections
  FOR SELECT USING (
    dataset_id IN (
      SELECT id FROM datasets WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()) OR
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Selections can be managed by workspace members" ON selections
  FOR ALL USING (
    dataset_id IN (
      SELECT id FROM datasets WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()) OR
      workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner'))
    )
  );
