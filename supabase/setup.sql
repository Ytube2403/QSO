-- Initial DB Schema for ASO Keyword Optimization

-- 1. Create custom types
CREATE TYPE workspace_role AS ENUM ('owner', 'editor', 'viewer');

-- 2. Create tables

-- workspaces
CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- workspace_members
CREATE TABLE workspace_members (
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- datasets
CREATE TABLE datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  source_filename text,
  competitor_count int DEFAULT 0,
  my_rank_column_name text,
  competitor_column_names jsonb DEFAULT '[]'::jsonb,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- keywords
CREATE TABLE keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  volume numeric,
  difficulty numeric,
  kei numeric,
  my_rank int,
  competitor_ranks jsonb DEFAULT '{}'::jsonb,
  competitor_ranked_count int DEFAULT 0,
  competitor_topN_count int DEFAULT 0,
  competitor_best_rank int,
  relevancy_score numeric DEFAULT 0,
  total_score numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- presets
CREATE TABLE presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- selections
CREATE TABLE selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  selected_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tags jsonb DEFAULT '[]'::jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dataset_id, keyword_id) -- Mode A (team-shared selection), as per spec comment
);

-- 3. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Apply triggers to tables
CREATE TRIGGER set_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_workspace_members_updated_at BEFORE UPDATE ON workspace_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_datasets_updated_at BEFORE UPDATE ON datasets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_keywords_updated_at BEFORE UPDATE ON keywords FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_presets_updated_at BEFORE UPDATE ON presets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_selections_updated_at BEFORE UPDATE ON selections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
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
-- Create audit_logs table
create table if not exists public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users on delete cascade,
    workspace_id uuid references public.workspaces on delete set null,
    action text not null,               -- e.g., 'IMPORT_DATASET', 'EXPORT_DATASET', 'CREATE_PRESET'
    target_type text not null,          -- e.g., 'dataset', 'preset', 'workspace'
    target_id uuid,                     -- ID of the affected resource if any
    details jsonb default '{}'::jsonb,  -- Metadata about the action
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table public.audit_logs enable row level security;

-- Workspace admins/members can view logs of their workspaces (read-only for security)
create policy "Workspace members can view audit logs"
    on public.audit_logs for select
    using (
        exists (
            select 1 from public.workspace_members
            where workspace_members.workspace_id = audit_logs.workspace_id
            and workspace_members.user_id = auth.uid()
        )
        or
        exists (
            select 1 from public.workspaces
            where workspaces.id = audit_logs.workspace_id
            and workspaces.owner_id = auth.uid()
        )
    );

-- Only service role (server-side operations) can insert/update logs directly.
-- Wait, we can allow users to insert logs if they are making an action, or enforce it solely on the server edge.
-- For safety, we will let authenticated users insert logs related to themselves.
create policy "Users can insert their own logs"
    on public.audit_logs for insert
    with check (auth.uid() = user_id);
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
