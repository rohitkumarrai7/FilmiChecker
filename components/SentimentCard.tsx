"use client";

import { motion } from "framer-motion";
import type { SentimentData } from "@/types";

interface SentimentCardProps {
  sentiment: SentimentData;
  usedFallback: boolean;
}

const CLASSIFICATION_CONFIG = {
  positive: {
    label: "POSITIVE",
    badgeClass:
      "bg-green-500/15 border-green-500/60 text-green-400 shadow-green-glow",
    dotClass: "bg-green-400",
  },
  mixed: {
    label: "MIXED",
    badgeClass:
      "bg-amber-500/15 border-amber-500/60 text-amber-400 shadow-amber-glow",
    dotClass: "bg-amber-400",
  },
  negative: {
    label: "NEGATIVE",
    badgeClass:
      "bg-red-500/15 border-red-500/60 text-red-400 shadow-red-glow",
    dotClass: "bg-red-500",
  },
} as const;

interface ScoreBarProps {
  label: string;
  score: number;
  colorClass: string;
  delay?: number;
}

function ScoreBar({ label, score, colorClass, delay = 0 }: ScoreBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1.5">
        <span className="text-gray-400 text-xs font-sans uppercase tracking-wide">
          {label}
        </span>
        <span className="text-gray-300 text-xs font-sans font-semibold">
          {score}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-navy-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function SentimentCard({
  sentiment,
  usedFallback,
}: SentimentCardProps) {
  const config = CLASSIFICATION_CONFIG[sentiment.classification];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      className="w-full bg-navy-800 rounded-2xl border border-white/5 p-6 sm:p-8
                 shadow-2xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-500 text-xs font-sans uppercase tracking-widest mb-2">
            AI Sentiment Analysis
          </p>
          <h2 className="font-playfair text-2xl font-bold text-white">
            Audience Insights
          </h2>
        </div>

        {/* Classification badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`
            flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2
            font-bold text-sm font-sans tracking-wider self-start
            ${config.badgeClass}
          `}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${config.dotClass} animate-pulse`}
          />
          {config.label}
        </motion.div>
      </div>

      {/* Fallback notice */}
      {usedFallback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-5 px-4 py-3 rounded-lg bg-navy-700/60 border border-yellow-600/30
                     text-yellow-500/80 text-xs font-sans flex items-start gap-2"
        >
          <span>⚠</span>
          <span>
            Sentiment based on metadata — no user reviews were found for this
            title. Analysis derived from plot, genre, and IMDb rating.
          </span>
        </motion.div>
      )}

      {/* AI Summary */}
      <div className="mb-6">
        <p className="text-gray-300 font-sans text-sm leading-relaxed">
          {sentiment.summary}
        </p>
      </div>

      {/* Key Themes */}
      {sentiment.themes.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-500 text-xs font-sans uppercase tracking-widest mb-3">
            Key Themes
          </p>
          <div className="flex flex-wrap gap-2">
            {sentiment.themes.map((theme, i) => (
              <motion.span
                key={theme}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10
                           text-gray-300 text-xs font-sans"
              >
                {theme}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Score bars */}
      <div className="flex flex-col gap-4 pt-5 border-t border-white/5">
        <ScoreBar
          label="Positive Sentiment"
          score={sentiment.positiveScore}
          colorClass="bg-gradient-to-r from-green-600 to-green-400"
          delay={0.5}
        />
        <ScoreBar
          label="Negative Sentiment"
          score={sentiment.negativeScore}
          colorClass="bg-gradient-to-r from-red-700 to-red-500"
          delay={0.7}
        />
      </div>
    </motion.div>
  );
}
