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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";

type TrForm = {
  language: Lang;
  status: "draft" | "published";
  title: string;
  location: string;
  summary: string;
  introduction: string;
  requirements: string;
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
  const [registrationStartDate, setRegistrationStartDate] = useState<string>("");
  const [registrationEndDate, setRegistrationEndDate] = useState<string>("");
  const [cover, setCover] = useState<string | null>(null);
  const [flyer, setFlyer] = useState<string | null>(null);
  const [registrationFormUrl, setRegistrationFormUrl] = useState("");
  const [eventPrice, setEventPrice] = useState("");
  const [participationType, setParticipationType] = useState("");

  const [activeLang, setActiveLang] = useState<Lang>("en");
  const [forms, setForms] = useState<Record<Lang, TrForm>>({
    en: { language: "en", status: "draft", title: "", location: "", summary: "", introduction: "", requirements: "", contentHtml: "" },
    hi: { language: "hi", status: "draft", title: "", location: "", summary: "", introduction: "", requirements: "", contentHtml: "" },
    mr: { language: "mr", status: "draft", title: "", location: "", summary: "", introduction: "", requirements: "", contentHtml: "" },
  });

  useEffect(() => {
    const data: any = q.data;
    if (!data?.event) return;
    setSlug(data.event.slug || "");
    setCover(data.event.coverImagePath ?? null);
    setFlyer(data.event.flyerImagePath ?? null);
    setRegistrationFormUrl(data.event.registrationFormUrl || "");
    setEventPrice(data.event.eventPrice || "");
    setParticipationType(data.event.participationType || "");

    setStartDate(data.event.startDate ? new Date(data.event.startDate as any).toISOString().slice(0, 16) : "");
    setEndDate(data.event.endDate ? new Date(data.event.endDate as any).toISOString().slice(0, 16) : "");
    setRegistrationStartDate(data.event.registrationStartDate ? new Date(data.event.registrationStartDate as any).toISOString().slice(0, 16) : "");
    setRegistrationEndDate(data.event.registrationEndDate ? new Date(data.event.registrationEndDate as any).toISOString().slice(0, 16) : "");

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
            summary: ex.summary || "",
            introduction: ex.introduction || "",
            requirements: ex.requirements || "",
            contentHtml: ex.contentHtml || "",
          },
        }));
      }
    });
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
          registrationStartDate: registrationStartDate ? new Date(registrationStartDate).toISOString() : null,
          registrationEndDate: registrationEndDate ? new Date(registrationEndDate).toISOString() : null,
          coverImagePath: cover,
          flyerImagePath: flyer,
          registrationFormUrl: registrationFormUrl.trim() || null,
          eventPrice: eventPrice.trim() || null,
          participationType: participationType.trim() || null,
        },
      });
      toast({ title: "Saved", description: "Event basics updated.", variant: "default" });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function saveTranslation(l: Lang) {
    const f = forms[l];
    if (!f.title.trim()) {
      toast({ title: "Title required", description: "Please add title.", variant: "destructive" });
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
          location: f.location.trim() || null,
          summary: f.summary.trim() || null,
          introduction: f.introduction.trim() || null,
          requirements: f.requirements.trim() || null,
          contentHtml: f.contentHtml || "",
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
        <div className="animate-fadeUp pb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Link>
            <Link href={`/events/${id}`} className="text-sm font-semibold text-primary hover:underline">
              View public
            </Link>
          </div>

          {q.isLoading ? (
            <div className="rounded-lg border bg-muted/50 p-6 animate-pulse" />
          ) : q.isError ? (
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-bold">Could not load event</div>
              <div className="mt-1 text-sm text-muted-foreground">{(q.error as Error).message}</div>
            </div>
          ) : !(q.data as any)?.event ? (
            <div className="rounded-lg border bg-card p-8">
              <div className="text-lg font-bold">Not found</div>
              <div className="mt-2 text-sm text-muted-foreground">Event does not exist.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="rounded-lg border bg-card shadow-lg overflow-hidden">
                  <div className="p-5 border-b flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Event</div>
                      <div className="mt-1 text-2xl font-bold">Basics</div>
                    </div>
                    <Button onClick={() => void saveBasics()} disabled={upd.isPending} variant="outline" className="flex-shrink-0">
                      <Save className="mr-2 h-4 w-4" />
                      {upd.isPending ? "Saving…" : "Save"}
                    </Button>
                  </div>

                  <div className="p-5 space-y-5">
                    <div>
                      <label className="text-sm font-medium block mb-2">Slug *</label>
                      <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Event Price (₹)</label>
                      <Input value={eventPrice} onChange={(e) => setEventPrice(e.target.value)} placeholder="Free, 500, 1000" />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Participation Type</label>
                      <Input value={participationType} onChange={(e) => setParticipationType(e.target.value)} placeholder="Team, Individual, Both" />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Registration Form URL</label>
                      <Input value={registrationFormUrl} onChange={(e) => setRegistrationFormUrl(e.target.value)} placeholder="https://forms.google.com/..." />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium block mb-2">Registration Start</label>
                        <Input type="datetime-local" value={registrationStartDate} onChange={(e) => setRegistrationStartDate(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">Registration End</label>
                        <Input type="datetime-local" value={registrationEndDate} onChange={(e) => setRegistrationEndDate(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium block mb-2">Event Start</label>
                        <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">Event End</label>
                        <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </div>

                    <CoverImageField value={flyer} onChange={setFlyer} label="Event Flyer" />
                    <CoverImageField value={cover} onChange={setCover} label="Cover Image" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <TranslationTabs
                  activeLang={activeLang}
                  onChangeLang={setActiveLang}
                  headerRight={
                    <Button onClick={() => void saveTranslation(activeLang)} disabled={upsertTr.isPending} variant="outline" className="flex-shrink-0">
                      <Save className="mr-2 h-4 w-4" />
                      {upsertTr.isPending ? "Saving…" : "Save"}
                    </Button>
                  }
                  render={(l) => (
                    <div className="space-y-5">
                      <div className="rounded-lg border bg-card p-5 space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium block mb-2">Title *</label>
                            <Input value={forms[l].title} onChange={(e) => setForms((p) => ({ ...p, [l]: { ...p[l], title: e.target.value } }))} />
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2">Status</label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={forms[l].status === "draft" ? "default" : "outline"}
                                onClick={() => setForms((p) => ({ ...p, [l]: { ...p[l], status: "draft" } }))}
                                className="flex-1 h-9"
                                size="sm"
                              >
                                Draft
                              </Button>
                              <Button
                                type="button"
                                variant={forms[l].status === "published" ? "default" : "outline"}
                                onClick={() => setForms((p) => ({ ...p, [l]: { ...p[l], status: "published" } }))}
                                className="flex-1 h-9"
                                size="sm"
                              >
                                Published
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Location</label>
                          <Input value={forms[l].location} onChange={(e) => setForms((p) => ({ ...p, [l]: { ...p[l], location: e.target.value } }))} />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Summary</label>
                          <Textarea value={forms[l].summary} onChange={(e) => setForms((p) => ({ ...p, [l]: { ...p[l], summary: e.target.value } }))} rows={2} />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Introduction</label>
                          <Textarea value={forms[l].introduction} onChange={(e) => setForms((p) => ({ ...p, [l]: { ...p[l], introduction: e.target.value } }))} rows={3} />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Requirements</label>
                          <Textarea value={forms[l].requirements} onChange={(e) => setForms((p) => ({ ...p, [l]: { ...p[l], requirements: e.target.value } }))} rows={3} />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">Detailed Content</label>
                        <RichTextEditor value={forms[l].contentHtml} onChange={(html) => setForms((p) => ({ ...p, [l]: { ...p[l], contentHtml: html } }))} />
                      </div>

                      <Button onClick={() => void saveTranslation(l)} disabled={upsertTr.isPending} variant="outline" className="w-full h-11">
                        <Save className="mr-2 h-4 w-4" />
                        Save {l.toUpperCase()}
                      </Button>
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
