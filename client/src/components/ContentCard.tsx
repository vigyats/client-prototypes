import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { CalendarDays, ArrowUpRight, Star } from "lucide-react";

export function ContentCard({
  title,
  subtitle,
  href,
  coverImagePath,
  meta,
  featured,
}: {
  title: string;
  subtitle?: string | null;
  href: string;
  coverImagePath?: string | null;
  meta?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card shadow-[var(--shadow-md)]",
        "hover:shadow-[var(--shadow-lg)] hover:-translate-y-[2px] transition-all duration-300",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))] opacity-80" />

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
        <div className="relative md:h-full h-48 bg-muted overflow-hidden">
          {coverImagePath ? (
            <img src={coverImagePath} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[hsl(var(--tri-saffron))]/20 via-background to-[hsl(var(--tri-green))]/18" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          {featured ? (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-2xl border border-white/20 bg-black/25 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              <Star className="h-3.5 w-3.5" />
              Featured
            </div>
          ) : null}
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg md:text-xl font-bold leading-snug">{title}</div>
              {subtitle ? (
                <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{subtitle}</div>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">
                  A curated update — open to read full details.
                </div>
              )}
            </div>
            <Link
              href={href}
              className={cn(
                "shrink-0 inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold",
                "bg-background hover:bg-muted/70 hover:shadow-[var(--shadow-sm)] transition-all duration-200",
              )}
            >
              <span className="hidden sm:inline">Open</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {meta ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border bg-background px-3 py-2 text-xs font-semibold text-foreground/80">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {meta}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
