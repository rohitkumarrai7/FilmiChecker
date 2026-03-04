"use client";

import { motion } from "framer-motion";

interface CastListProps {
  actors: string;
}

export default function CastList({ actors }: CastListProps) {
  const cast = actors
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (cast.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className="w-full"
    >
      <h2 className="text-gray-400 text-xs font-sans uppercase tracking-widest mb-3">
        Cast
      </h2>

      {/* Horizontally scrollable row */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        role="list"
        aria-label="Cast members"
      >
        {cast.map((actor, index) => (
          <motion.span
            key={actor}
            role="listitem"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className="flex-shrink-0 px-4 py-2 rounded-full
                       border border-gold-500/40 bg-gold-500/5
                       text-gray-300 text-sm font-sans
                       hover:border-gold-500/80 hover:bg-gold-500/10
                       hover:text-gold-300 transition-colors duration-200
                       cursor-default"
          >
            {actor}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
