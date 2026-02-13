import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { AdminShell } from "@/components/Shell";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useEvent, useUpdateEvent, useUpsertEventTranslation } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import { CoverImageField } from "@/components/CoverImageField";
import { TranslationTabs } from "@/components/TranslationTabs";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";

type TrForm = {
  language: Lang;
  status: "draft" | "published";
  title: string;
  location: string;
  contentHtml: string;
};

function pickExisting(trs: any[], lang: Lang) {
  const exact = trs.find((t) => t.language === lang);
  const en = trs.find((t) => t.language === "en");
  return exact || en || trs[0] || null;
}

export default function AdminEventEditPage() {
  const params = useParams() as { id?: string };
  const id = Number(params.id);
  const { lang } = useI18n();
  const { toast } = useToast();

  const q = useEvent(id, { lang });
  const upd = useUpdateEvent();
  const upsertTr = useUpsertEventTranslation();

  const [slug, setSlug] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [cover, setCover] = useState<string | null>(null);

  const [activeLang, setActiveLang] = useState<Lang>("en");
  const [forms, setForms] = useState<Record<Lang, TrForm>>({
    en: { language: "en", status: "draft", title: "", location: "", contentHtml: "" },
    hi: { language: "hi", status: "draft", title: "", location: "", contentHtml: "" },
    mr: { language: "mr", status: "draft", title: "", location: "", contentHtml: "" },
  });

  useEffect(() => {
    const data: any = q.data;
    if (!data?.event) return;
    setSlug(data.event.slug || "");
    setCover(data.event.coverImagePath ?? null);

    setStartDate(data.event.startDate ? new Date(data.event.startDate as any).toISOString().slice(0, 16) : "");
    setEndDate(data.event.endDate ? new Date(data.event.endDate as any).toISOString().slice(0, 16) : "");

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
            location: ex.location || "",
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
    try {
      await upd.mutateAsync({
        id,
        updates: {
          slug: slug.trim(),
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          coverImagePath: cover,
        },
      });
      toast({ title: "Saved", description: "Event basics updated.", variant: "default" });
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
          location: f.location.trim() ? f.location.trim() : null,
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
            <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Link>
            <Link href={`/events/${id}`} className="text-sm font-semibold text-primary hover:underline">
              View public
            </Link>
          </div>

          {q.isLoading ? (
            <div className="mt-6 rounded-3xl border bg-card/50 p-6 shimmer" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--card)) 30%, hsl(var(--muted)) 60%)" }} />
          ) : q.isError ? (
            <div className="mt-6 rounded-3xl border bg-card p-6 shadow-[var(--shadow-md)]">
              <div className="text-sm font-bold">Could not load event</div>
              <div className="mt-1 text-sm text-muted-foreground">{(q.error as Error).message}</div>
            </div>
          ) : !(q.data as any)?.event ? (
            <div className="mt-6 rounded-3xl border bg-card p-8 shadow-[var(--shadow-md)]">
              <div className="text-lg font-bold">Not found</div>
              <div className="mt-2 text-sm text-muted-foreground">Event does not exist.</div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6">
              <div className="space-y-6">
                <div className="rounded-[28px] border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur overflow-hidden">
                  <div className="p-5 md:p-6 border-b bg-background/60 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Event</div>
                      <div className="mt-1 text-2xl font-bold tracking-tight">Basics</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Update slug, date range, and cover image.
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
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Slug</div>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground">Start date</div>
                        <Input
                          type="datetime-local"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground">End date</div>
                        <Input
                          type="datetime-local"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                        />
                      </div>
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
                          <div className="text-xs font-semibold text-muted-foreground">Location (optional)</div>
                          <Input
                            value={forms[l].location}
                            onChange={(e) => setForms((p) => ({ ...p, [l]: { ...p[l], location: e.target.value } }))}
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
                          href={`/events/${id}`}
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
