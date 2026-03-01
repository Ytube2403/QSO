import { createClient } from '@/lib/supabase/server'

export async function logAuditAction(
    action: string,
    targetType: string,
    targetId?: string | null,
    workspaceId?: string | null,
    details: Record<string, any> = {}
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase.from('audit_logs').insert({
            user_id: user.id,
            workspace_id: workspaceId || null,
            action,
            target_type: targetType,
            target_id: targetId || null,
            details
        })
    } catch (error) {
        console.error("Failed to log audit action:", error)
    }
}
