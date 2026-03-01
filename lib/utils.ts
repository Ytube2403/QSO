import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeForExport(value: string | number | null | undefined): string | number {
  if (value === null || value === undefined) return ''
  const strValue = String(value)
  if (/^[-+@=]/.test(strValue)) {
    return "'" + strValue
  }
  return value
}
