import { isAxiosError } from "axios";

/** Текст ошибки от шлюза (message из тела ответа) или запасной вариант. */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message) && message.length) return message[0];
    if (typeof message === "string" && message) return message;
  }

  return fallback;
};
