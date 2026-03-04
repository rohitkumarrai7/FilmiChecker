"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlotSectionProps {
  plot: string;
}

const TRUNCATE_AT = 300;

export default function PlotSection({ plot }: PlotSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = plot.length > TRUNCATE_AT;
  const displayText =
    isLong && !expanded ? `${plot.slice(0, TRUNCATE_AT).trimEnd()}…` : plot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="w-full"
    >
      <h2 className="text-gray-400 text-xs font-sans uppercase tracking-widest mb-3">
        Plot
      </h2>

      <div className="bg-navy-800 rounded-xl p-5 border border-white/5">
        <AnimatePresence mode="wait">
          <motion.p
            key={expanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-gray-300 font-sans text-sm leading-relaxed"
          >
            {displayText}
          </motion.p>
        </AnimatePresence>

        {isLong && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-3 text-gold-500 hover:text-gold-400 text-sm font-sans
                       font-medium transition-colors duration-200 focus:outline-none
                       focus-visible:underline"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
