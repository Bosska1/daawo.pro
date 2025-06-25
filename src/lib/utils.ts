
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMMM dd, yyyy");
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), "HH:mm");
}

export function formatMatchTime(date: string | Date): string {
  const matchDate = new Date(date);
  const now = new Date();
  
  // If match is today
  if (format(matchDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
    return `Today, ${format(matchDate, 'HH:mm')}`;
  }
  
  // If match is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (format(matchDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
    return `Tomorrow, ${format(matchDate, 'HH:mm')}`;
  }
  
  return `${format(matchDate, 'MMM dd')}, ${format(matchDate, 'HH:mm')}`;
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}