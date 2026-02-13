import { Shell } from "@/components/Shell";
import { useI18n } from "@/hooks/use-i18n";
import { useEvent } from "@/hooks/use-events";
import { useParams, Link } from "wouter";
import { ArrowLeft, ArrowUpRight, MapPin, CalendarDays, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

function pickTranslation<T extends { language: string; title: string; location?: string | null; contentHtml: string }>(
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

export default function EventDetailPage() {
  const params = useParams() as { id?: string };
  const id = Number(params.id);
  const { lang } = useI18n();
  const q = useEvent(id, { lang });

  const data = q.data as any;
  const tr = data?.translations ? pickTranslation(data.translations, lang) : null;

  return (
    <Shell>
      <div className="animate-fadeUp">
        <div className="flex items-center justify-between gap-4">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
          <Link href={`/admin/events/${id}`} className="text-sm font-semibold text-primary hover:underline">
            Edit in Admin <ArrowUpRight className="inline h-4 w-4" />
          </Link>
        </div>

        {q.isLoading ? (
          <div className="mt-6 rounded-3xl border bg-card/50 p-6 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
        ) : q.isError ? (
          <div className="mt-6 rounded-3xl border bg-card p-6 shadow-[var(--shadow-md)]">
            <div className="text-sm font-bold">Could not load event</div>
            <div className="mt-1 text-sm text-muted-foreground">{(q.error as Error)?.message}</div>
          </div>
        ) : !data?.event ? (
          <div className="mt-6 rounded-3xl border bg-card p-8 shadow-[var(--shadow-md)]">
            <div className="text-lg font-bold">Not found</div>
            <div className="mt-2 text-sm text-muted-foreground">This event does not exist (or was removed).</div>
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border bg-card shadow-[var(--shadow-lg)] overflow-hidden">
            <div className="relative h-56 md:h-72 bg-muted overflow-hidden">
              {data.event.coverImagePath ? (
                <img src={data.event.coverImagePath} alt={tr?.title || "Event"} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[hsl(var(--tri-saffron))]/22 via-background to-[hsl(var(--tri-green))]/18" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                    <Globe2 className="h-4 w-4" />
                    {lang.toUpperCase()}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                    <CalendarDays className="h-4 w-4" />
                    {dateRange(data.event.startDate, data.event.endDate)}
                  </div>
                  {(tr as any)?.location ? (
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                      <MapPin className="h-4 w-4" />
                      {(tr as any).location}
                    </div>
                  ) : null}
                </div>

                <h1 className="mt-3 text-2xl md:text-4xl font-bold text-white leading-tight max-w-4xl">
                  {tr?.title || "Untitled"}
                </h1>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <article
                className={cn(
                  "prose prose-slate max-w-none",
                  "prose-headings:tracking-tight prose-headings:font-bold",
                  "prose-a:text-primary prose-a:underline-offset-4",
                )}
                dangerouslySetInnerHTML={{ __html: tr?.contentHtml || "" }}
              />
            </div>

            <div className="h-2 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))]" />
          </div>
        )}
      </div>
    </Shell>
  );
}
