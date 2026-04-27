import { base44 } from '@/api/base44Client';

export async function logAdminAction({ action_type, object_id, object_name = '', details = '' }) {
  let admin_name = 'Администратор';
  try {
    const user = await base44.auth.me();
    if (user?.full_name) admin_name = user.full_name;
    else if (user?.email) admin_name = user.email;
  } catch {
    // not logged in — use default
  }

  await base44.entities.AdminLog.create({
    action_type,
    object_id: String(object_id),
    object_name,
    admin_name,
    details,
  });
}