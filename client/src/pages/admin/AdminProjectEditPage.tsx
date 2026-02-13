import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { AdminShell } from "@/components/Shell";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useProject, useUpdateProject, useUpsertProjectTranslation, useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { translateContent } from "@/lib/translate";
import { CoverImageField } from "@/components/CoverImageField";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ArrowLeft, Save, Star, AlertTriangle, Languages } from "lucide-react";

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
  const [youtubeUrl, setYoutubeUrl] = useState("");
  
  const [sourceLang, setSourceLang] = useState<Lang>("en");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const data: any = q.data;
    if (!data?.project) return;
    setSlug(data.project.slug || "");
    setIsFeatured(Boolean(data.project.isFeatured));
    setCover(data.project.coverImagePath ?? null);
    setYoutubeUrl(data.project.youtubeUrl || "");

    const trs = data.translations || [];
    const enTr = trs.find((t: any) => t.language === "en") || trs[0];
    if (enTr) {
      setSourceLang(enTr.language);
      setTitle(enTr.title || "");
      setSummary(enTr.summary || "");
      setContentHtml(enTr.contentHtml || "");
      setStatus(enTr.status || "draft");
    }
  }, [q.data]);

  async function saveBasics() {
    if (!slug.trim()) {
      toast({ title: "Slug required", description: "Please add a slug.", variant: "destructive" });
      return;
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
          youtubeUrl: youtubeUrl.trim() || null,
        },
      });
      toast({ title: "Saved", description: "Project basics updated.", variant: "default" });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function saveTranslations() {
    if (!title.trim() || !contentHtml.trim()) {
      toast({ title: "Title + content required", description: "Please add title and content.", variant: "destructive" });
      return;
    }

    setIsTranslating(true);
    toast({ title: "Translating...", description: "Auto-translating to other languages. Please wait.", variant: "default" });

    try {
      const allLangs: Lang[] = ["en", "hi", "mr"];
      const targetLangs = allLangs.filter(l => l !== sourceLang);

      const translatedContent = await translateContent(
        title.trim(),
        summary.trim(),
        contentHtml,
        sourceLang,
        targetLangs
      );

      for (const lang of allLangs) {
        await upsertTr.mutateAsync({
          id,
          lang,
          input: {
            language: lang,
            status,
            title: translatedContent[lang].title,
            summary: translatedContent[lang].summary || null,
            contentHtml: translatedContent[lang].contentHtml,
          },
        });
      }

      toast({ title: "Saved", description: "Content has been auto-translated to all languages!", variant: "default" });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="animate-fadeUp pb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
            <Link href={`/projects/${id}`} className="text-sm font-semibold text-primary hover:underline">
              View public
            </Link>
          </div>

          {q.isLoading ? (
            <div className="rounded-lg border bg-card/50 p-6 animate-pulse" />
          ) : q.isError ? (
            <div className="rounded-lg border bg-card p-6 shadow-lg">
              <div className="text-sm font-bold">Could not load project</div>
              <div className="mt-1 text-sm text-muted-foreground">{(q.error as Error).message}</div>
            </div>
          ) : !(q.data as any)?.project ? (
            <div className="rounded-lg border bg-card p-8 shadow-lg">
              <div className="text-lg font-bold">Not found</div>
              <div className="mt-2 text-sm text-muted-foreground">Project does not exist.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
              <div className="space-y-6">
                <div className="rounded-lg border bg-card shadow-lg overflow-hidden">
                  <div className="p-5 border-b bg-muted/30">
                    <div className="text-xs font-semibold text-muted-foreground">Project</div>
                    <div className="mt-1 text-xl font-bold">Basics</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Update slug, featured status, cover, and YouTube URL.
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {featuredCount >= 4 && !((q.data as any).project.isFeatured) && (
                      <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-bold">Featured cap active</div>
                            <div className="text-muted-foreground">
                              Already {featuredCount}/4 featured projects. Unfeature one to feature this.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium block mb-2">Slug</label>
                      <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">YouTube URL (optional)</label>
                      <Input
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Star className={cn("h-5 w-5 flex-shrink-0", isFeatured ? "text-yellow-500" : "text-muted-foreground")} />
                        <div className="min-w-0">
                          <div className="text-sm font-bold">Featured</div>
                          <div className="text-xs text-muted-foreground">Appears on the home page.</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={isFeatured}
                        onCheckedChange={(v) => setIsFeatured(Boolean(v))}
                        disabled={featuredCount >= 4 && !((q.data as any).project.isFeatured)}
                        className="flex-shrink-0"
                      />
                    </div>

                    <CoverImageField value={cover} onChange={setCover} label="Cover image" />

                    <Button
                      onClick={() => void saveBasics()}
                      disabled={upd.isPending}
                      variant="outline"
                      className="w-full h-11"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {upd.isPending ? "Saving…" : "Save Basics"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border bg-card shadow-lg overflow-hidden">
                  <div className="p-5 border-b bg-muted/30">
                    <div className="text-xs font-semibold text-muted-foreground">Project</div>
                    <div className="mt-1 text-xl font-bold">Content</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Edit in your preferred language. Auto-translates to all languages.
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium block mb-2">Language</label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={sourceLang === "en" ? "default" : "outline"}
                            onClick={() => setSourceLang("en")}
                            className="flex-1 h-9"
                            size="sm"
                          >
                            EN
                          </Button>
                          <Button
                            type="button"
                            variant={sourceLang === "hi" ? "default" : "outline"}
                            onClick={() => setSourceLang("hi")}
                            className="flex-1 h-9"
                            size="sm"
                          >
                            HI
                          </Button>
                          <Button
                            type="button"
                            variant={sourceLang === "mr" ? "default" : "outline"}
                            onClick={() => setSourceLang("mr")}
                            className="flex-1 h-9"
                            size="sm"
                          >
                            MR
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">Status</label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={status === "draft" ? "default" : "outline"}
                            onClick={() => setStatus("draft")}
                            className="flex-1 h-9"
                            size="sm"
                          >
                            Draft
                          </Button>
                          <Button
                            type="button"
                            variant={status === "published" ? "default" : "outline"}
                            onClick={() => setStatus("published")}
                            className="flex-1 h-9"
                            size="sm"
                          >
                            Published
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Title</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Project title"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Summary (optional)</label>
                      <Input
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="One-line highlight for cards"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Content</label>
                      <RichTextEditor
                        value={contentHtml}
                        onChange={setContentHtml}
                        placeholder="Write your content here..."
                      />
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Languages className="h-4 w-4 flex-shrink-0" />
                      <span>Content will be automatically translated to all languages (English, Hindi, Marathi).</span>
                    </div>

                    <Button
                      onClick={() => void saveTranslations()}
                      disabled={upsertTr.isPending || isTranslating}
                      variant="outline"
                      className="w-full h-11"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isTranslating ? "Translating..." : upsertTr.isPending ? "Saving…" : "Save Content"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
