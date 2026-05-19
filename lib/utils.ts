import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { SPORT_COLOR, SPORT_HEX } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function sportToSlug(sport: string): string {
  return sport.toLowerCase().replace(/\s+/g, "-");
}

export function slugToSport(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getSportColorClass(sport: string): string {
  const slug = sportToSlug(sport);
  return SPORT_COLOR[slug] ?? "bg-gray-700 text-white";
}

export function getSportHex(sport: string): string {
  const slug = sportToSlug(sport);
  return SPORT_HEX[slug] ?? "#555555";
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n).trim() + "…" : str;
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
