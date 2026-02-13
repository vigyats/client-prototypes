import { Shell } from "@/components/Shell";
import { useI18n } from "@/hooks/use-i18n";
import { useEvents } from "@/hooks/use-events";
import { ContentCard } from "@/components/ContentCard";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";

function pickTranslation<T extends { language: string; title: string; location?: string | null }>(
  translations: T[],
  lang: "en" | "hi" | "mr",
) {
  const exact = translations.find((t) => t.language === lang);
  const en = translations.find((t) => t.language === "en");
  return exact || en || translations[0] || null;
}

function dateRange(start?: string | null, end?: string | null) {
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  if (s && e) return `${fmt(s)} — ${fmt(e)}`;
  if (s) return fmt(s);
  return "Date TBD";
}

export default function EventsPage() {
  const { lang, t } = useI18n();
  const q = useEvents({ lang });

  const { upcoming, previous } = useMemo(() => {
    const now = Date.now();
    const list = (q.data || []).slice();
    const parts = list.reduce(
      (acc, it) => {
        const start = it.event.startDate ? new Date(it.event.startDate as any).getTime() : 0;
        const end = it.event.endDate ? new Date(it.event.endDate as any).getTime() : start;
        const isUpcoming = (end || start || 0) >= now;
        if (isUpcoming) acc.upcoming.push(it);
        else acc.previous.push(it);
        return acc;
      },
      { upcoming: [] as any[], previous: [] as any[] },
    );

    parts.upcoming.sort((a, b) => (new Date(a.event.startDate as any).getTime() || 0) - (new Date(b.event.startDate as any).getTime() || 0));
    parts.previous.sort((a, b) => (new Date(b.event.startDate as any).getTime() || 0) - (new Date(a.event.startDate as any).getTime() || 0));
    return parts;
  }, [q.data]);

  return (
    <Shell>
      <div className="animate-fadeUp">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Timeline</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold">{t.labels.events}</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
              Upcoming gatherings and documented past events — rendered in your selected language where available.
            </p>
          </div>
          <Link href="/admin/events" className="text-sm font-semibold text-primary hover:underline">
            Manage in Admin <ArrowUpRight className="inline h-4 w-4" />
          </Link>
        </div>

        {q.isLoading ? (
          <div className="mt-6 rounded-3xl border bg-card/50 p-6 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
        ) : q.isError ? (
          <div className="mt-6 rounded-3xl border bg-card p-6 shadow-[var(--shadow-md)]">
            <div className="text-sm font-bold">Could not load events</div>
            <div className="mt-1 text-sm text-muted-foreground">{(q.error as Error)?.message}</div>
          </div>
        ) : (q.data || []).length === 0 ? (
          <div className="mt-6 rounded-3xl border bg-card p-8 shadow-[var(--shadow-md)]">
            <div className="text-lg font-bold">{t.empty.events}</div>
            <div className="mt-2 text-sm text-muted-foreground">Create events in the admin panel to populate this page.</div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur p-5 md:p-6">
              <div className="text-xs font-semibold text-muted-foreground">{t.labels.upcoming}</div>
              <div className="mt-1 text-2xl font-bold">On the calendar</div>
              <div className="mt-4 space-y-4">
                {upcoming.length === 0 ? (
                  <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">No upcoming events.</div>
                ) : (
                  upcoming.map((it) => {
                    const tr = pickTranslation(it.translations as any[], lang);
                    const meta = `${dateRange(it.event.startDate, it.event.endDate)}${(tr as any)?.location ? ` • ${(tr as any).location}` : ""}`;
                    return (
                      <ContentCard
                        key={it.event.id}
                        title={tr?.title || "Untitled"}
                        subtitle={(tr as any)?.location || null}
                        href={`/events/${it.event.id}`}
                        coverImagePath={it.event.coverImagePath}
                        meta={meta}
                      />
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-3xl border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur p-5 md:p-6">
              <div className="text-xs font-semibold text-muted-foreground">{t.labels.previous}</div>
              <div className="mt-1 text-2xl font-bold">Archive</div>
              <div className="mt-4 space-y-4">
                {previous.length === 0 ? (
                  <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">No past events.</div>
                ) : (
                  previous.map((it) => {
                    const tr = pickTranslation(it.translations as any[], lang);
                    const meta = `${dateRange(it.event.startDate, it.event.endDate)}${(tr as any)?.location ? ` • ${(tr as any).location}` : ""}`;
                    return (
                      <ContentCard
                        key={it.event.id}
                        title={tr?.title || "Untitled"}
                        subtitle={(tr as any)?.location || null}
                        href={`/events/${it.event.id}`}
                        coverImagePath={it.event.coverImagePath}
                        meta={meta}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
