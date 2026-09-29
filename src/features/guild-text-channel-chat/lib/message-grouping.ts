// Сообщения одного автора подряд склеиваются в группу, если между ними
// прошло не больше этого интервала и они в один день.
const GROUP_WINDOW_MS = 5 * 60 * 1000;

type GroupableMessage = { senderId: string; createdAt: string };

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Нужен ли разделитель дня перед `current`. */
export const isNewDay = (
  previous: GroupableMessage | undefined,
  current: GroupableMessage,
) =>
  !previous ||
  !isSameDay(new Date(previous.createdAt), new Date(current.createdAt));

/** Начинает ли `current` новую группу (аватар + имя), или это продолжение. */
export const isGroupStart = (
  previous: GroupableMessage | undefined,
  current: GroupableMessage,
) => {
  if (!previous || previous.senderId !== current.senderId) return true;
  if (isNewDay(previous, current)) return true;

  return (
    new Date(current.createdAt).getTime() -
      new Date(previous.createdAt).getTime() >
    GROUP_WINDOW_MS
  );
};

/** «Сегодня», «Вчера» или дата: «12 сентября 2026». */
export const formatDayLabel = (createdAt: string) => {
  const date = new Date(createdAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Сегодня";
  if (isSameDay(date, yesterday)) return "Вчера";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
