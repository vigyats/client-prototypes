import { PropsWithChildren, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import { useAdminMe } from "@/hooks/use-admins";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CalendarDays, FolderKanban, Shield, LogOut, ArrowRight, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function Brand() {
  const { t } = useI18n();
  return (
    <Link href="/" className="flex items-center gap-3">
       <img
        src="/logo.png"
        alt="Logo"
        className="h-12 w-auto"
      />
    </Link>
  );
}

function TopNav() {
  const { t } = useI18n();
  const [loc] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: adminMe } = useAdminMe();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: t.nav.home },
    { href: "/projects", label: t.nav.projects },
    { href: "/events", label: t.nav.events },
    { href: "/about", label: t.nav.about },
    { href: "/donate", label: t.nav.donate },
  ];

  const showAdmin = isAuthenticated && adminMe?.isAdmin;

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flag-border">
          <Brand />
          
          <div className="hidden lg:flex items-center gap-2 ml-24">
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
            <div className="hidden sm:flex items-center gap-2">
              <LanguageSwitcher compact />
              <AuthButtons />
            </div>
            
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 rounded-l-[32px] border-l shadow-2xl">
                <div className="flex flex-col h-full bg-heritage grain">
                  <div className="p-6 border-b bg-background/50 backdrop-blur">
                    <div className="flex items-center justify-between mb-8">
                      <Brand />
                      <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-xl">
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {nav.map((n) => (
                        <Link
                          key={n.href}
                          href={n.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center w-full px-4 py-3 rounded-2xl text-lg font-bold transition-all",
                            loc === n.href ? "bg-card shadow-sm border" : "text-foreground/70 hover:bg-muted/50"
                          )}
                        >
                          {n.label}
                        </Link>
                      ))}
                      {showAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center w-full px-4 py-3 rounded-2xl text-lg font-bold transition-all border mt-4 bg-card/50",
                            loc.startsWith("/admin") ? "border-primary/30 bg-primary/5" : "text-foreground/70 hover:bg-muted/50"
                          )}
                        >
                          <LayoutDashboard className="mr-3 h-5 w-5 text-primary" />
                          {t.nav.admin}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto p-6 bg-background/50 backdrop-blur border-t">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between bg-card/40 rounded-2xl border p-3">
                        <span className="text-sm font-bold text-muted-foreground">{t.labels.language}</span>
                        <LanguageSwitcher compact />
                      </div>
                      <AuthButtons mobile />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function AuthButtons({ mobile }: { mobile?: boolean }) {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useAuth();

  if (isLoading) {
    return (
      <div className={cn("h-10 w-28 rounded-2xl border bg-card/50 shimmer", mobile && "w-full")} style={{
        backgroundImage:
          "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)",
      }} />
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => (window.location.href = "/admin/login")}
        className={cn(
          "rounded-2xl px-4 h-11 font-bold",
          "bg-transparent hover:bg-black/5",
          "text-black hover:text-black/90",
          "border border-black/20 hover:border-black/40",
          "shadow-sm hover:shadow-md",
          mobile && "w-full h-14 text-lg"
        )}
      >
        {t.actions.login}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    );
  }

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Authenticated";

  if (mobile) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-2xl border bg-card/60 p-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl border bg-background">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-sm font-bold text-muted-foreground">
                {name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold">{name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        <Button
          variant="outline"
          disabled={isLoggingOut}
          onClick={() => logout()}
          className="h-14 rounded-2xl border-border/70 bg-card/50 font-bold"
        >
          <LogOut className="mr-2 h-5 w-5" />
          {t.actions.logout}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  );
}

/* Admin shell with sidebar */
export function AdminShell({ children }: PropsWithChildren) {
  const [loc] = useLocation();
  const { t } = useI18n();

  const items = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, superOnly: false },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban, superOnly: false },
    { href: "/admin/events", label: "Events", icon: CalendarDays, superOnly: false },
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
