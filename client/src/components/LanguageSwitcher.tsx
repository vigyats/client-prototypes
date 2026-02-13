import { Check, Languages } from "lucide-react";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const options: Array<{ value: Lang; label: string; native: string }> = [
  { value: "en", label: "English", native: "English" },
  { value: "hi", label: "Hindi", native: "हिन्दी" },
  { value: "mr", label: "Marathi", native: "मराठी" },
];

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "group relative overflow-hidden rounded-2xl border-border/70 bg-card/60 shadow-[var(--shadow-sm)] hover:bg-card hover:shadow-[var(--shadow-md)] transition-all",
            compact ? "h-10 px-3" : "h-11 px-4",
          )}
        >
          <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[hsl(var(--tri-saffron))] via-white to-[hsl(var(--tri-green))] opacity-70" />
          <Languages className="mr-2 h-4 w-4 text-primary group-hover:rotate-6 transition-transform" />
          <span className="text-sm font-semibold">{t.labels.language}</span>
          <span className="ml-2 rounded-lg border bg-background px-2 py-0.5 text-[11px] font-bold tracking-wide text-foreground/80">
            {lang.toUpperCase()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 rounded-2xl border-border/70 bg-popover/90 shadow-[var(--shadow-lg)] backdrop-blur">
        <div className="text-xs font-semibold text-muted-foreground">Select language</div>
        <div className="mt-2 space-y-1">
          {options.map((o) => {
            const active = o.value === lang;
            return (
              <button
                key={o.value}
                onClick={() => setLang(o.value)}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left transition-all duration-200",
                  "hover:bg-muted/70 focus:outline-none focus:ring-4 focus:ring-ring/20",
                  active ? "bg-muted text-foreground" : "text-foreground/90",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{o.native}</div>
                    <div className="text-xs text-muted-foreground">{o.label}</div>
                  </div>
                  <div className={cn("h-7 w-7 grid place-items-center rounded-lg border", active ? "bg-background" : "bg-transparent")}>
                    {active ? <Check className="h-4 w-4 text-[hsl(var(--tri-green))]" /> : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
