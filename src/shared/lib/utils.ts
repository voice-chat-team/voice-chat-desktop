import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createAbbr(name: string, maxLen = 3): string {
  const words = name.split(/[\s._-]+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, maxLen).toUpperCase();
  }

  return words
    .map((w) => w[0])
    .join("")
    .slice(0, maxLen)
    .toUpperCase();
}
