import { AdminShell } from "@/components/Shell";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { useAdminMe } from "@/hooks/use-admins";
import { useProjects } from "@/hooks/use-projects";
import { useEvents } from "@/hooks/use-events";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { ArrowUpRight, Shield, FolderKanban, CalendarDays, Star } from "lucide-react";

export default function AdminDashboardPage() {
  const { lang } = useI18n();
  const adminMe = useAdminMe();
  const projects = useProjects({ lang });
  const events = useEvents({ lang });

  const featuredCount = (projects.data || []).filter((p) => p.project.isFeatured).length;

  return (
    <AdminGuard>
      <AdminShell>
        <div className="animate-fadeUp">
          <div className="rounded-[28px] border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">Admin</div>
                  <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">
                    Publishing dashboard
                  </h1>
                  <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
                    Create and maintain projects and events across EN/HI/MR. Control featured content for the home page and manage admin access (super admin only).
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-2xl border bg-background px-3 py-2 text-xs font-semibold text-foreground/80">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      Role: {adminMe.data?.role || "—"}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl border bg-background px-3 py-2 text-xs font-semibold text-foreground/80">
                      <Star className="h-4 w-4 text-[hsl(var(--tri-saffron))]" />
                      Featured: {featuredCount}/4
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                  <Link
                    href="/admin/projects"
                    className="rounded-3xl border bg-background p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[1px] transition-all"
                  >
                    <div className="h-10 w-10 rounded-2xl border bg-card grid place-items-center">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mt-3 text-sm font-bold">Projects</div>
                    <div className="mt-1 text-xs text-muted-foreground">Create, feature, translate</div>
                    <div className="mt-3 text-xs font-semibold text-primary">
                      Open <ArrowUpRight className="inline h-4 w-4" />
                    </div>
                  </Link>

                  <Link
                    href="/admin/events"
                    className="rounded-3xl border bg-background p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[1px] transition-all"
                  >
                    <div className="h-10 w-10 rounded-2xl border bg-card grid place-items-center">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mt-3 text-sm font-bold">Events</div>
                    <div className="mt-1 text-xs text-muted-foreground">Schedule & publish</div>
                    <div className="mt-3 text-xs font-semibold text-primary">
                      Open <ArrowUpRight className="inline h-4 w-4" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))]" />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-3xl border bg-card/70 shadow-[var(--shadow-md)] p-5">
              <div className="text-xs font-semibold text-muted-foreground">Projects</div>
              <div className="mt-1 text-2xl font-bold">{(projects.data || []).length}</div>
              <div className="mt-2 text-sm text-muted-foreground">Total projects in the catalogue.</div>
            </div>

            <div className="rounded-3xl border bg-card/70 shadow-[var(--shadow-md)] p-5">
              <div className="text-xs font-semibold text-muted-foreground">Events</div>
              <div className="mt-1 text-2xl font-bold">{(events.data || []).length}</div>
              <div className="mt-2 text-sm text-muted-foreground">Total events with translations.</div>
            </div>

            <div className="rounded-3xl border bg-card/70 shadow-[var(--shadow-md)] p-5">
              <div className="text-xs font-semibold text-muted-foreground">Featured limit</div>
              <div className="mt-1 text-2xl font-bold">{featuredCount}/4</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Enforced by UI. If you exceed, we block new featured toggles.
              </div>
            </div>
          </div>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
