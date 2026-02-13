import { Shell } from "@/components/Shell";
import { useI18n } from "@/hooks/use-i18n";
import { useProjects } from "@/hooks/use-projects";
import { ContentCard } from "@/components/ContentCard";
import { Link } from "wouter";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function pickTranslation<T extends { language: string; title: string; summary?: string | null }>(
  translations: T[],
  lang: "en" | "hi" | "mr",
) {
  const exact = translations.find((t) => t.language === lang);
  const en = translations.find((t) => t.language === "en");
  return exact || en || translations[0] || null;
}

export default function ProjectsPage() {
  const { lang, t } = useI18n();
  const q = useProjects({ lang });
  const [search, setSearch] = useState("");
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const items = useMemo(() => {
    const list = q.data || [];
    const filtered = list.filter((it) => {
      if (onlyFeatured && !it.project.isFeatured) return false;
      if (!search.trim()) return true;
      const tr = pickTranslation(it.translations as any[], lang);
      const hay = `${tr?.title || ""} ${(tr as any)?.summary || ""}`.toLowerCase();
      return hay.includes(search.trim().toLowerCase());
    });
    // Sort featured first, then newest
    return filtered.sort((a, b) => {
      const fa = a.project.isFeatured ? 1 : 0;
      const fb = b.project.isFeatured ? 1 : 0;
      if (fa !== fb) return fb - fa;
      return new Date(b.project.createdAt as any).getTime() - new Date(a.project.createdAt as any).getTime();
    });
  }, [q.data, search, onlyFeatured, lang]);

  return (
    <Shell>
      <div className="animate-fadeUp">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Directory</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold">{t.labels.allProjects}</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
              Browse all initiatives. Switch language any time — the page will re-fetch translated content.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/projects" className="text-sm font-semibold text-primary hover:underline">
              Manage in Admin <ArrowUpRight className="inline h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur p-4 md:p-5">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="pl-11 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setOnlyFeatured((v) => !v)}
              className={cn(
                "h-12 rounded-2xl border-border/70 bg-background/70 hover:bg-muted/70 hover:shadow-[var(--shadow-sm)] transition-all",
                onlyFeatured ? "border-primary/35 bg-primary/5" : "",
              )}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {onlyFeatured ? "Featured only" : "All projects"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          {q.isLoading ? (
            <>
              <div className="rounded-3xl border bg-card/50 p-6 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
              <div className="rounded-3xl border bg-card/50 p-6 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
            </>
          ) : q.isError ? (
            <div className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-md)]">
              <div className="text-sm font-bold">Could not load projects</div>
              <div className="mt-1 text-sm text-muted-foreground">{(q.error as Error)?.message}</div>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border bg-card p-8 shadow-[var(--shadow-md)]">
              <div className="text-lg font-bold">{t.empty.projects}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Create the first project from the admin panel.
              </div>
              <Link href="/admin/projects" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Go to Admin <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            items.map((it) => {
              const tr = pickTranslation(it.translations as any[], lang);
              return (
                <ContentCard
                  key={it.project.id}
                  title={tr?.title || "Untitled"}
                  subtitle={(tr as any)?.summary || null}
                  href={`/projects/${it.project.id}`}
                  coverImagePath={it.project.coverImagePath}
                  featured={it.project.isFeatured}
                />
              );
            })
          )}
        </div>
      </div>
    </Shell>
  );
}
