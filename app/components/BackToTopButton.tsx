"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BackToTopButtonProps {
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  showAfter?: number; // pixels para aparecer
}

export default function BackToTopButton({
  position = "bottom-right",
  showAfter = 300,
}: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > showAfter);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className={`fixed ${positionClasses[position]} z-50 
                     bg-smui-green hover:bg-smui-green/80 
                     text-slate-950 
                     w-12 h-12 
                     rounded-full 
                     shadow-lg 
                     flex items-center justify-center
                     transition-all duration-300
                     cursor-pointer
                     border border-smui-dark-surface-3/50
                     active:scale-95
                     sm:hidden`}
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
