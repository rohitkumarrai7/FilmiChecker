"use client";

import React from "react";
import { motion } from "framer-motion";

function SkeletonBlock({
  className,
  delay = 0,
  style,
}: {
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-lg bg-navy-700 relative overflow-hidden ${className}`}
      style={style}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent
                   via-white/5 to-transparent animate-shimmer"
        style={{ backgroundSize: "200% 100%" }}
      />
    </motion.div>
  );
}

export default function SkeletonLoader() {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* MovieCard skeleton */}
      <div className="w-full bg-navy-800 rounded-2xl border border-white/5 overflow-hidden p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Poster skeleton */}
          <SkeletonBlock className="w-full sm:w-56 h-72 sm:min-h-[320px] flex-shrink-0 rounded-none" />

          {/* Details skeleton */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col gap-4">
            <SkeletonBlock className="h-9 w-3/4" delay={0.05} />
            <SkeletonBlock className="h-4 w-1/4" delay={0.08} />

            {/* Genre pills */}
            <div className="flex gap-2">
              <SkeletonBlock className="h-7 w-20 rounded-full" delay={0.1} />
              <SkeletonBlock className="h-7 w-24 rounded-full" delay={0.12} />
              <SkeletonBlock className="h-7 w-16 rounded-full" delay={0.14} />
            </div>

            {/* Rating */}
            <SkeletonBlock className="h-7 w-28" delay={0.16} />

            <div className="mt-auto pt-4 border-t border-white/5">
              <SkeletonBlock className="h-3 w-16 mb-2" delay={0.18} />
              <SkeletonBlock className="h-4 w-40" delay={0.2} />
            </div>
          </div>
        </div>
      </div>

      {/* Cast skeleton */}
      <div className="w-full">
        <SkeletonBlock className="h-3 w-10 mb-3" delay={0.1} />
        <div className="flex gap-2 overflow-hidden">
          {[160, 120, 140, 100, 130].map((w, i) => (
            <SkeletonBlock
              key={i}
              className="h-9 flex-shrink-0 rounded-full"
              style={{ width: w }}
              delay={0.15 + i * 0.05}
            />
          ))}
        </div>
      </div>

      {/* Plot skeleton */}
      <div className="w-full bg-navy-800 rounded-xl p-5 border border-white/5">
        <SkeletonBlock className="h-3 w-10 mb-4" delay={0.1} />
        <div className="flex flex-col gap-2.5">
          <SkeletonBlock className="h-4 w-full" delay={0.15} />
          <SkeletonBlock className="h-4 w-5/6" delay={0.17} />
          <SkeletonBlock className="h-4 w-full" delay={0.19} />
          <SkeletonBlock className="h-4 w-4/5" delay={0.21} />
          <SkeletonBlock className="h-4 w-3/4" delay={0.23} />
        </div>
      </div>

      {/* Sentiment skeleton */}
      <div className="w-full bg-navy-800 rounded-2xl border border-white/5 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-3 w-32" delay={0.1} />
            <SkeletonBlock className="h-7 w-48" delay={0.13} />
          </div>
          <SkeletonBlock className="h-10 w-32 rounded-full self-start" delay={0.15} />
        </div>

        <SkeletonBlock className="h-4 w-full mb-2" delay={0.2} />
        <SkeletonBlock className="h-4 w-5/6 mb-2" delay={0.22} />
        <SkeletonBlock className="h-4 w-4/6 mb-6" delay={0.24} />

        {/* Themes */}
        <div className="flex gap-2 mb-6">
          <SkeletonBlock className="h-8 w-24 rounded-lg" delay={0.26} />
          <SkeletonBlock className="h-8 w-32 rounded-lg" delay={0.28} />
          <SkeletonBlock className="h-8 w-20 rounded-lg" delay={0.3} />
        </div>

        {/* Score bars */}
        <div className="flex flex-col gap-4 pt-5 border-t border-white/5">
          <div>
            <div className="flex justify-between mb-1.5">
              <SkeletonBlock className="h-3 w-28" delay={0.32} />
              <SkeletonBlock className="h-3 w-8" delay={0.32} />
            </div>
            <SkeletonBlock className="h-2 w-full rounded-full" delay={0.34} />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <SkeletonBlock className="h-3 w-28" delay={0.36} />
              <SkeletonBlock className="h-3 w-8" delay={0.36} />
            </div>
            <SkeletonBlock className="h-2 w-full rounded-full" delay={0.38} />
          </div>
        </div>
      </div>
    </div>
  );
}
