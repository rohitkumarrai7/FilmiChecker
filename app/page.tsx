"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import SearchInput from "@/components/SearchInput";
import MovieCard from "@/components/MovieCard";
import CastList from "@/components/CastList";
import PlotSection from "@/components/PlotSection";
import SentimentCard from "@/components/SentimentCard";
import SkeletonLoader from "@/components/SkeletonLoader";
import PopularMovies from "@/components/PopularMovies";
import type { MovieData, SentimentData, ReviewsData } from "@/types";

const MAX_RECENT = 5;

export default function HomePage() {
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Two separate loading states so movie card appears before sentiment finishes
  const [isLoadingMovie, setIsLoadingMovie] = useState(false);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);

  // Two separate error states so a sentiment failure never hides the movie card
  const [movieError, setMovieError] = useState<string | null>(null);
  const [sentimentError, setSentimentError] = useState<string | null>(null);

  const [hasSearched, setHasSearched] = useState(false);
  const [currentImdbId, setCurrentImdbId] = useState<string>("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on first render
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cinescope_recent");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // localStorage unavailable (SSR / private browsing edge case)
    }
  }, []);

  function saveRecent(imdbId: string) {
    setRecentSearches((prev) => {
      const updated = [imdbId, ...prev.filter((id) => id !== imdbId)].slice(
        0,
        MAX_RECENT
      );
      try {
        localStorage.setItem("cinescope_recent", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }

  async function fetchSentiment(movie: MovieData, reviews: string[]) {
    setIsLoadingSentiment(true);
    setSentimentError(null);
    try {
      const res = await axios.post<SentimentData>("/api/sentiment", {
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        plot: movie.plot,
        imdbRating: movie.imdbRating,
        imdbVotes: movie.imdbVotes,
        rtScore: movie.rtScore,
        metascore: movie.metascore,
        reviews,
      });
      setSentimentData(res.data);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Failed to generate AI sentiment."
        : "Failed to generate AI sentiment.";
      setSentimentError(msg);
    } finally {
      setIsLoadingSentiment(false);
    }
  }

  async function handleSearch(imdbId: string) {
    setIsLoadingMovie(true);
    setMovieError(null);
    setSentimentError(null);
    setMovieData(null);
    setSentimentData(null);
    setHasSearched(true);
    setCurrentImdbId(imdbId);

    try {
      const [movieRes, reviewsRes] = await Promise.all([
        axios.get<MovieData>(`/api/movie?id=${imdbId}`),
        axios.get<ReviewsData>(`/api/reviews?id=${imdbId}`),
      ]);

      const movie = movieRes.data;
      const reviewsData = reviewsRes.data;

      setMovieData(movie);
      setUsedFallback(reviewsData.fallback);
      saveRecent(imdbId);

      // Start sentiment fetch — runs independently so movie card shows immediately
      fetchSentiment(movie, reviewsData.reviews);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;
        if (status === 404) {
          setMovieError("No movie found for this IMDb ID. Please check and try again.");
        } else if (status === 400) {
          setMovieError(message || "Invalid IMDb ID format.");
        } else {
          setMovieError(message || "Something went wrong. Please try again.");
        }
      } else {
        setMovieError("Unexpected error. Please try again.");
      }
    } finally {
      setIsLoadingMovie(false);
    }
  }

  const isLoading = isLoadingMovie;
  const showResults = !isLoadingMovie && !!movieData;

  return (
    <div className="min-h-screen bg-navy-900 relative">
      {/* Radial gold glow */}
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
          className="text-center mb-10"
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
            Cine<span className="text-gold-500">Scope</span>
          </h1>

          <p className="text-gray-400 font-sans text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Enter any IMDb movie ID to unlock AI-powered sentiment analysis,
            audience insights, and cast details.
          </p>
        </motion.header>

        {/* Search */}
        <div className="mb-4">
          <SearchInput onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Recent searches */}
        <AnimatePresence>
          {recentSearches.length > 0 && !isLoading && (
            <motion.div
              key="recent"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap items-center gap-2 mb-8 justify-center"
            >
              <span className="text-gray-600 text-xs font-sans">Recent:</span>
              {recentSearches.map((id) => (
                <button
                  key={id}
                  onClick={() => handleSearch(id)}
                  className="px-2.5 py-1 rounded-md bg-navy-800 border border-white/5
                             text-gray-500 hover:text-gold-400 hover:border-gold-500/30
                             text-xs font-sans transition-colors duration-200"
                >
                  {id}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!hasSearched && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-8 mb-8"
          >
            <PopularMovies onSelect={handleSearch} />
          </motion.div>
        )}

        {/* Skeleton while loading movie */}
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

        {/* Movie-level error (replaces everything) */}
        <AnimatePresence>
          {!isLoading && movieError && (
            <motion.div
              key="movie-error"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16"
              role="alert"
            >
              <div className="text-5xl mb-4">🎬</div>
              <p className="text-red-400 font-sans text-base mb-4">{movieError}</p>
              <button
                onClick={() => handleSearch(currentImdbId)}
                className="px-5 py-2 rounded-lg bg-navy-800 border border-white/10
                           text-gray-400 hover:text-white hover:border-white/20
                           text-sm font-sans transition-colors duration-200"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              <MovieCard movie={movieData!} />

              {movieData!.actors && movieData!.actors !== "N/A" && (
                <CastList actors={movieData!.actors} />
              )}

              {movieData!.plot && movieData!.plot !== "N/A" && (
                <PlotSection plot={movieData!.plot} />
              )}

              {/* Sentiment section */}
              <AnimatePresence mode="wait">
                {sentimentData ? (
                  <SentimentCard
                    key="sentiment"
                    sentiment={sentimentData}
                    usedFallback={usedFallback}
                  />
                ) : isLoadingSentiment ? (
                  <motion.div
                    key="sentiment-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                        cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"
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
                ) : sentimentError ? (
                  <motion.div
                    key="sentiment-error"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full bg-navy-800 rounded-2xl border border-red-500/20
                               p-8 text-center"
                    role="alert"
                  >
                    <p className="text-red-400 font-sans text-sm mb-4">
                      {sentimentError}
                    </p>
                    <button
                      onClick={() =>
                        fetchSentiment(movieData!, [])
                      }
                      className="px-5 py-2 rounded-lg bg-gold-500/10 border border-gold-500/30
                                 text-gold-400 hover:bg-gold-500/20
                                 text-sm font-sans font-medium transition-colors duration-200"
                    >
                      Retry AI Analysis
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="text-center py-6 text-gray-700 text-xs font-sans">
        Built with Next.js · OMDB · RapidAPI IMDb · OpenRouter AI
      </footer>
    </div>
  );
}
