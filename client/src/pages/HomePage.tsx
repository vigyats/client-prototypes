import { Shell } from "@/components/Shell";
import { useI18n } from "@/hooks/use-i18n";
import { useHomeFeatured } from "@/hooks/use-home";
import { useProjects } from "@/hooks/use-projects";
import { ContentCard } from "@/components/ContentCard";
import { Link } from "wouter";
import { ArrowUpRight, FolderKanban, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

function pickTranslation<T extends { language: string; title: string; summary?: string | null; contentHtml?: string }>(
  translations: T[],
  lang: "en" | "hi" | "mr",
) {
  const exact = translations.find((t) => t.language === lang);
  const en = translations.find((t) => t.language === "en");
  return exact || en || translations[0] || null;
}

export default function HomePage() {
  const { lang, t } = useI18n();
  const featured = useHomeFeatured({ lang });
  const allProjects = useProjects({ lang });

  const featuredItems = featured.data?.featuredProjects || [];
  const nonFeaturedCount = (allProjects.data || []).length - featuredItems.length;

  return (
    <Shell>
      <div className="animate-fadeUp">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-6 lg:gap-8 items-stretch">
          <div className="rounded-[28px] border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur overflow-hidden flex flex-col justify-center">
            <div className="p-6 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-2xl border bg-background px-3 py-2 text-xs font-semibold text-foreground/80">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--tri-saffron))]" />
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--tri-navy))]" />
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--tri-green))]" />
                Civic Stewardship
              </div>

              <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-[1.05]">
                Effort is a <span className="text-[hsl(var(--tri-saffron))]">thought.</span>
              </h1>

              <p className="mt-4 text-lg md:text-xl text-muted-foreground font-medium max-w-prose">
                To do something selflessly for society.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/projects"
                  className={cn(
                    "inline-flex items-center justify-center rounded-2xl h-14 px-8 text-base font-bold",
                    "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground",
                    "shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)]",
                    "hover:-translate-y-[1px] active:translate-y-0 transition-all",
                  )}
                >
                  <FolderKanban className="mr-2 h-5 w-5" />
                  {t.nav.projects}
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Link>

                <Link
                  href="/events"
                  className={cn(
                    "inline-flex items-center justify-center rounded-2xl h-14 px-8 text-base font-bold",
                    "border-2 bg-background hover:bg-muted/70 hover:shadow-[var(--shadow-md)] transition-all",
                  )}
                >
                  <CalendarDays className="mr-2 h-5 w-5 text-muted-foreground" />
                  {t.nav.events}
                </Link>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))]" />
          </div>

          <div className="relative rounded-[28px] border shadow-[var(--shadow-lg)] overflow-hidden min-h-[300px] lg:min-h-full">
            <img 
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560" 
              alt="Nature background"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 lg:bg-gradient-to-r lg:to-background/40" />
            <div className="relative h-full p-8 flex flex-col justify-end lg:justify-center">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 max-w-md">
                <div className="text-xs font-bold uppercase tracking-widest text-white/70">Our Vision</div>
                <div className="mt-2 text-xl font-bold text-white">Sustainable growth through selfless community action.</div>
                <div className="mt-4 flex gap-2">
                  <div className="h-1 w-8 rounded-full bg-[hsl(var(--tri-saffron))]" />
                  <div className="h-1 w-8 rounded-full bg-white" />
                  <div className="h-1 w-8 rounded-full bg-[hsl(var(--tri-green))]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 md:mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground">Highlights</div>
              <h2 className="mt-1 text-2xl md:text-3xl font-bold">{t.labels.featuredProjects}</h2>
            </div>
            <Link href="/projects" className="text-sm font-semibold text-primary hover:underline">
              {t.actions.viewAll} <ArrowUpRight className="inline h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4">
            {featured.isLoading ? (
              <div className="rounded-3xl border bg-card/50 p-6 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
            ) : featured.isError ? (
              <div className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-md)]">
                <div className="text-sm font-bold">Could not load featured projects</div>
                <div className="mt-1 text-sm text-muted-foreground">{(featured.error as Error)?.message}</div>
              </div>
            ) : featuredItems.length === 0 ? (
              <div className="rounded-3xl border bg-card p-8 shadow-[var(--shadow-md)]">
                <div className="text-lg font-bold">{t.empty.featured}</div>
                <div className="mt-2 text-sm text-muted-foreground">Admins can feature up to 4 projects for the home page.</div>
              </div>
            ) : (
              featuredItems.slice(0, 4).map((item) => {
                const tr = pickTranslation(item.translations as any[], lang);
                const title = tr?.title || "Untitled";
                const subtitle = (tr as any)?.summary || null;
                return (
                  <ContentCard
                    key={item.project.id}
                    title={title}
                    subtitle={subtitle}
                    href={`/projects/${item.project.id}`}
                    coverImagePath={item.project.coverImagePath}
                    featured
                  />
                );
              })
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}
