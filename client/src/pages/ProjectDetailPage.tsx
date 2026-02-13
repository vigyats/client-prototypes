import { Shell } from "@/components/Shell";
import { useI18n } from "@/hooks/use-i18n";
import { useProject } from "@/hooks/use-projects";
import { useParams } from "wouter";
import { ArrowLeft, ArrowUpRight, Globe2 } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function pickTranslation<T extends { language: string; title: string; summary?: string | null; contentHtml: string }>(
  translations: T[],
  lang: "en" | "hi" | "mr",
) {
  const exact = translations.find((t) => t.language === lang);
  const en = translations.find((t) => t.language === "en");
  return exact || en || translations[0] || null;
}

export default function ProjectDetailPage() {
  const params = useParams() as { id?: string };
  const id = Number(params.id);
  const { lang } = useI18n();
  const q = useProject(id, { lang });

  const data = q.data as any;
  const tr = data?.translations ? pickTranslation(data.translations, lang) : null;

  return (
    <Shell>
      <div className="animate-fadeUp">
        <div className="flex items-center justify-between gap-4">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
          <Link href={`/admin/projects/${id}`} className="text-sm font-semibold text-primary hover:underline">
            Edit in Admin <ArrowUpRight className="inline h-4 w-4" />
          </Link>
        </div>

        {q.isLoading ? (
          <div className="mt-6 rounded-3xl border bg-card/50 p-6 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
        ) : q.isError ? (
          <div className="mt-6 rounded-3xl border bg-card p-6 shadow-[var(--shadow-md)]">
            <div className="text-sm font-bold">Could not load project</div>
            <div className="mt-1 text-sm text-muted-foreground">{(q.error as Error)?.message}</div>
          </div>
        ) : !data?.project ? (
          <div className="mt-6 rounded-3xl border bg-card p-8 shadow-[var(--shadow-md)]">
            <div className="text-lg font-bold">Not found</div>
            <div className="mt-2 text-sm text-muted-foreground">This project does not exist (or was removed).</div>
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border bg-card shadow-[var(--shadow-lg)] overflow-hidden">
            <div className="relative h-56 md:h-72 bg-muted overflow-hidden">
              {data.project.coverImagePath ? (
                <img src={data.project.coverImagePath} alt={tr?.title || "Project"} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[hsl(var(--tri-saffron))]/22 via-background to-[hsl(var(--tri-green))]/18" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                  <Globe2 className="h-4 w-4" />
                  Language: {lang.toUpperCase()}
                </div>
                <h1 className="mt-3 text-2xl md:text-4xl font-bold text-white leading-tight max-w-4xl">
                  {tr?.title || "Untitled"}
                </h1>
                {tr?.summary ? (
                  <p className="mt-2 text-sm md:text-base text-white/85 max-w-3xl">
                    {tr.summary}
                  </p>
                ) : null}
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
