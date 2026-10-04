/**
 * Стабильный цвет курсора участника: одинаковый у всех зрителей доски
 * и между сессиями, потому что считается только от userId.
 */
export const getCollaboratorColor = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }

  const hue = Math.abs(hash) % 360;

  return {
    background: `hsl(${hue}, 80%, 60%)`,
    stroke: `hsl(${hue}, 80%, 35%)`,
  };
};
