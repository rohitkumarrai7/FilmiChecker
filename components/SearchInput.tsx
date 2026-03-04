"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isValidImdbId } from "@/lib/validators";

interface SearchInputProps {
  onSearch: (imdbId: string) => void;
  isLoading: boolean;
}

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter an IMDb ID to analyze.");
      return;
    }
    if (!isValidImdbId(trimmed)) {
      setError("Invalid format. Expected: tt1234567 (tt + 7 or 8 digits)");
      return;
    }
    setError(null);
    onSearch(trimmed);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter IMDb ID (e.g. tt0133093)"
              disabled={isLoading}
              aria-label="IMDb movie ID"
              aria-describedby={error ? "search-error" : undefined}
              className={`
                w-full px-5 py-4 rounded-xl bg-navy-800 text-white
                border-2 transition-all duration-300 outline-none text-base
                placeholder:text-gray-500 font-sans
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error
                  ? "border-red-500 focus:border-red-400"
                  : "border-gold-500/30 focus:border-gold-500 focus:shadow-gold-glow"
                }
              `}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.03 }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
            className={`
              px-8 py-4 rounded-xl font-semibold text-navy-900 transition-all duration-300
              bg-gold-500 hover:bg-gold-400 hover:shadow-gold-glow-lg
              disabled:opacity-60 disabled:cursor-not-allowed
              whitespace-nowrap font-sans text-base
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              id="search-error"
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-red-400 text-sm font-sans pl-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
