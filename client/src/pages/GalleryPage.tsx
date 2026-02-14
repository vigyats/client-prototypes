import { Shell } from "@/components/Shell";
import { useI18n } from "@/hooks/use-i18n";
import { useProjects } from "@/hooks/use-projects";
import { useEvents } from "@/hooks/use-events";
import { useMemo, useState } from "react";
import { Image as ImageIcon, Calendar } from "lucide-react";

type GalleryImage = {
  url: string;
  title: string;
  type: "project" | "event";
  date: Date;
};

export default function GalleryPage() {
  const { lang, t } = useI18n();
  const { data: projects } = useProjects({ lang });
  const { data: events } = useEvents({ lang });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const groupedImages = useMemo(() => {
    const images: GalleryImage[] = [];

    // Collect project images
    projects?.forEach((item) => {
      if (item.project.coverImagePath) {
        const translation = item.translations.find((t) => t.language === lang) || item.translations[0];
        images.push({
          url: item.project.coverImagePath,
          title: translation?.title || "Untitled Project",
          type: "project",
          date: new Date(item.project.createdAt),
        });
      }
    });

    // Collect event images
    events?.forEach((item) => {
      if (item.event.flyerImagePath) {
        const translation = item.translations.find((t) => t.language === lang) || item.translations[0];
        images.push({
          url: item.event.flyerImagePath,
          title: translation?.title || "Untitled Event",
          type: "event",
          date: new Date(item.event.createdAt),
        });
      }
    });

    // Sort by date descending
    images.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Group by date
    const grouped: Record<string, GalleryImage[]> = {};
    images.forEach((img) => {
      const dateKey = img.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(img);
    });

    return grouped;
  }, [projects, events, lang]);

  const totalImages = Object.values(groupedImages).flat().length;

  return (
    <Shell>
      <div className="animate-fadeUp space-y-8">
        {/* Header */}
        <div className="relative rounded-[32px] border-2 border-primary/15 bg-gradient-to-br from-card/90 to-background shadow-2xl overflow-hidden p-8 md:p-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[hsl(var(--tri-saffron))] to-[hsl(var(--tri-green))]" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.labels.gallery}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-foreground to-[hsl(var(--tri-green))] bg-clip-text text-transparent mb-3">
            {t.labels.gallery}
          </h1>
          <p className="text-lg text-muted-foreground">
            {totalImages} {totalImages === 1 ? "photo" : "photos"} from our projects and events
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))] flag-flow" />
        </div>

        {/* Gallery Content */}
        {totalImages === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-muted bg-card/50 p-16 text-center">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold text-muted-foreground mb-2">No Images Uploaded</h3>
            <p className="text-sm text-muted-foreground">
              Images from projects and events will appear here once uploaded.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedImages).map(([date, images]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-5 sticky top-20 z-10 bg-background/95 backdrop-blur-md py-3 px-4 rounded-2xl border border-primary/20 shadow-md">
                  <Calendar className="h-5 w-5 text-[hsl(var(--tri-navy))]" />
                  <h2 className="text-lg font-bold text-foreground">{date}</h2>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {images.length} {images.length === 1 ? "photo" : "photos"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={`${img.url}-${idx}`}
                      className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-lg"
                      onClick={() => setSelectedImage(img.url)}
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-semibold line-clamp-2">{img.title}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                            {img.type === "project" ? "Project" : "Event"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh]">
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
