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
