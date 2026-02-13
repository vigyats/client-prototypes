import { Link } from "wouter";
import { useI18n } from "@/hooks/use-i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 pt-8 border-t-2 border-primary/10">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <h5 className="font-bold text-lg mb-3 bg-gradient-to-r from-[hsl(var(--tri-saffron))] to-[hsl(var(--tri-green))] bg-clip-text text-transparent">
            {t.brand}
          </h5>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.home.footerDesc}
          </p>
        </div>
        <div>
          <h6 className="font-semibold mb-3">{t.home.footerQuickLinks}</h6>
          <div className="space-y-2 text-sm">
            <Link href="/projects" className="block text-muted-foreground hover:text-[hsl(var(--tri-navy))] transition-colors">
              {t.nav.projects}
            </Link>
            <Link href="/events" className="block text-muted-foreground hover:text-[hsl(var(--tri-navy))] transition-colors">
              {t.nav.events}
            </Link>
            <Link href="/about" className="block text-muted-foreground hover:text-[hsl(var(--tri-navy))] transition-colors">
              {t.nav.about}
            </Link>
            <Link href="/donate" className="block text-muted-foreground hover:text-[hsl(var(--tri-navy))] transition-colors">
              {t.nav.donate}
            </Link>
          </div>
        </div>
        <div>
          <h6 className="font-semibold mb-3">Contact</h6>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="leading-relaxed">Sanjeevani Hospital,<br/>Mahadeo Mandir Road,<br/>Yavatmal : 445001</p>
            <p>+91-9422165236</p>
            <p>prayasyeotmal@gmail.com</p>
          </div>
        </div>
        <div>
          <h6 className="font-semibold mb-3">{t.home.footerConnect}</h6>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.home.footerConnectDesc}
          </p>
        </div>
      </div>
      <div className="pt-6 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t.brand}. {t.home.footerRights}
        </p>
        <div className="flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-[hsl(var(--tri-saffron))]" />
          <span className="h-1 w-6 rounded-full bg-white border border-muted" />
          <span className="h-1 w-6 rounded-full bg-[hsl(var(--tri-green))]" />
        </div>
      </div>
    </footer>
  );
}
