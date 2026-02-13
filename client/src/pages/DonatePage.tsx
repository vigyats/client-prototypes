import { Shell } from "@/components/Shell";
import { useI18n } from "@/hooks/use-i18n";
import { Heart, Users, Leaf, HandHeart } from "lucide-react";

export default function DonatePage() {
  const { t } = useI18n();

  return (
    <Shell>
      <div className="animate-fadeUp space-y-12 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="relative rounded-[32px] border-2 border-primary/15 bg-gradient-to-br from-card/90 to-background shadow-2xl overflow-hidden">
          <div className="relative z-10 p-8 md:p-12 lg:p-16 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[hsl(var(--tri-saffron))] to-[hsl(var(--tri-green))]" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.nav.donate}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.25] pt-4 pb-2 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-foreground to-[hsl(var(--tri-green))] bg-clip-text text-transparent mb-4">
              {t.donate.title}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground/90 font-semibold leading-relaxed max-w-2xl mx-auto">
              {t.donate.subtitle}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))] flag-flow" />
        </div>

        {/* Impact Areas */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-[hsl(var(--tri-saffron))]/20 bg-gradient-to-br from-[hsl(var(--tri-saffron))]/5 to-card p-6 md:p-8">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--tri-saffron))]/20 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-[hsl(var(--tri-saffron))]" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.donate.communityDev}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.donate.communityDevDesc}
            </p>
          </div>

          <div className="rounded-3xl border-2 border-[hsl(var(--tri-navy))]/20 bg-gradient-to-br from-[hsl(var(--tri-navy))]/5 to-card p-6 md:p-8">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--tri-navy))]/20 flex items-center justify-center mb-4">
              <HandHeart className="h-6 w-6 text-[hsl(var(--tri-navy))]" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.donate.socialWelfare}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.donate.socialWelfareDesc}
            </p>
          </div>

          <div className="rounded-3xl border-2 border-[hsl(var(--tri-green))]/20 bg-gradient-to-br from-[hsl(var(--tri-green))]/5 to-card p-6 md:p-8">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--tri-green))]/20 flex items-center justify-center mb-4">
              <Leaf className="h-6 w-6 text-[hsl(var(--tri-green))]" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.donate.envProtection}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.donate.envProtectionDesc}
            </p>
          </div>

          <div className="rounded-3xl border-2 border-[hsl(var(--tri-saffron))]/20 bg-gradient-to-br from-[hsl(var(--tri-saffron))]/5 to-card p-6 md:p-8">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--tri-saffron))]/20 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-[hsl(var(--tri-saffron))]" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.donate.youthEmp}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.donate.youthEmpDesc}
            </p>
          </div>
        </div>

        {/* Donation Info */}
        <div className="rounded-3xl border-2 border-primary/10 bg-card/50 backdrop-blur-sm p-8 md:p-10 lg:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t.donate.howToContribute}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-primary/10">
                <h3 className="text-lg font-bold mb-3 text-[hsl(var(--tri-navy))]">{t.donate.bankTransfer}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-semibold text-foreground">{t.donate.accountName}</span> Prayas Yavatmal</p>
                  <p><span className="font-semibold text-foreground">{t.donate.accountNumber}</span> Contact us for details</p>
                  <p><span className="font-semibold text-foreground">{t.donate.ifscCode}</span> Contact us for details</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-primary/10">
                <h3 className="text-lg font-bold mb-3 text-[hsl(var(--tri-navy))]">{t.donate.contactUs}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.donate.contactDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-muted/30 border-2 border-primary/10">
                <h3 className="text-lg font-bold mb-4 text-center text-[hsl(var(--tri-navy))]">{t.donate.scanToDonate}</h3>
                <div className="w-64 h-64 bg-white rounded-xl p-4 flex items-center justify-center border-2 border-primary/20">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <rect width="200" height="200" fill="white"/>
                    <g fill="black">
                      <rect x="20" y="20" width="10" height="10"/>
                      <rect x="30" y="20" width="10" height="10"/>
                      <rect x="50" y="20" width="10" height="10"/>
                      <rect x="70" y="20" width="10" height="10"/>
                      <rect x="80" y="20" width="10" height="10"/>
                      <rect x="110" y="20" width="10" height="10"/>
                      <rect x="130" y="20" width="10" height="10"/>
                      <rect x="150" y="20" width="10" height="10"/>
                      <rect x="160" y="20" width="10" height="10"/>
                      <rect x="170" y="20" width="10" height="10"/>
                      <rect x="20" y="30" width="10" height="10"/>
                      <rect x="80" y="30" width="10" height="10"/>
                      <rect x="110" y="30" width="10" height="10"/>
                      <rect x="130" y="30" width="10" height="10"/>
                      <rect x="170" y="30" width="10" height="10"/>
                      <rect x="20" y="40" width="10" height="10"/>
                      <rect x="40" y="40" width="10" height="10"/>
                      <rect x="50" y="40" width="10" height="10"/>
                      <rect x="60" y="40" width="10" height="10"/>
                      <rect x="80" y="40" width="10" height="10"/>
                      <rect x="110" y="40" width="10" height="10"/>
                      <rect x="150" y="40" width="10" height="10"/>
                      <rect x="160" y="40" width="10" height="10"/>
                      <rect x="170" y="40" width="10" height="10"/>
                    </g>
                  </svg>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">{t.donate.upiQr}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="rounded-3xl border-2 border-[hsl(var(--tri-saffron))]/20 bg-gradient-to-br from-[hsl(var(--tri-saffron))]/5 to-card p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🙏</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-[hsl(var(--tri-saffron))]">
            {t.donate.thankYou}
          </h3>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t.donate.thankYouDesc}
          </p>
        </div>
      </div>
    </Shell>
  );
}
