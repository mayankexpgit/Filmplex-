import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createSlug(title: string, year: number): string {
    const titleSlug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove non-word chars
      .replace(/[\s_-]+/g, '-') // collapse whitespace and replace _ with -
      .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
    return `${titleSlug}-${year}`;
}
