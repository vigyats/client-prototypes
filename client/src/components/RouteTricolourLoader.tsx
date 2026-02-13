import { motion, AnimatePresence } from "framer-motion";

export function RouteTricolourLoader({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="loader"  // ✅ Required for AnimatePresence tracking
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="tricolour-ring" />
            <div className="tricolour-loader">
              <div className="dot dot-saffron" />
              <div className="dot dot-white" />
              <div className="dot dot-green" />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
