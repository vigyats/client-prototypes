import { useMemo, useState } from "react";
import { AdminShell } from "@/components/Shell";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useCreateEvent, useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import { translateContent } from "@/lib/translate";
import { CoverImageField } from "@/components/CoverImageField";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ArrowUpRight, CalendarDays, Languages } from "lucide-react";
import { Link } from "wouter";

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

  const [slug, setSlug] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [registrationStartDate, setRegistrationStartDate] = useState<string>("");
  const [registrationEndDate, setRegistrationEndDate] = useState<string>("");
  const [cover, setCover] = useState<string | null>(null);
  const [flyer, setFlyer] = useState<string | null>(null);
  const [registrationFormUrl, setRegistrationFormUrl] = useState("");
  const [eventPrice, setEventPrice] = useState("");
  const [participationType, setParticipationType] = useState("");
  const [sourceLang, setSourceLang] = useState<Lang>("en");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [requirements, setRequirements] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isTranslating, setIsTranslating] = useState(false);

  function reset() {
    setSlug("");
    setStartDate("");
    setEndDate("");
    setRegistrationStartDate("");
    setRegistrationEndDate("");
    setCover(null);
    setFlyer(null);
    setRegistrationFormUrl("");
    setEventPrice("");
    setParticipationType("");
    setSourceLang("en");
    setTitle("");
    setLocation("");
    setSummary("");
    setIntroduction("");
    setRequirements("");
    setContentHtml("");
    setStatus("draft");
  }

  async function handleCreate() {
    if (!slug.trim()) {
      toast({ title: "Slug required", description: "Please add a unique slug.", variant: "destructive" });
      return;
    }
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please add event title.", variant: "destructive" });
      return;
    }

    setIsTranslating(true);
    toast({ title: "Translating...", description: "Auto-translating to other languages. Please wait.", variant: "default" });

    try {
      const allLangs: Lang[] = ["en", "hi", "mr"];
      const targetLangs = allLangs.filter(l => l !== sourceLang);

      // Combine all text for translation
      const combinedText = `${summary}\n\n${introduction}\n\n${requirements}`;
      
      const translatedContent = await translateContent(
        title.trim(),
        location.trim(),
        combinedText,
        sourceLang,
        targetLangs
      );

      const translations = allLangs.map(lang => ({
        language: lang,
        status,
        title: translatedContent[lang].title,
        location: translatedContent[lang].summary || null,
        summary: summary.trim() || null,
        introduction: introduction.trim() || null,
        requirements: requirements.trim() || null,
        contentHtml: translatedContent[lang].contentHtml,
      }));

      await create.mutateAsync({
        slug: slug.trim(),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        registrationStartDate: registrationStartDate ? new Date(registrationStartDate).toISOString() : null,
        registrationEndDate: registrationEndDate ? new Date(registrationEndDate).toISOString() : null,
        coverImagePath: cover,
        flyerImagePath: flyer,
        registrationFormUrl: registrationFormUrl.trim() || null,
        eventPrice: eventPrice.trim() || null,
        participationType: participationType.trim() || null,
        translations,
      });
      
      toast({ title: "Event created", description: "Content has been auto-translated to all languages!", variant: "default" });
      setCreateOpen(false);
      reset();
    } catch (e) {
      toast({ title: "Create failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="animate-fadeUp">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground">Admin • Events</div>
              <h1 className="mt-1 text-3xl font-bold">Events</h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Create events with registration, pricing, and detailed information.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/events" className="text-sm font-semibold text-primary hover:underline">
                View public <ArrowUpRight className="inline h-4 w-4" />
              </Link>

              <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) reset(); }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setCreateOpen(true)} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    New event
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-6">
                  <DialogHeader>
                    <DialogTitle>Create event</DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Images */}
                    <div className="space-y-4">
                      <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm font-bold mb-4">Event Images</div>
                        <div className="space-y-4">
                          <CoverImageField value={flyer} onChange={setFlyer} label="Event Flyer" />
                          <CoverImageField value={cover} onChange={setCover} label="Cover Image (optional)" />
                        </div>
                      </div>

                      <div className="rounded-lg border bg-card p-4 space-y-4">
                        <div className="text-sm font-bold">Basic Information</div>
                        
                        <div>
                          <label className="text-sm font-medium block mb-2">Slug *</label>
                          <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. national-consultation-2026"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Event Price (₹)</label>
                          <Input
                            value={eventPrice}
                            onChange={(e) => setEventPrice(e.target.value)}
                            placeholder="e.g. Free, 500, 1000"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter amount in rupees or "Free"
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Participation Type (optional)</label>
                          <Input
                            value={participationType}
                            onChange={(e) => setParticipationType(e.target.value)}
                            placeholder="e.g. Team, Individual, Both"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Registration Form URL (optional)</label>
                          <Input
                            value={registrationFormUrl}
                            onChange={(e) => setRegistrationFormUrl(e.target.value)}
                            placeholder="https://forms.google.com/..."
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            If provided, a "Register" button will appear on the event page
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border bg-card p-4 space-y-4">
                        <div className="text-sm font-bold">Dates (all optional)</div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium block mb-2">Registration Start</label>
                            <Input
                              type="datetime-local"
                              value={registrationStartDate}
                              onChange={(e) => setRegistrationStartDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2">Registration End</label>
                            <Input
                              type="datetime-local"
                              value={registrationEndDate}
                              onChange={(e) => setRegistrationEndDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium block mb-2">Event Start</label>
                            <Input
                              type="datetime-local"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2">Event End</label>
                            <Input
                              type="datetime-local"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="rounded-lg border bg-muted/50 p-3 flex items-center gap-3">
                          <CalendarDays className="h-5 w-5" />
                          <div className="text-xs text-muted-foreground">
                            If registration is open, event will be pinned on home page
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="space-y-4">
                      <div className="rounded-lg border bg-card p-4 space-y-4">
                        <div className="text-sm font-bold">Content (Write in your preferred language)</div>

                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant={sourceLang === "en" ? "default" : "outline"}
                            onClick={() => setSourceLang("en")}
                            size="sm"
                          >
                            English
                          </Button>
                          <Button
                            type="button"
                            variant={sourceLang === "hi" ? "default" : "outline"}
                            onClick={() => setSourceLang("hi")}
                            size="sm"
                          >
                            Hindi
                          </Button>
                          <Button
                            type="button"
                            variant={sourceLang === "mr" ? "default" : "outline"}
                            onClick={() => setSourceLang("mr")}
                            size="sm"
                          >
                            Marathi
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant={status === "draft" ? "default" : "outline"}
                            onClick={() => setStatus("draft")}
                            size="sm"
                          >
                            Draft
                          </Button>
                          <Button
                            type="button"
                            variant={status === "published" ? "default" : "outline"}
                            onClick={() => setStatus("published")}
                            size="sm"
                          >
                            Published
                          </Button>
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Title *</label>
                          <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Event title"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Location (optional)</label>
                          <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, venue, or region"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Summary (optional)</label>
                          <Textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Brief overview of the event"
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Introduction (optional)</label>
                          <Textarea
                            value={introduction}
                            onChange={(e) => setIntroduction(e.target.value)}
                            placeholder="Detailed introduction about the event"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Requirements (optional)</label>
                          <Textarea
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            placeholder="Eligibility, prerequisites, what to bring, etc."
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Detailed Content (optional)</label>
                          <RichTextEditor
                            value={contentHtml}
                            onChange={setContentHtml}
                            placeholder="Write the event details: agenda, highlights, schedule..."
                          />
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          Content will be automatically translated to all languages.
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => void handleCreate()}
                    disabled={create.isPending || isTranslating}
                    variant="outline"
                    className="w-full h-11 mt-4"
                  >
                    {isTranslating ? "Translating..." : create.isPending ? "Creating…" : "Create Event"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-6 rounded-lg border bg-card shadow-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">All events</div>
                <div className="text-xs text-muted-foreground">Click an event to view or edit details.</div>
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
                  <div className="text-lg font-bold">No events yet</div>
                  <div className="mt-2 text-sm text-muted-foreground">Create your first event to populate the timeline.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {items.map((it) => (
                    <Link key={it.event.id} href={`/events/${it.event.id}`}>
                      <div className="rounded-lg border bg-card p-4 hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-semibold">{it.translations[0]?.title || "Untitled"}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">slug:</span>
                              <span className="text-xs font-semibold">{it.event.slug}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/events/${it.event.id}`}
                              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Link>
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
