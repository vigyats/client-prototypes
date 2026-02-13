import { Shell } from "@/components/Shell";
import { useI18n } from "@/hooks/use-i18n";

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <Shell>
      <div className="animate-fadeUp space-y-12 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="relative rounded-[32px] border-2 border-primary/15 bg-gradient-to-br from-card/90 to-background shadow-2xl overflow-hidden">
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[hsl(var(--tri-saffron))] to-[hsl(var(--tri-green))]" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.nav.about}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.25] pt-4 pb-2 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-foreground to-[hsl(var(--tri-green))] bg-clip-text text-transparent mb-4">
              {t.about.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground/90 font-semibold leading-relaxed">
              {t.about.subtitle}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))] flag-flow" />
        </div>

        {/* Main Content */}
        <div className="rounded-3xl border-2 border-primary/10 bg-card/50 backdrop-blur-sm p-8 md:p-10 lg:p-12 space-y-6">
          <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
            {t.about.content1} <span className="font-bold text-[hsl(var(--tri-navy))]">"Prayas Yavatmal."</span>
          </p>

          <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
            {t.about.content2}
          </p>

          <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--tri-saffron))]/5 to-[hsl(var(--tri-green))]/5 border border-primary/10">
            <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
              <span className="font-bold text-[hsl(var(--tri-navy))]">Dr. Avinash Savji</span>, {t.about.content3}
            </p>
          </div>

          <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
            {t.about.content4} <span className="font-semibold">"We have sown the seed, you sow the seed"</span> {t.about.content4b}
          </p>

          <div className="pt-6 border-t border-primary/10">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-[hsl(var(--tri-navy))]">{t.about.projectsTitle}</h3>
            <p className="text-base md:text-lg text-foreground/90 leading-relaxed mb-6">
              {t.about.projectsDesc}
            </p>
            <a
              href="/projects"
              className="inline-flex items-center justify-center rounded-full h-12 px-8 text-base font-bold shadow-lg bg-[hsl(var(--tri-navy))] text-white hover:bg-[hsl(var(--tri-saffron))] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out"
            >
              {t.about.viewProjects}
            </a>
          </div>
        </div>

        {/* Call to Action */}
        <div className="rounded-3xl border-2 border-[hsl(var(--tri-green))]/20 bg-gradient-to-br from-[hsl(var(--tri-green))]/5 to-card p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-[hsl(var(--tri-green))]">
            {t.about.joinMission}
          </h3>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t.about.joinDesc}
          </p>
        </div>
      </div>
    </Shell>
  );
}
