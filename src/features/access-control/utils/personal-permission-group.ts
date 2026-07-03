// Personal permission groups are auto-managed, hidden permission groups that back
// the per-user authorization screen. Each user that gets direct (user-level)
// permissions is assigned a dedicated group named with this prefix so the
// existing group-based backend can store per-user permissions without changes.

export const PERSONAL_GROUP_PREFIX = '__user__:';

export function buildPersonalGroupName(userId: number): string {
  return `${PERSONAL_GROUP_PREFIX}${userId}`;
}

export function isPersonalGroupName(name: string | null | undefined): boolean {
  return typeof name === 'string' && name.startsWith(PERSONAL_GROUP_PREFIX);
}

export function parsePersonalGroupUserId(name: string | null | undefined): number | null {
  if (!isPersonalGroupName(name)) return null;
  const raw = (name as string).slice(PERSONAL_GROUP_PREFIX.length).trim();
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
