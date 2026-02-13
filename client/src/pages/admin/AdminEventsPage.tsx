import { useMemo, useState } from "react";
import { AdminShell } from "@/components/Shell";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useCreateEvent, useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import { CoverImageField } from "@/components/CoverImageField";
import { TranslationTabs } from "@/components/TranslationTabs";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ArrowUpRight, CalendarDays } from "lucide-react";
import { Link } from "wouter";

type TrForm = {
  language: Lang;
  status: "draft" | "published";
  title: string;
  location: string;
  contentHtml: string;
};

function emptyTranslation(language: Lang): TrForm {
  return { language, status: "draft", title: "", location: "", contentHtml: "" };
}

export default function AdminEventsPage() {
  const { lang } = useI18n();
  const { toast } = useToast();
  const list = useEvents({ lang });
  const create = useCreateEvent();

  const [createOpen, setCreateOpen] = useState(false);

  const items = useMemo(() => {
    const l = list.data || [];
    return l.slice().sort((a, b) => new Date(b.event.updatedAt as any).getTime() - new Date(a.event.updatedAt as any).getTime());
  }, [list.data]);

  // Create state
  const [slug, setSlug] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [cover, setCover] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>("en");
  const [forms, setForms] = useState<Record<Lang, TrForm>>({
    en: emptyTranslation("en"),
    hi: emptyTranslation("hi"),
    mr: emptyTranslation("mr"),
  });

  function reset() {
    setSlug("");
    setStartDate("");
    setEndDate("");
    setCover(null);
    setActiveLang("en");
    setForms({ en: emptyTranslation("en"), hi: emptyTranslation("hi"), mr: emptyTranslation("mr") });
  }

  async function handleCreate() {
    const translations = (["en", "hi", "mr"] as Lang[])
      .map((l) => forms[l])
      .filter((x) => x.title.trim() && x.contentHtml.trim())
      .map((x) => ({
        language: x.language,
        status: x.status,
        title: x.title.trim(),
        location: x.location.trim() ? x.location.trim() : null,
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

    try {
      await create.mutateAsync({
        slug: slug.trim(),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        coverImagePath: cover,
        translations,
      });
      toast({ title: "Event created", description: "Saved successfully.", variant: "default" });
      setCreateOpen(false);
      reset();
    } catch (e) {
      toast({ title: "Create failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="animate-fadeUp">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground">Admin • Events</div>
              <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">Events</h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
                Create events with date ranges, cover images, and multilingual content.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/events" className="text-sm font-semibold text-primary hover:underline">
                View public <ArrowUpRight className="inline h-4 w-4" />
              </Link>

              <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) reset(); }}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setCreateOpen(true)}
                    className="rounded-2xl h-11 px-4 font-semibold bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New event
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-4xl rounded-3xl border-border/70 bg-popover/90 shadow-[var(--shadow-lg)] backdrop-blur">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Create event</DialogTitle>
                  </DialogHeader>

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
                              placeholder="e.g. national-consultation-2026"
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

                          <div className="rounded-2xl border bg-background/70 p-3 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl border bg-card grid place-items-center">
                              <CalendarDays className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Provide dates if known; otherwise leave blank for “TBD”.
                            </div>
                          </div>
                        </div>
                      </div>

                      <CoverImageField value={cover} onChange={setCover} label="Cover image" />
                    </div>

                    <TranslationTabs
                      activeLang={activeLang}
                      onChangeLang={setActiveLang}
                      headerRight={
                        <Button
                          onClick={() => void handleCreate()}
                          disabled={create.isPending}
                          className="rounded-2xl h-11 px-4 font-semibold bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-primary to-[hsl(var(--tri-green))] text-primary-foreground shadow-[0_18px_42px_hsl(var(--primary)/0.22)] hover:shadow-[0_22px_55px_hsl(var(--primary)/0.28)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                        >
                          {create.isPending ? "Creating…" : "Create"}
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
                                  placeholder="Event title"
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
                                placeholder="City, venue, or region"
                                className="mt-1 h-12 rounded-2xl border-border/70 bg-background/70 focus:ring-4 focus:ring-ring/20 transition-all"
                              />
                            </div>
                          </div>

                          <RichTextEditor
                            value={forms[l].contentHtml}
                            onChange={(html) => setForms((p) => ({ ...p, [l]: { ...p[l], contentHtml: html } }))}
                            placeholder="Write the event report: agenda, highlights, outcomes…"
                          />
                        </div>
                      )}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border bg-card/70 shadow-[var(--shadow-lg)] backdrop-blur overflow-hidden">
            <div className="p-4 md:p-5 border-b bg-background/60 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">All events</div>
                <div className="text-xs text-muted-foreground">Click an event to edit translations and details.</div>
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
                  <div className="text-lg font-bold">No events yet</div>
                  <div className="mt-2 text-sm text-muted-foreground">Create your first event to populate the timeline.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {items.map((it) => (
                    <div key={it.event.id} className="rounded-3xl border bg-background/70 shadow-[var(--shadow-sm)] p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-xs text-muted-foreground">slug</div>
                            <div className="text-xs font-semibold">{it.event.slug}</div>
                            <div className="text-xs text-muted-foreground">• updated</div>
                            <div className="text-xs font-semibold">{new Date(it.event.updatedAt as any).toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/events/${it.event.id}`}
                            className="inline-flex items-center justify-center rounded-2xl h-11 px-4 font-semibold bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_14px_30px_hsl(var(--primary)/0.18)] hover:shadow-[0_18px_40px_hsl(var(--primary)/0.22)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                          >
                            Edit <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Link>
                          <Link
                            href={`/events/${it.event.id}`}
                            className="inline-flex items-center justify-center rounded-2xl h-11 px-4 font-semibold border bg-background hover:bg-muted/70 hover:shadow-[var(--shadow-sm)] transition-all"
                          >
                            Preview
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
