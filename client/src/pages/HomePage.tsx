import { Shell } from "@/components/Shell";
import { useI18n } from "@/hooks/use-i18n";
import { useHomeFeatured } from "@/hooks/use-home";
import { useProjects } from "@/hooks/use-projects";
import { useEvents } from "@/hooks/use-events";
import { ContentCard } from "@/components/ContentCard";
import { Link } from "wouter";
import { ArrowUpRight, FolderKanban, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

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
  const allEvents = useEvents({ lang });
  const [currentImage, setCurrentImage] = useState(0);

  // Filter events with open registration
  const openEvents = useMemo(() => {
    if (!allEvents.data) return [];
    const now = new Date();
    return allEvents.data.filter((item) => {
      const regStart = item.event.registrationStartDate ? new Date(item.event.registrationStartDate) : null;
      const regEnd = item.event.registrationEndDate ? new Date(item.event.registrationEndDate) : null;
      
      // Registration is open if:
      // 1. Both dates exist
      // 2. Current time is between start and end
      if (regStart && regEnd) {
        return now >= regStart && now <= regEnd;
      }
      return false;
    });
  }, [allEvents.data]);

  const carouselImages = [
    "/home-c1.jpeg",
    "/home-c2.jpg",
    "/home-c3.jpeg",
    "/home-c4.jpeg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const featuredItems = featured.data?.featuredProjects || [];
  const nonFeaturedCount = (allProjects.data || []).length - featuredItems.length;

  return (
    <Shell>
      <div className="animate-fadeUp space-y-16">
        {/* HERO SECTION */}
        <div className="relative rounded-[32px] border-2 border-primary/15 shadow-2xl overflow-hidden">
          {/* Background Carousel */}
          <div className="absolute inset-0 z-0">
            {carouselImages.map((img, idx) => (
              <img
                key={img}
                src={img}
                alt={`Background ${idx + 1}`}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 grayscale",
                  currentImage === idx ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/80 to-background/85" />
          </div>

          <div className="relative z-10 flex flex-col px-6 pt-8 pb-10 md:px-10 md:pt-12 md:pb-14 lg:px-12 lg:pt-14 lg:pb-16 min-h-[420px] md:min-h-[480px] lg:min-h-[540px]">
            
            <div className="inline-flex items-center gap-1.5 mb-6 md:mb-8">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--tri-saffron))] animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--tri-navy))] animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--tri-green))] animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.3] tracking-tight bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-foreground to-[hsl(var(--tri-green))] bg-clip-text text-transparent mb-4 md:mb-6 pt-6 pb-3 will-change-transform">
              {t.home.heroTitle}
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-foreground font-semibold max-w-2xl mb-3 md:mb-4 leading-relaxed drop-shadow-sm">
              {t.home.heroSubtitle}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-foreground/90 max-w-xl mb-8 md:mb-10 leading-relaxed drop-shadow-sm">
              {t.home.heroTagline}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-auto">
              <Link href="/projects" className={cn(
                "inline-flex items-center justify-center rounded-full h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-bold",
                "bg-transparent text-foreground",
                "border-2 border-[hsl(var(--tri-navy))] hover:border-[hsl(var(--tri-saffron))]",
                "hover:shadow-[0_0_25px_hsl(var(--tri-navy)/0.7),0_0_40px_hsl(var(--tri-saffron)/0.5)]",
                "hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out"
              )}>
                <FolderKanban className="mr-2 h-5 w-5" />
                {t.nav.projects}
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/events" className={cn(
                "inline-flex items-center justify-center rounded-full h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-semibold",
                "bg-transparent text-foreground",
                "border-2 border-[hsl(var(--tri-green))] hover:border-[hsl(var(--tri-saffron))]",
                "hover:shadow-[0_0_25px_hsl(var(--tri-green)/0.7),0_0_40px_hsl(var(--tri-saffron)/0.5)]",
                "hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out"
              )}>
                <CalendarDays className="mr-2 h-5 w-5" />
                {t.nav.events}
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))] flag-flow" />
        </div>

        {/* Open Events Section */}
        {openEvents.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[hsl(var(--tri-saffron))] to-[hsl(var(--tri-green))]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registration Open</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">New Events</h2>
              </div>
              <Link href="/events" className="text-sm font-semibold text-[hsl(var(--tri-navy))] hover:text-[hsl(var(--tri-saffron))] transition-colors flex items-center gap-1">
                View All <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {openEvents.slice(0, 3).map((item) => {
                const tr = pickTranslation(item.translations as any[], lang);
                const title = tr?.title || "Untitled";
                return (
                  <Link key={item.event.id} href={`/events/${item.event.id}`}>
                    <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer h-full">
                      {item.event.flyerImagePath && (
                        <img
                          src={item.event.flyerImagePath}
                          alt={title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--tri-saffron))]/10 border border-[hsl(var(--tri-saffron))]/20 mb-3">
                        <span className="h-2 w-2 rounded-full bg-[hsl(var(--tri-saffron))] animate-pulse" />
                        <span className="text-xs font-semibold text-[hsl(var(--tri-saffron))]">Registration Open</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{title}</h3>
                      {(tr as any)?.location && (
                        <p className="text-sm text-muted-foreground mb-2">
                          📍 {(tr as any).location}
                        </p>
                      )}
                      {item.event.eventPrice && (
                        <p className="text-sm font-semibold text-primary">
                          {item.event.eventPrice === "Free" ? "Free" : `₹${item.event.eventPrice}`}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {openEvents.length === 0 && (
          <section>
            <div className="rounded-2xl border-2 border-dashed border-muted bg-card/50 p-8 text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-lg font-bold text-muted-foreground">No Upcoming Events</div>
              <div className="mt-2 text-sm text-muted-foreground">Check back soon for new events with open registration.</div>
            </div>
          </section>
        )}

        {/* Featured Projects Section */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[hsl(var(--tri-saffron))] to-[hsl(var(--tri-green))]" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.home.highlights}</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">{t.labels.featuredProjects}</h2>
            </div>
            <Link href="/projects" className="text-sm font-semibold text-[hsl(var(--tri-navy))] hover:text-[hsl(var(--tri-saffron))] transition-colors flex items-center gap-1">
              {t.actions.viewAll} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {featured.isLoading ? (
              <div className="rounded-3xl border bg-card/50 p-6 h-48 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
            ) : featured.isError ? (
              <div className="rounded-3xl border-2 border-destructive/20 bg-card p-6 shadow-lg">
                <div className="text-sm font-bold text-destructive">Could not load featured projects</div>
                <div className="mt-1 text-sm text-muted-foreground">{(featured.error as Error)?.message}</div>
              </div>
            ) : featuredItems.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-muted bg-card/50 p-8 text-center">
                <div className="text-lg font-bold text-muted-foreground">{t.empty.featured}</div>
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

        {/* Impact Section */}
        <section className="overflow-hidden rounded-[32px] border-2 border-primary/10 bg-gradient-to-br from-card/90 to-background shadow-2xl backdrop-blur-sm relative group">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-0">
            <div className="relative h-64 md:h-auto bg-gradient-to-br from-[hsl(var(--tri-saffron))]/10 via-background to-[hsl(var(--tri-green))]/10 overflow-hidden">
              <img src="/home.jpg" alt="Our Mission" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[hsl(var(--tri-saffron))] to-[hsl(var(--tri-green))]" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.home.missionLabel}</span>
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {t.home.missionTitle}
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                {t.home.missionDesc}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--tri-saffron))]/10 border border-[hsl(var(--tri-saffron))]/20">
                  <span className="text-sm font-semibold text-[hsl(var(--tri-saffron))]">{t.home.badgeCommunity}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--tri-navy))]/10 border border-[hsl(var(--tri-navy))]/20">
                  <span className="text-sm font-semibold text-[hsl(var(--tri-navy))]">{t.home.badgeCivic}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--tri-green))]/10 border border-[hsl(var(--tri-green))]/20">
                  <span className="text-sm font-semibold text-[hsl(var(--tri-green))]">{t.home.badgeImpact}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))] flag-flow" />
        </section>

        {/* Values Section */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="rounded-3xl border-2 border-[hsl(var(--tri-saffron))]/20 bg-gradient-to-br from-[hsl(var(--tri-saffron))]/5 to-card p-6 md:p-8 hover:shadow-lg transition-all duration-300">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--tri-saffron))]/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h4 className="text-xl font-bold mb-3">{t.home.valueUnity}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.home.valueUnityDesc}
            </p>
          </div>
          <div className="rounded-3xl border-2 border-[hsl(var(--tri-navy))]/20 bg-gradient-to-br from-[hsl(var(--tri-navy))]/5 to-card p-6 md:p-8 hover:shadow-lg transition-all duration-300">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--tri-navy))]/20 flex items-center justify-center mb-4">
              <span className="text-2xl">💡</span>
            </div>
            <h4 className="text-xl font-bold mb-3">{t.home.valueInnovation}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.home.valueInnovationDesc}
            </p>
          </div>
          <div className="rounded-3xl border-2 border-[hsl(var(--tri-green))]/20 bg-gradient-to-br from-[hsl(var(--tri-green))]/5 to-card p-6 md:p-8 hover:shadow-lg transition-all duration-300">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--tri-green))]/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h4 className="text-xl font-bold mb-3">{t.home.valueSustainable}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.home.valueSustainableDesc}
            </p>
          </div>
        </section>
      </div>
    </Shell>
  );
}
