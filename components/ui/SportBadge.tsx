import { cn, getSportColorClass, sportToSlug } from "@/lib/utils";
import Link from "next/link";

interface SportBadgeProps {
  sport: string;
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md";
}

export function SportBadge({ sport, className, asLink = true, size = "sm" }: SportBadgeProps) {
  const colorClass = getSportColorClass(sport);
  const slug = sportToSlug(sport);
  const classes = cn(
    "inline-block font-bold uppercase tracking-widest rounded-sm",
    size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
    colorClass,
    className
  );

  if (asLink) {
    return <Link href={`/sports/${slug}`} className={classes}>{sport}</Link>;
  }
  return <span className={classes}>{sport}</span>;
}
