import { PropsWithChildren } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import { useAdminMe } from "@/hooks/use-admins";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CalendarDays, FolderKanban, Shield, LogOut, ArrowRight } from "lucide-react";

function Brand() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 rounded-2xl border bg-card shadow-[var(--shadow-md)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--tri-saffron))]/25 via-white to-[hsl(var(--tri-green))]/25" />
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))]" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--tri-navy))]/50" />
        </div>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold tracking-tight">{t.brand}</div>
        <div className="text-xs text-muted-foreground">{t.tagline}</div>
      </div>
    </div>
  );
}

function TopNav() {
  const { t } = useI18n();
  const [loc] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: adminMe } = useAdminMe();

  const nav = [
    { href: "/", label: t.nav.home },
    { href: "/projects", label: t.nav.projects },
    { href: "/events", label: t.nav.events },
  ];

  const showAdmin = isAuthenticated && adminMe?.isAdmin;

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flag-border">
          <Brand />
          <div className="hidden lg:flex items-center gap-2">
            {nav.map((n) => {
              const active = loc === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                    "hover:bg-muted/70 hover:shadow-[var(--shadow-sm)]",
                    active ? "bg-card shadow-[var(--shadow-sm)]" : "text-foreground/80",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
            {showAdmin ? (
              <Link
                href="/admin"
                className={cn(
                  "ml-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                  "border bg-card/50 hover:bg-card hover:shadow-[var(--shadow-sm)]",
                )}
              >
                {t.nav.admin}
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
}

function AuthButtons() {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useAuth();

  if (isLoading) {
    return (
      <div className="h-10 w-28 rounded-2xl border bg-card/50 shimmer" style={{
        backgroundImage:
          "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)",
      }} />
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => (window.location.href = "/api/login")}
        className={cn(
          "rounded-2xl px-4 h-10 font-semibold",
          "bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-primary to-[hsl(var(--tri-green))]",
          "text-primary-foreground shadow-[0_18px_40px_hsl(var(--primary)/0.22)]",
          "hover:shadow-[0_22px_50px_hsl(var(--primary)/0.28)] hover:-translate-y-[1px] active:translate-y-0 transition-all",
        )}
      >
        {t.actions.login}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    );
  }

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Authenticated";

  return (
    <div className="hidden sm:flex items-center gap-2">
      <div className="hidden lg:flex items-center gap-2 rounded-2xl border bg-card/60 px-3 py-2 shadow-[var(--shadow-sm)]">
        <div className="h-8 w-8 overflow-hidden rounded-xl border bg-background">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-xs font-bold text-muted-foreground">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="leading-tight">
          <div className="text-xs font-semibold text-foreground/85">{name}</div>
          <div className="text-[11px] text-muted-foreground">Signed in</div>
        </div>
      </div>

      <Button
        variant="outline"
        disabled={isLoggingOut}
        onClick={() => logout()}
        className="h-10 rounded-2xl border-border/70 bg-card/50 hover:bg-card hover:shadow-[var(--shadow-md)] transition-all"
      >
        <LogOut className="mr-2 h-4 w-4" />
        {t.actions.logout}
      </Button>
    </div>
  );
}

export function Shell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-heritage grain">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {children}
      </main>
      <footer className="border-t bg-background/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-3xl border bg-card/60 shadow-[var(--shadow-sm)] p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="text-sm font-bold tracking-tight">Public-good communication, built for clarity.</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Tricolour accents. Multilingual publishing. Admin governance.
                </div>
              </div>
              <div className="h-11 overflow-hidden rounded-2xl border bg-background">
                <div className="h-full w-full grid grid-cols-3">
                  <div className="bg-[hsl(var(--tri-saffron))]/90" />
                  <div className="bg-white" />
                  <div className="bg-[hsl(var(--tri-green))]/90" />
                </div>
              </div>
            </div>
            <div className="mt-6 text-xs text-muted-foreground">
              © {new Date().getFullYear()} • Built with secure auth, structured content, and a premium civic aesthetic.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Admin shell with sidebar */
export function AdminShell({ children }: PropsWithChildren) {
  const [loc] = useLocation();
  const { t } = useI18n();

  const items = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/events", label: "Events", icon: CalendarDays },
    { href: "/admin/admins", label: "Admins", icon: Shield, superOnly: true },
  ] as const;

  const { data: adminMe } = useAdminMe();
  const role = adminMe?.role;

  return (
    <div className="min-h-screen bg-heritage grain">
      <div className="sticky top-0 z-40">
        <div className="border-b bg-background/72 backdrop-blur flag-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="rounded-xl px-2 py-1 text-sm font-semibold hover:bg-muted/70 transition-all">
                ← {t.nav.home}
              </Link>
              <Brand />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher compact />
              <AuthButtons />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
          <aside className="lg:sticky lg:top-[92px] h-fit">
            <div className="rounded-3xl border bg-card/65 shadow-[var(--shadow-lg)] backdrop-blur p-4">
              <div className="px-3 py-3 rounded-2xl bg-background/70 border">
                <div className="text-xs text-muted-foreground">Admin area</div>
                <div className="text-sm font-bold">
                  Role:{" "}
                  <span className={cn(
                    "ml-1 inline-flex items-center rounded-lg border px-2 py-0.5 text-xs",
                    role === "super_admin"
                      ? "border-[hsl(var(--tri-saffron))]/40 bg-[hsl(var(--tri-saffron))]/10 text-foreground"
                      : "border-border bg-muted/40 text-foreground/90"
                  )}>
                    {role || "—"}
                  </span>
                </div>
              </div>

              <nav className="mt-4 space-y-1">
                {items
                  .filter((i) => !i.superOnly || role === "super_admin")
                  .map((i) => {
                    const active = loc === i.href;
                    const Icon = i.icon;
                    return (
                      <Link
                        key={i.href}
                        href={i.href}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                          "hover:bg-muted/70 hover:shadow-[var(--shadow-sm)]",
                          active ? "bg-background shadow-[var(--shadow-sm)] border" : "text-foreground/85",
                        )}
                      >
                        <div className={cn(
                          "h-9 w-9 rounded-2xl border grid place-items-center",
                          active
                            ? "bg-gradient-to-br from-primary/12 via-background to-[hsl(var(--tri-green))]/10"
                            : "bg-background"
                        )}>
                          <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        {i.label}
                      </Link>
                    );
                  })}
              </nav>
            </div>
          </aside>

          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}
