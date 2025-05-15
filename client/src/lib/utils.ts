import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for messages, events, etc.
export function formatMessageTime(date: Date | string): string {
  const messageDate = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(messageDate)) {
    return format(messageDate, "HH:mm");
  } else if (isYesterday(messageDate)) {
    return "Вчера";
  } else {
    return format(messageDate, "dd.MM.yyyy");
  }
}

// Format date for events
export function formatEventDate(date: Date | string): string {
  const eventDate = typeof date === "string" ? new Date(date) : date;
  return format(eventDate, "d MMMM, HH:mm", { locale: ru });
}

// Format time since for blogs
export function formatTimeSince(date: Date | string): string {
  const blogDate = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(blogDate, { addSuffix: true, locale: ru });
}

// Format number to display with K/M suffix for large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  } else {
    return num.toString();
  }
}

// Format price with spaces and currency symbol
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
}

// Get user online status text
export function getUserStatusText(isOnline: boolean, lastSeen?: Date | string): string {
  if (isOnline) {
    return "Онлайн";
  } else if (lastSeen) {
    const lastSeenDate = typeof lastSeen === "string" ? new Date(lastSeen) : lastSeen;
    return `Был(а) ${formatDistanceToNow(lastSeenDate, { addSuffix: true, locale: ru })}`;
  }
  return "Оффлайн";
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Get random banner gradient
export const gradients = [
  "from-purple-500 to-blue-500",
  "from-pink-500 to-red-500",
  "from-yellow-500 to-orange-500",
  "from-green-500 to-teal-500",
  "from-blue-500 to-indigo-500",
];

export function getRandomGradient(): string {
  return gradients[Math.floor(Math.random() * gradients.length)];
}
