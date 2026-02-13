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
    <Link href={href}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-3xl border-2 border-primary/10 bg-card shadow-lg backdrop-blur-sm cursor-pointer",
          "hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 ease-out",
        )}
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))]" />

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
          <div className="relative md:h-full h-48 bg-muted overflow-hidden">
            {coverImagePath ? (
              <img src={coverImagePath} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[hsl(var(--tri-saffron))]/15 via-background to-[hsl(var(--tri-green))]/15" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {featured ? (
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-[hsl(var(--tri-saffron))]/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md shadow-lg">
                <Star className="h-3.5 w-3.5 fill-white" />
                Featured
              </div>
            ) : null}
          </div>

          <div className="p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-lg md:text-xl font-bold leading-snug group-hover:text-[hsl(var(--tri-navy))] transition-colors">{title}</div>
                {subtitle ? (
                  <div className="mt-2 text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed">{subtitle}</div>
                ) : (
                  <div className="mt-2 text-sm text-muted-foreground">
                    A curated update — open to read full details.
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 rounded-full border-2 border-primary/20 px-4 py-2 text-sm font-bold",
                  "bg-card group-hover:bg-[hsl(var(--tri-navy))] group-hover:text-white group-hover:border-[hsl(var(--tri-navy))] group-hover:shadow-md transition-all duration-300",
                )}
              >
                <span className="hidden sm:inline">Open</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>

            {meta ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-muted/50 px-3.5 py-2 text-xs font-semibold text-foreground/80">
                <CalendarDays className="h-4 w-4 text-[hsl(var(--tri-navy))]" />
                {meta}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
