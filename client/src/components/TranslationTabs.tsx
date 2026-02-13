import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Lang } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

const labels: Record<Lang, { short: string; native: string }> = {
  en: { short: "EN", native: "English" },
  hi: { short: "HI", native: "हिन्दी" },
  mr: { short: "MR", native: "मराठी" },
};

export function TranslationTabs({
  activeLang,
  onChangeLang,
  render,
  headerRight,
}: {
  activeLang: Lang;
  onChangeLang: (l: Lang) => void;
  render: (lang: Lang) => ReactNode;
  headerRight?: ReactNode;
}) {
  const langs: Lang[] = ["en", "hi", "mr"];

  return (
    <div className="rounded-3xl border bg-card shadow-[var(--shadow-lg)] overflow-hidden">
      <div className="p-4 border-b bg-background/60 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold">Translations</div>
          <div className="text-xs text-muted-foreground">
            Maintain EN/HI/MR variants. Publish per language independently.
          </div>
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>

      <div className="p-4 md:p-5">
        <Tabs value={activeLang} onValueChange={(v) => onChangeLang(v as Lang)}>
          <TabsList className={cn("grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1")}>
            {langs.map((l) => (
              <TabsTrigger
                key={l}
                value={l}
                className={cn(
                  "rounded-xl font-semibold",
                  "data-[state=active]:bg-background data-[state=active]:shadow-[var(--shadow-sm)]",
                )}
              >
                <span className="mr-2 inline-flex h-5 items-center rounded-md border bg-background px-1.5 text-[11px] font-bold">
                  {labels[l].short}
                </span>
                <span className="text-sm">{labels[l].native}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {langs.map((l) => (
            <TabsContent key={l} value={l} className="mt-4">
              {render(l)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
