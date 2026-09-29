// Классы перечислены целиком, иначе Tailwind не увидит их при сборке.
const AVATAR_BG_CLASSES = [
  "bg-avatar-violet",
  "bg-avatar-blue",
  "bg-avatar-teal",
  "bg-avatar-green",
  "bg-avatar-amber",
  "bg-avatar-pink",
  "bg-avatar-indigo",
] as const;

/**
 * Стабильный цвет аватара/иконки сервера по id: один и тот же пользователь
 * или сервер всегда получает один цвет, а разные — различимы в списке.
 */
export function getAvatarColorClass(id: string): string {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }

  return AVATAR_BG_CLASSES[Math.abs(hash) % AVATAR_BG_CLASSES.length];
}
