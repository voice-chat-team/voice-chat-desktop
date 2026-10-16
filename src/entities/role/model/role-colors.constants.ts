// Цвет роли красит имя участника на тёмном фоне, поэтому пресеты светлее
// фоновых avatar-* цветов — иначе ник плохо читается на surface-200.
export const ROLE_COLORS = [
  "#a78bfa",
  "#818cf8",
  "#60a5fa",
  "#2dd4bf",
  "#4ade80",
  "#facc15",
  "#fb923c",
  "#f87171",
  "#f472b6",
  "#a1a1aa",
] as const;

export const DEFAULT_ROLE_COLOR = "#a1a1aa";
