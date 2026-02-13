import { PropsWithChildren, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAdminMe } from "@/hooks/use-admins";

export function AdminGuard({ children }: PropsWithChildren) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const adminMe = useAdminMe();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Login required", description: "Redirecting to login…", variant: "destructive" });
      setTimeout(() => (window.location.href = "/api/login"), 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="rounded-3xl border bg-card/70 p-6 shadow-[var(--shadow-lg)]">
          <div className="h-10 w-10 rounded-2xl border bg-background grid place-items-center mx-auto">
            <div className="h-4 w-4 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
          </div>
          <div className="mt-4 text-sm font-bold text-center">Checking authentication…</div>
          <div className="mt-1 text-sm text-muted-foreground text-center">Secure session required.</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (adminMe.isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="rounded-3xl border bg-card/70 p-6 shadow-[var(--shadow-lg)]">
          <div className="text-sm font-bold text-center">Checking admin access…</div>
          <div className="mt-2 h-2 w-64 rounded-full overflow-hidden border bg-muted">
            <div className="h-full w-2/3 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-primary to-[hsl(var(--tri-green))]" />
          </div>
        </div>
      </div>
    );
  }

  if (adminMe.isError) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="rounded-3xl border bg-card/70 p-6 shadow-[var(--shadow-lg)] max-w-lg">
          <div className="text-sm font-bold">Cannot verify admin status</div>
          <div className="mt-1 text-sm text-muted-foreground">{(adminMe.error as Error)?.message}</div>
        </div>
      </div>
    );
  }

  if (!adminMe.data?.isAdmin) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="rounded-3xl border bg-card/70 p-8 shadow-[var(--shadow-lg)] max-w-xl">
          <div className="text-lg font-bold">Access restricted</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Your account is authenticated, but not registered as an admin. Ask a super admin to grant access.
          </div>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-5 w-full rounded-2xl px-4 py-3 font-semibold bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
