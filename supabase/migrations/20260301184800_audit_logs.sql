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
