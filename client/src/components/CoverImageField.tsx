import { useMemo, useState } from "react";
import { ImagePlus, X, ExternalLink, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRequestUploadUrl, uploadToPresignedUrl } from "@/hooks/use-uploads";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";

export function CoverImageField({
  value,
  onChange,
  label = "Cover image",
}: {
  value?: string | null;
  onChange: (next: string | null) => void;
  label?: string;
}) {
  const { toast } = useToast();
  const requestUrl = useRequestUploadUrl();
  const [busy, setBusy] = useState(false);

  const pretty = useMemo(() => (value ? value : ""), [value]);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const resp = await requestUrl.mutateAsync({
        name: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
      });
      await uploadToPresignedUrl(file, resp.uploadURL);
      onChange(resp.objectPath);
      toast({ title: "Cover uploaded", description: "Image stored successfully.", variant: "default" });
    } catch (e) {
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border bg-card shadow-[var(--shadow-md)] overflow-hidden">
      <div className="p-4 border-b bg-background/60 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold">{label}</div>
          <div className="text-xs text-muted-foreground">Upload to object storage. Stored as coverImagePath.</div>
        </div>

        <div className="flex items-center gap-2">
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={12 * 1024 * 1024}
            onGetUploadParameters={async (uppyFile) => {
              const resp = await requestUrl.mutateAsync({
                name: uppyFile.name,
                size: uppyFile.size,
                contentType: (uppyFile.type as string) || "application/octet-stream",
              });
              return {
                method: "PUT",
                url: resp.uploadURL,
                headers: { "Content-Type": (uppyFile.type as string) || "application/octet-stream" },
              };
            }}
            onComplete={(result) => {
              const uploaded = result.successful?.[0];
              const objectPath = (uploaded?.response as any)?.body?.objectPath;
              // If backend doesn't echo objectPath in uppy response, we rely on request-url response in custom flow.
              // Here we simply toast; admin UI also supports manual upload below.
              if (objectPath) onChange(objectPath);
            }}
            buttonClassName={cn(
              "rounded-2xl h-10 px-3 font-semibold",
              "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_14px_30px_hsl(var(--primary)/0.18)]",
              "hover:shadow-[0_18px_40px_hsl(var(--primary)/0.22)] hover:-translate-y-[1px] active:translate-y-0 transition-all",
            )}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload
          </ObjectUploader>

          <Button
            type="button"
            variant="outline"
            onClick={() => onChange(null)}
            className="h-10 rounded-2xl border-border/70 bg-card/50 hover:bg-card hover:shadow-[var(--shadow-sm)] transition-all"
            disabled={!value}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
          <div className="relative overflow-hidden rounded-2xl border bg-muted">
            {value ? (
              <img src={value} alt="Cover preview" className="h-44 w-full object-cover" />
            ) : (
              <div className="h-44 w-full grid place-items-center bg-gradient-to-br from-[hsl(var(--tri-saffron))]/18 via-background to-[hsl(var(--tri-green))]/14">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-2xl border bg-background grid place-items-center shadow-[var(--shadow-sm)]">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="mt-3 text-sm font-semibold">No cover yet</div>
                  <div className="text-xs text-muted-foreground">Upload an image to enhance the card.</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border bg-background p-3">
              <div className="text-xs font-semibold text-muted-foreground">Stored path / URL</div>
              <div className="mt-1 text-sm font-semibold break-all">{pretty || "—"}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Upload cover</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                    e.currentTarget.value = "";
                  }}
                  className={cn(
                    "block w-full cursor-pointer rounded-2xl border border-border/70 bg-card/50 px-3 py-2.5 text-xs sm:text-sm font-semibold text-transparent",
                    "file:mr-2 sm:file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-2 sm:file:px-3 file:py-1.5 sm:file:py-2 file:text-xs sm:file:text-sm file:font-semibold file:text-primary-foreground",
                    "hover:bg-card hover:shadow-[var(--shadow-sm)] transition-all",
                    "focus:outline-none focus:ring-4 focus:ring-ring/20",
                  )}
                />
              </label>

              {value ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(value, "_blank")}
                  className="rounded-2xl h-12 border-border/70 bg-card/50 hover:bg-card hover:shadow-[var(--shadow-sm)] transition-all"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </Button>
              ) : null}
            </div>

            {busy ? (
              <div className="rounded-2xl border bg-muted/40 p-3 text-sm text-muted-foreground">
                Uploading… please keep this tab open.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
