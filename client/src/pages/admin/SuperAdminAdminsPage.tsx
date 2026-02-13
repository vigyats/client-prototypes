import { useMemo, useState } from "react";
import { AdminShell } from "@/components/Shell";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { useAdminMe, useAdmins, useCreateAdmin, useUpdateAdmin } from "@/hooks/use-admins";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus, Shield, UserCog, Ban, CheckCircle2 } from "lucide-react";

export default function SuperAdminAdminsPage() {
  const { toast } = useToast();
  const adminMe = useAdminMe();
  const list = useAdmins();
  const create = useCreateAdmin();
  const update = useUpdateAdmin();

  const isSuper = adminMe.data?.role === "super_admin";

  const [createOpen, setCreateOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");

  const items = useMemo(() => (list.data || []).slice().sort((a, b) => b.id - a.id), [list.data]);

  async function handleCreate() {
    if (!userId.trim()) {
      toast({ title: "User ID required", description: "Paste a Replit userId (sub claim).", variant: "destructive" });
      return;
    }
    try {
      await create.mutateAsync({ userId: userId.trim(), role });
      toast({ title: "Admin added", description: "Access updated.", variant: "default" });
      setCreateOpen(false);
      setUserId("");
      setRole("admin");
    } catch (e) {
      toast({ title: "Create failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function setActive(id: number, isActive: boolean) {
    try {
      await update.mutateAsync({ id, updates: { isActive } });
      toast({ title: "Updated", description: isActive ? "Admin activated." : "Admin deactivated.", variant: "default" });
    } catch (e) {
      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function setAdminRole(id: number, next: "admin" | "super_admin") {
    try {
      await update.mutateAsync({ id, updates: { role: next } });
      toast({ title: "Updated", description: `Role set to ${next}.`, variant: "default" });
    } catch (e) {
      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="animate-fadeUp">
          <div className="rounded-[28px] border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">Super admin</div>
                  <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">Manage admins</h1>
                  <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
                    Add admins by userId (Replit OIDC sub). Activate/deactivate access and assign roles.
                  </p>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setCreateOpen(true)}
                      disabled={!isSuper}
                      className={cn(
                        "rounded-2xl h-11 px-4 font-semibold",
                        "bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-primary to-[hsl(var(--tri-green))] text-primary-foreground",
                        "shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)]",
                        "hover:-translate-y-[1px] active:translate-y-0 transition-all",
                        !isSuper ? "opacity-60 cursor-not-allowed hover:transform-none" : "",
                      )}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add admin
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-xl rounded-3xl border-border/70 bg-popover/90 shadow-[var(--shadow-lg)] backdrop-blur">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Add admin</DialogTitle>
                    </DialogHeader>

                    <div className="rounded-2xl border bg-background p-4">
                      <div className="text-xs font-semibold text-muted-foreground">User ID (sub)</div>
                      <Input
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Paste Replit user id (claims.sub)"
                        className="mt-1 h-12 rounded-2xl border-border/70 bg-card/50 focus:ring-4 focus:ring-ring/20 transition-all"
                      />

                      <div className="mt-4 text-xs font-semibold text-muted-foreground">Role</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setRole("admin")}
                          className={cn("h-12 rounded-2xl border-border/70 bg-card/50 hover:bg-card hover:shadow-[var(--shadow-sm)] transition-all flex-1",
                            role === "admin" ? "border-primary/35 bg-primary/5" : ""
                          )}
                        >
                          Admin
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setRole("super_admin")}
                          className={cn("h-12 rounded-2xl border-border/70 bg-card/50 hover:bg-card hover:shadow-[var(--shadow-sm)] transition-all flex-1",
                            role === "super_admin" ? "border-[hsl(var(--tri-saffron))]/35 bg-[hsl(var(--tri-saffron))]/10" : ""
                          )}
                        >
                          Super admin
                        </Button>
                      </div>

                      <Button
                        onClick={() => void handleCreate()}
                        disabled={create.isPending}
                        className="mt-4 w-full rounded-2xl h-12 font-semibold bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                      >
                        {create.isPending ? "Adding…" : "Add admin"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {!isSuper ? (
                <div className="mt-5 rounded-2xl border border-[hsl(var(--tri-saffron))]/35 bg-[hsl(var(--tri-saffron))]/10 p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl border bg-background grid place-items-center">
                      <Shield className="h-5 w-5 text-[hsl(var(--tri-saffron))]" />
                    </div>
                    <div>
                      <div className="font-bold">Restricted</div>
                      <div className="text-muted-foreground">
                        Only super admins can manage admin accounts. If you need access, ask a super admin to update your role.
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="h-2 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))]" />
          </div>

          <div className="mt-6 rounded-3xl border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur overflow-hidden">
            <div className="p-4 md:p-5 border-b bg-background/60">
              <div className="text-sm font-bold">Admins</div>
              <div className="text-xs text-muted-foreground">List, role changes, and activation controls.</div>
            </div>

            <div className="p-4 md:p-5">
              {list.isLoading ? (
                <div className="rounded-3xl border bg-card/50 p-6 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
              ) : list.isError ? (
                <div className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-md)]">
                  <div className="text-sm font-bold">Failed to load</div>
                  <div className="mt-1 text-sm text-muted-foreground">{(list.error as Error).message}</div>
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-3xl border bg-card p-8 shadow-[var(--shadow-md)]">
                  <div className="text-lg font-bold">No admins yet</div>
                  <div className="mt-2 text-sm text-muted-foreground">Add an admin using userId.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {items.map((a) => {
                    const roleBadge =
                      a.role === "super_admin"
                        ? "border-[hsl(var(--tri-saffron))]/35 bg-[hsl(var(--tri-saffron))]/10"
                        : "border-border bg-muted/30";

                    return (
                      <div key={a.id} className="rounded-3xl border bg-background/70 shadow-[var(--shadow-sm)] p-4 md:p-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={cn("inline-flex items-center gap-2 rounded-xl border px-2 py-1 text-xs font-semibold", roleBadge)}>
                                <UserCog className="h-4 w-4" />
                                {a.role}
                              </span>
                              <span className={cn("inline-flex items-center gap-2 rounded-xl border px-2 py-1 text-xs font-semibold",
                                a.isActive ? "border-[hsl(var(--tri-green))]/35 bg-[hsl(var(--tri-green))]/10" : "border-destructive/35 bg-destructive/10"
                              )}>
                                {a.isActive ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--tri-green))]" /> : <Ban className="h-4 w-4 text-destructive" />}
                                {a.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <div className="mt-2 text-xs text-muted-foreground">Admin ID: <span className="font-semibold text-foreground/85">{a.id}</span></div>
                            <div className="mt-1 text-xs text-muted-foreground break-all">User ID: <span className="font-semibold text-foreground/85">{a.userId}</span></div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              disabled={!isSuper || update.isPending}
                              onClick={() => void setActive(a.id, !a.isActive)}
                              className="rounded-2xl h-11 border-border/70 bg-card/50 hover:bg-card hover:shadow-[var(--shadow-sm)] transition-all"
                            >
                              {a.isActive ? "Deactivate" : "Activate"}
                            </Button>

                            <Button
                              variant="outline"
                              disabled={!isSuper || update.isPending}
                              onClick={() => void setAdminRole(a.id, a.role === "admin" ? "super_admin" : "admin")}
                              className={cn(
                                "rounded-2xl h-11 border-border/70 bg-card/50 hover:bg-card hover:shadow-[var(--shadow-sm)] transition-all",
                                a.role === "super_admin" ? "border-[hsl(var(--tri-saffron))]/35 bg-[hsl(var(--tri-saffron))]/10" : "",
                              )}
                            >
                              {a.role === "admin" ? "Make super" : "Make admin"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
