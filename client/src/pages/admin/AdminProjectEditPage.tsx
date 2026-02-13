import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { AdminShell } from "@/components/Shell";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useProject, useUpdateProject, useUpsertProjectTranslation, useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { CoverImageField } from "@/components/CoverImageField";
import { TranslationTabs } from "@/components/TranslationTabs";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ArrowLeft, Save, Star, AlertTriangle } from "lucide-react";

type TrForm = {
  language: Lang;
  status: "draft" | "published";
  title: string;
  summary: string;
  contentHtml: string;
};

function pickExisting(trs: any[], lang: Lang) {
  const exact = trs.find((t) => t.language === lang);
  const en = trs.find((t) => t.language === "en");
  return exact || en || trs[0] || null;
}

export default function AdminProjectEditPage() {
  const params = useParams() as { id?: string };
  const id = Number(params.id);
  const { lang } = useI18n();
  const { toast } = useToast();

  const all = useProjects({ lang });
  const featuredCount = useMemo(() => (all.data || []).filter((p) => p.project.isFeatured).length, [all.data]);

  const q = useProject(id, { lang });
  const upd = useUpdateProject();
  const upsertTr = useUpsertProjectTranslation();

  const [slug, setSlug] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>("en");
  const [forms, setForms] = useState<Record<Lang, TrForm>>({
    en: { language: "en", status: "draft", title: "", summary: "", contentHtml: "" },
    hi: { language: "hi", status: "draft", title: "", summary: "", contentHtml: "" },
    mr: { language: "mr", status: "draft", title: "", summary: "", contentHtml: "" },
  });

  useEffect(() => {
    const data: any = q.data;
    if (!data?.project) return;
    setSlug(data.project.slug || "");
    setIsFeatured(Boolean(data.project.isFeatured));
    setCover(data.project.coverImagePath ?? null);

    const trs = data.translations || [];
    (["en", "hi", "mr"] as Lang[]).forEach((l) => {
      const ex = pickExisting(trs, l);
      if (ex) {
        setForms((p) => ({
          ...p,
          [l]: {
            language: l,
            status: ex.status || "draft",
            title: ex.title || "",
            summary: ex.summary || "",
            contentHtml: ex.contentHtml || "",
          },
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.data]);

  async function saveBasics() {
    if (!slug.trim()) {
      toast({ title: "Slug required", description: "Please add a slug.", variant: "destructive" });
      return;
    }
    if (!isFeatured && q.data && (q.data as any).project?.isFeatured && featuredCount > 4) {
      // harmless, just informational
    }
    if (isFeatured && !(q.data as any)?.project?.isFeatured && featuredCount >= 4) {
      toast({ title: "Featured limit reached", description: "Unfeature another project first.", variant: "destructive" });
      return;
    }

    try {
      await upd.mutateAsync({
        id,
        updates: {
          slug: slug.trim(),
          isFeatured,
          coverImagePath: cover,
        },
      });
      toast({ title: "Saved", description: "Project basics updated.", variant: "default" });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function saveTranslation(l: Lang) {
    const f = forms[l];
    if (!f.title.trim() || !f.contentHtml.trim()) {
      toast({ title: "Title + content required", description: "Please add title and content.", variant: "destructive" });
      return;
    }
    try {
      await upsertTr.mutateAsync({
        id,
        lang: l,
        input: {
          language: l,
          status: f.status,
          title: f.title.trim(),
          summary: f.summary.trim() ? f.summary.trim() : null,
          contentHtml: f.contentHtml,
        },
      });
      toast({ title: "Saved", description: `Translation ${l.toUpperCase()} updated.`, variant: "default" });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="animate-fadeUp">
          <div className="flex items-center justify-between gap-4">
            <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
            <Link href={`/projects/${id}`} className="text-sm font-semibold text-primary hover:underline">
              View public
            </Link>
          </div>

          {q.isLoading ? (
            <div className="mt-6 rounded-3xl border bg-card/50 p-6 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
          ) : q.isError ? (
            <div className="mt-6 rounded-3xl border bg-card p-6 shadow-[var(--shadow-md)]">
              <div className="text-sm font-bold">Could not load project</div>
              <div className="mt-1 text-sm text-muted-foreground">{(q.error as Error).message}</div>
            </div>
          ) : !(q.data as any)?.project ? (
            <div className="mt-6 rounded-3xl border bg-card p-8 shadow-[var(--shadow-md)]">
              <div className="text-lg font-bold">Not found</div>
              <div className="mt-2 text-sm text-muted-foreground">Project does not exist.</div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6">
              <div className="space-y-6">
                <div className="rounded-[28px] border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur overflow-hidden">
                  <div className="p-5 md:p-6 border-b bg-background/60 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Project</div>
                      <div className="mt-1 text-2xl font-bold tracking-tight">Basics</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Update slug, featured status, and cover image.
                      </div>
                    </div>

                    <Button
                      onClick={() => void saveBasics()}
                      disabled={upd.isPending}
                      className="rounded-2xl h-11 px-4 font-semibold bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {upd.isPending ? "Saving…" : "Save"}
                    </Button>
                  </div>

                  <div className="p-5 md:p-6 space-y-4">
                    {featuredCount >= 4 && !((q.data as any).project.isFeatured) ? (
                      <div className="rounded-2xl border border-[hsl(var(--tri-saffron))]/35 bg-[hsl(var(--tri-saffron))]/10 p-4 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-2xl border bg-background grid place-items-center">
                            <AlertTriangle className="h-5 w-5 text-[hsl(var(--tri-saffron))]" />
                          </div>
                          <div>
                            <div className="font-bold">Featured cap active</div>
                            <div className="text-muted-foreground">
                              Already {featuredCount}/4 featured projects. You can still edit content, but cannot newly feature this project until one is unfeatured.
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Slug</div>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border bg-background/70 p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl border bg-card grid place-items-center">
                          <Star className={cn("h-5 w-5", isFeatured ? "text-[hsl(var(--tri-saffron))]" : "text-muted-foreground")} />
                        </div>
                        <div>
                          <div className="text-sm font-bold">Featured</div>
                          <div className="text-xs text-muted-foreground">Appears on the home page.</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={isFeatured}
                        onCheckedChange={(v) => setIsFeatured(Boolean(v))}
                        disabled={featuredCount >= 4 && !((q.data as any).project.isFeatured)}
                      />
                    </div>
                  </div>

                  <div className="p-5 md:p-6 pt-0">
                    <CoverImageField value={cover} onChange={setCover} label="Cover image" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <TranslationTabs
                  activeLang={activeLang}
                  onChangeLang={setActiveLang}
                  headerRight={
                    <Button
                      onClick={() => void saveTranslation(activeLang)}
                      disabled={upsertTr.isPending}
                      className="rounded-2xl h-11 px-4 font-semibold bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-primary to-[hsl(var(--tri-green))] text-primary-foreground shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {upsertTr.isPending ? "Saving…" : "Save translation"}
                    </Button>
                  }
                  render={(l) => (
                    <div className="space-y-4">
                      <div className="rounded-3xl border bg-card shadow-[var(--shadow-md)] p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground">Title</div>
                            <Input
                              value={forms[l].title}
                              onChange={(e) => setForms((p) => ({ ...p, [l]: { ...p[l], title: e.target.value } }))}
                              className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground">Status</div>
                            <div className="mt-1 flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setForms((p) => ({ ...p, [l]: { ...p[l], status: "draft" } }))}
                                className={cn("h-12 rounded-2xl border-border/70 bg-background/70 hover:bg-muted/70 transition-all flex-1",
                                  forms[l].status === "draft" ? "border-primary/35 bg-primary/5" : ""
                                )}
                              >
                                Draft
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setForms((p) => ({ ...p, [l]: { ...p[l], status: "published" } }))}
                                className={cn("h-12 rounded-2xl border-border/70 bg-background/70 hover:bg-muted/70 transition-all flex-1",
                                  forms[l].status === "published" ? "border-primary/35 bg-primary/5" : ""
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
                            value={forms[l].summary}
                            onChange={(e) => setForms((p) => ({ ...p, [l]: { ...p[l], summary: e.target.value } }))}
                            className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                          />
                        </div>
                      </div>

                      <RichTextEditor
                        value={forms[l].contentHtml}
                        onChange={(html) => setForms((p) => ({ ...p, [l]: { ...p[l], contentHtml: html } }))}
                      />

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => void saveTranslation(l)}
                          disabled={upsertTr.isPending}
                          className="rounded-2xl h-11 px-4 font-semibold bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_18px_42px_hsl(var(--primary)/0.20)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.26)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save {l.toUpperCase()}
                        </Button>

                        <Link
                          href={`/projects/${id}`}
                          className="inline-flex items-center justify-center rounded-2xl h-11 px-4 font-semibold border bg-background hover:bg-muted/70 hover:shadow-[var(--shadow-sm)] transition-all"
                        >
                          Preview public
                        </Link>
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
