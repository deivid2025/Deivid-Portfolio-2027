"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/portfolio/i18n-provider";

export function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-5 right-5 z-50"
        >
          <Button
            size="icon"
            aria-label={t.backToTop}
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="h-11 w-11 rounded-full shadow-lg shadow-primary/20"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
