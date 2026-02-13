import { useMemo, useState } from "react";
import { AdminShell } from "@/components/Shell";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useCreateProject, useProjects, useUpdateProject } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { translateContent } from "@/lib/translate";
import { CoverImageField } from "@/components/CoverImageField";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Star, ArrowUpRight, AlertTriangle, Languages } from "lucide-react";
import { Link } from "wouter";

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

  const [slug, setSlug] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverImagePath, setCoverImagePath] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [sourceLang, setSourceLang] = useState<Lang>("en");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isTranslating, setIsTranslating] = useState(false);

  function resetCreate() {
    setSlug("");
    setIsFeatured(false);
    setCoverImagePath(null);
    setYoutubeUrl("");
    setSourceLang("en");
    setTitle("");
    setSummary("");
    setContentHtml("");
    setStatus("draft");
  }

  async function handleCreate() {
    if (!slug.trim()) {
      toast({ title: "Slug required", description: "Please add a unique slug.", variant: "destructive" });
      return;
    }
    if (!title.trim() || !contentHtml.trim()) {
      toast({ title: "Title and content required", description: "Please add title and content.", variant: "destructive" });
      return;
    }
    if (isFeatured && featuredCount >= 4) {
      toast({ title: "Featured limit reached", description: "You can feature at most 4 projects.", variant: "destructive" });
      return;
    }

    setIsTranslating(true);
    toast({ title: "Translating...", description: "Auto-translating to other languages. Please wait.", variant: "default" });

    try {
      // Get all target languages
      const allLangs: Lang[] = ["en", "hi", "mr"];
      const targetLangs = allLangs.filter(l => l !== sourceLang);

      // Auto-translate content
      const translatedContent = await translateContent(
        title.trim(),
        summary.trim(),
        contentHtml,
        sourceLang,
        targetLangs
      );

      // Build translations array for all languages
      const translations = allLangs.map(lang => ({
        language: lang,
        status,
        title: translatedContent[lang].title,
        summary: translatedContent[lang].summary || null,
        contentHtml: translatedContent[lang].contentHtml,
      }));

      await create.mutateAsync({
        slug: slug.trim(),
        isFeatured,
        coverImagePath,
        youtubeUrl: youtubeUrl.trim() || null,
        translations,
      });
      
      toast({ title: "Project created", description: "Content has been auto-translated to all languages!", variant: "default" });
      setCreateOpen(false);
      resetCreate();
    } catch (e) {
      const err = e as Error;
      if (isUnauthorizedError(err)) {
        toast({ title: "Unauthorized", description: "Redirecting to login…", variant: "destructive" });
        setTimeout(() => (window.location.href = "/admin/login"), 500);
        return;
      }
      toast({ title: "Create failed", description: err.message, variant: "destructive" });
    } finally {
      setIsTranslating(false);
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
              <h1 className="mt-1 text-3xl font-bold">Projects</h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Create projects, upload covers, and manage translations. Home page features are limited to 4.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/projects" className="text-sm font-semibold text-primary hover:underline">
                View public <ArrowUpRight className="inline h-4 w-4" />
              </Link>

              <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetCreate(); }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setCreateOpen(true)} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    New project
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create project</DialogTitle>
                  </DialogHeader>

                  {featuredCount >= 4 && (
                    <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 mt-0.5" />
                        <div>
                          <div className="font-bold">Featured limit reached</div>
                          <div className="text-muted-foreground">
                            You already have {featuredCount}/4 featured projects. You can still create projects, but cannot mark new ones as featured.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="rounded-lg border bg-card p-4 space-y-4">
                      <div className="text-sm font-bold">Basic Information</div>
                      
                      <div>
                        <label className="text-sm font-medium">Slug</label>
                        <Input
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="e.g. rural-health-outreach-2026"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">YouTube URL (optional)</label>
                        <Input
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                        <div className="flex items-center gap-3">
                          <Star className={cn("h-5 w-5", isFeatured ? "text-yellow-500" : "text-muted-foreground")} />
                          <div>
                            <div className="text-sm font-bold">Featured on Home</div>
                            <div className="text-xs text-muted-foreground">Max 4 featured projects.</div>
                          </div>
                        </div>
                        <Checkbox
                          checked={isFeatured}
                          onCheckedChange={(v) => setIsFeatured(Boolean(v))}
                          disabled={featuredCount >= 4}
                        />
                      </div>
                    </div>

                    <CoverImageField value={coverImagePath} onChange={setCoverImagePath} label="Cover image" />

                    <div className="rounded-lg border bg-card p-4 space-y-4">
                      <div className="text-sm font-bold">Content (Write in your preferred language)</div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium">Language</label>
                          <div className="mt-1 flex gap-2">
                            <Button
                              type="button"
                              variant={sourceLang === "en" ? "default" : "outline"}
                              onClick={() => setSourceLang("en")}
                              className="flex-1"
                            >
                              English
                            </Button>
                            <Button
                              type="button"
                              variant={sourceLang === "hi" ? "default" : "outline"}
                              onClick={() => setSourceLang("hi")}
                              className="flex-1"
                            >
                              Hindi
                            </Button>
                            <Button
                              type="button"
                              variant={sourceLang === "mr" ? "default" : "outline"}
                              onClick={() => setSourceLang("mr")}
                              className="flex-1"
                            >
                              Marathi
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <div className="mt-1 flex gap-2">
                            <Button
                              type="button"
                              variant={status === "draft" ? "default" : "outline"}
                              onClick={() => setStatus("draft")}
                              className="flex-1"
                            >
                              Draft
                            </Button>
                            <Button
                              type="button"
                              variant={status === "published" ? "default" : "outline"}
                              onClick={() => setStatus("published")}
                              className="flex-1"
                            >
                              Published
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Project title"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Summary (optional)</label>
                        <Input
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          placeholder="One-line highlight for cards"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Content</label>
                        <RichTextEditor
                          value={contentHtml}
                          onChange={setContentHtml}
                          placeholder="Write your content here..."
                        />
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Content will be automatically translated to all languages (English, Hindi, Marathi).
                      </div>
                    </div>

                    <Button
                      onClick={() => void handleCreate()}
                      disabled={create.isPending || isTranslating}
                      variant="outline"
                      className="w-full"
                    >
                      {isTranslating ? "Translating..." : create.isPending ? "Creating…" : "Create Project"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-6 rounded-lg border bg-card shadow-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">All projects</div>
                <div className="text-xs text-muted-foreground">
                  Featured: {featuredCount}/4 • Click a project to edit translations and content.
                </div>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                Showing language: <span className="text-foreground">{lang.toUpperCase()}</span>
              </div>
            </div>

            <div className="p-4">
              {list.isLoading ? (
                <div className="rounded-lg border bg-muted/50 p-6 animate-pulse" />
              ) : list.isError ? (
                <div className="rounded-lg border bg-card p-6">
                  <div className="text-sm font-bold">Failed to load</div>
                  <div className="mt-1 text-sm text-muted-foreground">{(list.error as Error).message}</div>
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-lg border bg-card p-8">
                  <div className="text-lg font-bold">No projects yet</div>
                  <div className="mt-2 text-sm text-muted-foreground">Create your first project to populate the home and projects pages.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {items.map((it) => (
                    <div key={it.project.id} className="rounded-lg border bg-card p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={it.project.isFeatured ? "default" : "secondary"}>
                              <Star className="h-3 w-3 mr-1" />
                              {it.project.isFeatured ? "Featured" : "Standard"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">slug:</span>
                            <span className="text-xs font-semibold">{it.project.slug}</span>
                          </div>

                          <div className="mt-2 text-xs text-muted-foreground">
                            Updated: {new Date(it.project.updatedAt as any).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void toggleFeatured(it.project.id, !it.project.isFeatured)}
                            disabled={update.isPending}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            {it.project.isFeatured ? "Unfeature" : "Feature"}
                          </Button>

                          <Link
                            href={`/admin/projects/${it.project.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent"
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
