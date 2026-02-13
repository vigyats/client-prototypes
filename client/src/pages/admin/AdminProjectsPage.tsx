import { useMemo, useState } from "react";
import { AdminShell } from "@/components/Shell";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useCreateProject, useProjects, useUpdateProject } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { CoverImageField } from "@/components/CoverImageField";
import { TranslationTabs } from "@/components/TranslationTabs";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Star, ArrowUpRight, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

type TrForm = {
  language: Lang;
  status: "draft" | "published";
  title: string;
  summary: string;
  contentHtml: string;
};

function emptyTranslation(language: Lang): TrForm {
  return { language, status: "draft", title: "", summary: "", contentHtml: "" };
}

export default function AdminProjectsPage() {
  const { lang } = useI18n();
  const { toast } = useToast();
  const list = useProjects({ lang });
  const create = useCreateProject();
  const update = useUpdateProject();

  const featuredCount = (list.data || []).filter((p) => p.project.isFeatured).length;

  const [createOpen, setCreateOpen] = useState(false);

  const items = useMemo(() => {
    const l = list.data || [];
    return l.slice().sort((a, b) => {
      const fa = a.project.isFeatured ? 1 : 0;
      const fb = b.project.isFeatured ? 1 : 0;
      if (fa !== fb) return fb - fa;
      return new Date(b.project.updatedAt as any).getTime() - new Date(a.project.updatedAt as any).getTime();
    });
  }, [list.data]);

  // Create form state
  const [slug, setSlug] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverImagePath, setCoverImagePath] = useState<string | null>(null);
  const [activeTrLang, setActiveTrLang] = useState<Lang>("en");
  const [tr, setTr] = useState<Record<Lang, TrForm>>({
    en: emptyTranslation("en"),
    hi: emptyTranslation("hi"),
    mr: emptyTranslation("mr"),
  });

  function resetCreate() {
    setSlug("");
    setIsFeatured(false);
    setCoverImagePath(null);
    setActiveTrLang("en");
    setTr({ en: emptyTranslation("en"), hi: emptyTranslation("hi"), mr: emptyTranslation("mr") });
  }

  async function handleCreate() {
    const translations = (["en", "hi", "mr"] as Lang[])
      .map((l) => tr[l])
      .filter((x) => x.title.trim() && x.contentHtml.trim())
      .map((x) => ({
        language: x.language,
        status: x.status,
        title: x.title.trim(),
        summary: x.summary.trim() ? x.summary.trim() : null,
        contentHtml: x.contentHtml,
      }));

    if (!slug.trim()) {
      toast({ title: "Slug required", description: "Please add a unique slug.", variant: "destructive" });
      return;
    }
    if (translations.length === 0) {
      toast({ title: "Translation required", description: "Add at least one translation (title + content).", variant: "destructive" });
      return;
    }
    if (isFeatured && featuredCount >= 4) {
      toast({ title: "Featured limit reached", description: "You can feature at most 4 projects.", variant: "destructive" });
      return;
    }

    try {
      await create.mutateAsync({
        slug: slug.trim(),
        isFeatured,
        coverImagePath,
        translations,
      });
      toast({ title: "Project created", description: "Saved successfully.", variant: "default" });
      setCreateOpen(false);
      resetCreate();
    } catch (e) {
      const err = e as Error;
      if (isUnauthorizedError(err)) {
        toast({ title: "Unauthorized", description: "Redirecting to login…", variant: "destructive" });
        setTimeout(() => (window.location.href = "/api/login"), 500);
        return;
      }
      toast({ title: "Create failed", description: err.message, variant: "destructive" });
    }
  }

  async function toggleFeatured(id: number, next: boolean) {
    if (next && featuredCount >= 4) {
      toast({
        title: "Featured limit reached",
        description: "Unfeature one of the existing featured projects first.",
        variant: "destructive",
      });
      return;
    }
    try {
      await update.mutateAsync({ id, updates: { isFeatured: next } });
      toast({ title: "Updated", description: "Featured status updated.", variant: "default" });
    } catch (e) {
      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="animate-fadeUp">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground">Admin • Projects</div>
              <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">Projects</h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
                Create projects, upload covers, and manage translations. Home page features are limited to 4.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/projects" className="text-sm font-semibold text-primary hover:underline">
                View public <ArrowUpRight className="inline h-4 w-4" />
              </Link>

              <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetCreate(); }}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setCreateOpen(true)}
                    className="rounded-2xl h-11 px-4 font-semibold bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New project
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-4xl rounded-3xl border-border/70 bg-popover/90 shadow-[var(--shadow-lg)] backdrop-blur">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Create project</DialogTitle>
                  </DialogHeader>

                  {featuredCount >= 4 ? (
                    <div className="rounded-2xl border border-[hsl(var(--tri-saffron))]/35 bg-[hsl(var(--tri-saffron))]/10 p-4 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-2xl border bg-background grid place-items-center">
                          <AlertTriangle className="h-5 w-5 text-[hsl(var(--tri-saffron))]" />
                        </div>
                        <div>
                          <div className="font-bold">Featured limit reached</div>
                          <div className="text-muted-foreground">
                            You already have {featuredCount}/4 featured projects. You can still create projects, but cannot mark new ones as featured.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="rounded-3xl border bg-card shadow-[var(--shadow-md)] p-4">
                        <div className="text-sm font-bold">Basics</div>
                        <div className="mt-3 space-y-3">
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground">Slug</div>
                            <Input
                              value={slug}
                              onChange={(e) => setSlug(e.target.value)}
                              placeholder="e.g. rural-health-outreach-2026"
                              className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                            />
                          </div>

                          <div className="flex items-center justify-between rounded-2xl border bg-background/70 p-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-2xl border bg-card grid place-items-center">
                                <Star className={cn("h-5 w-5", isFeatured ? "text-[hsl(var(--tri-saffron))]" : "text-muted-foreground")} />
                              </div>
                              <div>
                                <div className="text-sm font-bold">Featured on Home</div>
                                <div className="text-xs text-muted-foreground">Max 4 featured projects.</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isFeatured}
                                onCheckedChange={(v) => setIsFeatured(Boolean(v))}
                                disabled={featuredCount >= 4}
                              />
                              <Badge variant="secondary" className="rounded-xl">
                                {isFeatured ? "Featured" : "Standard"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <CoverImageField value={coverImagePath} onChange={setCoverImagePath} label="Cover image" />
                    </div>

                    <TranslationTabs
                      activeLang={activeTrLang}
                      onChangeLang={setActiveTrLang}
                      render={(l) => (
                        <div className="space-y-4">
                          <div className="rounded-3xl border bg-card shadow-[var(--shadow-md)] p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs font-semibold text-muted-foreground">Title</div>
                                <Input
                                  value={tr[l].title}
                                  onChange={(e) => setTr((p) => ({ ...p, [l]: { ...p[l], title: e.target.value } }))}
                                  placeholder="Project title"
                                  className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                                />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-muted-foreground">Status</div>
                                <div className="mt-1 flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setTr((p) => ({ ...p, [l]: { ...p[l], status: "draft" } }))}
                                    className={cn("h-12 rounded-2xl border-border/70 bg-background/70 hover:bg-muted/70 transition-all flex-1",
                                      tr[l].status === "draft" ? "border-primary/35 bg-primary/5" : ""
                                    )}
                                  >
                                    Draft
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setTr((p) => ({ ...p, [l]: { ...p[l], status: "published" } }))}
                                    className={cn("h-12 rounded-2xl border-border/70 bg-background/70 hover:bg-muted/70 transition-all flex-1",
                                      tr[l].status === "published" ? "border-primary/35 bg-primary/5" : ""
                                    )}
                                  >
                                    Published
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="text-xs font-semibold text-muted-foreground">Summary (optional)</div>
                              <Input
                                value={tr[l].summary}
                                onChange={(e) => setTr((p) => ({ ...p, [l]: { ...p[l], summary: e.target.value } }))}
                                placeholder="One-line highlight for cards"
                                className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                              />
                            </div>
                          </div>

                          <RichTextEditor
                            value={tr[l].contentHtml}
                            onChange={(html) => setTr((p) => ({ ...p, [l]: { ...p[l], contentHtml: html } }))}
                            placeholder="Write structured content: headings, lists, quotes, links…"
                          />
                        </div>
                      )}
                      headerRight={
                        <Button
                          onClick={() => void handleCreate()}
                          disabled={create.isPending}
                          className="rounded-2xl h-11 px-4 font-semibold bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-primary to-[hsl(var(--tri-green))] text-primary-foreground shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                        >
                          {create.isPending ? "Creating…" : "Create"}
                        </Button>
                      }
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur overflow-hidden">
            <div className="p-4 md:p-5 border-b bg-background/60 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">All projects</div>
                <div className="text-xs text-muted-foreground">
                  Featured: {featuredCount}/4 • Click a project to edit translations and content.
                </div>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                Showing language: <span className="text-foreground/85">{lang.toUpperCase()}</span>
              </div>
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
                  <div className="text-lg font-bold">No projects yet</div>
                  <div className="mt-2 text-sm text-muted-foreground">Create your first project to populate the home and projects pages.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {items.map((it) => (
                    <div key={it.project.id} className="rounded-3xl border bg-background/70 shadow-[var(--shadow-sm)] p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={cn("inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-xs font-semibold",
                              it.project.isFeatured
                                ? "border-[hsl(var(--tri-saffron))]/40 bg-[hsl(var(--tri-saffron))]/10"
                                : "border-border bg-muted/30"
                            )}>
                              <Star className={cn("h-3.5 w-3.5", it.project.isFeatured ? "text-[hsl(var(--tri-saffron))]" : "text-muted-foreground")} />
                              {it.project.isFeatured ? "Featured" : "Standard"}
                            </div>
                            <div className="text-xs text-muted-foreground">slug</div>
                            <div className="text-xs font-semibold">{it.project.slug}</div>
                          </div>

                          <div className="mt-2 text-sm text-muted-foreground">
                            Updated: {new Date(it.project.updatedAt as any).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void toggleFeatured(it.project.id, !it.project.isFeatured)}
                            disabled={update.isPending}
                            className={cn(
                              "rounded-2xl h-11 border-border/70 bg-card/50 hover:bg-card hover:shadow-[var(--shadow-sm)] transition-all",
                              it.project.isFeatured ? "border-[hsl(var(--tri-saffron))]/35 bg-[hsl(var(--tri-saffron))]/8" : "",
                            )}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            {it.project.isFeatured ? "Unfeature" : "Feature"}
                          </Button>

                          <Link
                            href={`/admin/projects/${it.project.id}`}
                            className="inline-flex items-center justify-center rounded-2xl h-11 px-4 font-semibold bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_14px_30px_hsl(var(--primary)/0.18)] hover:shadow-[0_18px_40px_hsl(var(--primary)/0.22)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                          >
                            Edit <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
