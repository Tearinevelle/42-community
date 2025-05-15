import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  active?: boolean;
}

export interface FeatureCard {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  iconBgColor: string;
}
