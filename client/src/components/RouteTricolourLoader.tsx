import { motion, AnimatePresence } from "framer-motion";

export function RouteTricolourLoader({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="route-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-md"
        >
          <div className="w-[92%] max-w-md rounded-3xl border bg-card/80 p-6 shadow-[var(--shadow-lg)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold tracking-tight">Loading</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Preparing the next view…
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl border bg-background shadow-[var(--shadow-sm)] grid place-items-center">
                <div className="h-4 w-4 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border bg-background">
              <div className="relative h-10">
                <div className="absolute inset-0 grid grid-cols-3">
                  <div className="bg-[hsl(var(--tri-saffron))]/90" />
                  <div className="bg-white" />
                  <div className="bg-[hsl(var(--tri-green))]/90" />
                </div>

                <div className="absolute inset-0">
                  <div className="h-full w-[40%] translate-x-[-30%] tri-sweep bg-gradient-to-r from-transparent via-[hsl(var(--tri-navy))]/25 to-transparent" />
                </div>

                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 grid place-items-center">
                  <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--tri-navy))]/50" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Tricolour transition</span>
              <span className="font-medium text-foreground/80">EN • HI • MR</span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
