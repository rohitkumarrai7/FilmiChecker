"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import SearchInput from "@/components/SearchInput";
import MovieCard from "@/components/MovieCard";
import CastList from "@/components/CastList";
import PlotSection from "@/components/PlotSection";
import SentimentCard from "@/components/SentimentCard";
import SkeletonLoader from "@/components/SkeletonLoader";
import type { MovieData, SentimentData, ReviewsData } from "@/types";

export default function HomePage() {
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(imdbId: string) {
    setIsLoading(true);
    setError(null);
    setMovieData(null);
    setSentimentData(null);
    setHasSearched(true);

    try {
      // Fetch movie details and reviews in parallel
      const [movieResponse, reviewsResponse] = await Promise.all([
        axios.get<MovieData>(`/api/movie?id=${imdbId}`),
        axios.get<ReviewsData>(`/api/reviews?id=${imdbId}`),
      ]);

      const movie = movieResponse.data;
      const reviewsData = reviewsResponse.data;

      setMovieData(movie);
      setUsedFallback(reviewsData.fallback);

      // Fetch sentiment using movie + reviews
      const sentimentResponse = await axios.post<SentimentData>("/api/sentiment", {
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        plot: movie.plot,
        imdbRating: movie.imdbRating,
        reviews: reviewsData.reviews,
      });

      setSentimentData(sentimentResponse.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 404) {
          setError(
            "No movie found for this IMDb ID. Please check the ID and try again."
          );
        } else if (status === 400) {
          setError(message || "Invalid IMDb ID format.");
        } else {
          setError(
            message || "Something went wrong. Please try again in a moment."
          );
        }
      } else {
        setError("Unexpected error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 relative">
      {/* Subtle radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,200,66,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-gold-500/10 border border-gold-500/30 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-gold-400 text-xs font-sans tracking-widest uppercase">
              AI-Powered Analysis
            </span>
          </motion.div>

          <h1 className="font-playfair text-5xl sm:text-6xl font-bold text-white mb-4 leading-tight">
            Cine
            <span className="text-gold-500">Scope</span>
          </h1>

          <p className="text-gray-400 font-sans text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Enter any IMDb movie ID to unlock AI-powered sentiment analysis,
            audience insights, and cast details.
          </p>
        </motion.header>

        {/* Search form */}
        <div className="mb-12">
          <SearchInput onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading skeleton */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SkeletonLoader />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {!isLoading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16"
              role="alert"
            >
              <div className="text-5xl mb-4">🎬</div>
              <p className="text-red-400 font-sans text-base">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {!isLoading && movieData && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              {/* Movie card */}
              <MovieCard movie={movieData} />

              {/* Cast list */}
              {movieData.actors && movieData.actors !== "N/A" && (
                <CastList actors={movieData.actors} />
              )}

              {/* Plot */}
              {movieData.plot && movieData.plot !== "N/A" && (
                <PlotSection plot={movieData.plot} />
              )}

              {/* Sentiment (shown only once available) */}
              <AnimatePresence>
                {sentimentData && (
                  <SentimentCard
                    sentiment={sentimentData}
                    usedFallback={usedFallback}
                  />
                )}
              </AnimatePresence>

              {/* Sentiment still loading */}
              {!sentimentData && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full bg-navy-800 rounded-2xl border border-white/5 p-8
                             flex items-center justify-center gap-3"
                >
                  <svg
                    className="animate-spin h-5 w-5 text-gold-500"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-gray-400 font-sans text-sm">
                    Generating AI sentiment analysis…
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state — before any search */}
        {!hasSearched && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-10"
          >
            <p className="text-gray-600 font-sans text-sm">
              Try{" "}
              <button
                onClick={() => handleSearch("tt0133093")}
                className="text-gold-500/70 hover:text-gold-400 transition-colors
                           underline underline-offset-2 cursor-pointer"
              >
                tt0133093
              </button>{" "}
              (The Matrix) to see it in action
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-700 text-xs font-sans">
        Built with Next.js · OMDB · RapidAPI IMDb · Arcee AI
      </footer>
    </div>
  );
}
