// GLOBAL CACHE (persists across components)
export const avatarCache: Record<string, string> = {};

export function setAvatarCache(userId: string, url: string) {
  avatarCache[userId] = url;
}

export function getAvatarFromCache(userId: string) {
  return avatarCache[userId] || null;
}
