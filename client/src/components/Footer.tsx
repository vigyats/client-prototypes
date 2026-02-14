import { Link } from "wouter";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/components/ThemeProvider";

export function Footer() {
  const { t } = useI18n();
  const { theme } = useTheme();

  return (
    <footer className="mt-20 pt-16 pb-10 border-t-4 border-primary/30 bg-gradient-to-b from-background via-muted/20 to-muted/40 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] rounded-t-[40px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <img src={theme === "dark" ? "/logo-1.png" : "/logo.png"} alt="Logo" className="h-16 w-auto" />
          </div>
          <h5 className="font-bold text-2xl bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-[hsl(var(--tri-navy))] to-[hsl(var(--tri-green))] bg-clip-text text-transparent">
            {t.brand}
          </h5>
          <p className="text-sm text-muted-foreground leading-relaxed pr-4">
            {t.home.footerDesc}
          </p>
        </div>
        <div className="space-y-4">
          <h6 className="font-bold text-lg mb-4 text-foreground">{t.home.footerQuickLinks}</h6>
          <div className="space-y-3 text-sm">
            <Link href="/projects" className="flex items-center gap-2 text-muted-foreground hover:text-[hsl(var(--tri-navy))] hover:translate-x-2 transition-all duration-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--tri-saffron))]" />
              {t.nav.projects}
            </Link>
            <Link href="/events" className="flex items-center gap-2 text-muted-foreground hover:text-[hsl(var(--tri-navy))] hover:translate-x-2 transition-all duration-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--tri-navy))]" />
              {t.nav.events}
            </Link>
            <Link href="/about" className="flex items-center gap-2 text-muted-foreground hover:text-[hsl(var(--tri-navy))] hover:translate-x-2 transition-all duration-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--tri-green))]" />
              {t.nav.about}
            </Link>
            <Link href="/donate" className="flex items-center gap-2 text-muted-foreground hover:text-[hsl(var(--tri-navy))] hover:translate-x-2 transition-all duration-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--tri-saffron))]" />
              {t.nav.donate}
            </Link>
          </div>
        </div>
        <div>
          <h6 className="font-bold text-lg mb-4 text-foreground">{t.labels.contactUs}</h6>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">🏥</span>
              <p className="leading-relaxed font-medium text-foreground">Sanjeevani Hospital,<br/>Mahadeo Mandir Road,<br/>Yavatmal : 445001</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📞</span>
              <p className="font-semibold text-foreground">
                <a href="tel:+919422165236" className="hover:underline">+91-9422165236</a>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">✉️</span>
              <p className="font-semibold text-foreground">
                <a href="mailto:prayasyeotmal@gmail.com" className="hover:underline break-all">prayasyeotmal@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h6 className="font-bold text-lg mb-4 text-foreground">{t.home.footerConnect}</h6>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {t.home.footerConnectDesc}
          </p>
        </div>
        </div>
        <div className="pt-8 border-t-2 border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4 px-2">
        <p className="text-sm text-muted-foreground font-semibold">
          © {new Date().getFullYear()} {t.brand}. {t.home.footerRights}
        </p>
        <div className="flex items-center gap-3">
          <span className="h-2 w-10 rounded-full bg-[hsl(var(--tri-saffron))] shadow-[0_0_12px_hsl(var(--tri-saffron)/0.6)]" />
          <span className="h-2 w-10 rounded-full bg-white border-2 border-muted shadow-sm" />
          <span className="h-2 w-10 rounded-full bg-[hsl(var(--tri-green))] shadow-[0_0_12px_hsl(var(--tri-green)/0.6)]" />
        </div>
        </div>
      </div>
    </footer>
  );
}
