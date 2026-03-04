"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { MovieData } from "@/types";

interface MovieCardProps {
  movie: MovieData;
}

function FilmReelFallback() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center
                 bg-navy-700 rounded-xl border border-gold-500/20 text-gold-500/60"
      aria-label="No poster available"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="9" />
        <line x1="12" y1="15" x2="12" y2="22" />
        <line x1="2" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="4.22" x2="9.17" y2="9.17" />
        <line x1="14.83" y1="14.83" x2="19.78" y2="19.78" />
        <line x1="19.78" y1="4.22" x2="14.83" y2="9.17" />
        <line x1="9.17" y1="14.83" x2="4.22" y2="19.78" />
      </svg>
      <span className="mt-3 text-sm font-sans">No Poster Available</span>
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      className="w-5 h-5 text-gold-500 inline-block mr-1"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const genres = movie.genre.split(",").map((g) => g.trim()).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-navy-800 rounded-2xl border border-white/5 overflow-hidden
                 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row gap-0">
        {/* Poster */}
        <div className="relative w-full sm:w-56 sm:min-w-[224px] h-72 sm:h-auto flex-shrink-0">
          {movie.poster && !imgError ? (
            <motion.div
              className="relative w-full h-full group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Image
                src={movie.poster}
                alt={`${movie.title} poster`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 224px"
                onError={() => setImgError(true)}
                priority
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-navy-800/60 hidden sm:block" />
            </motion.div>
          ) : (
            <FilmReelFallback />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-4">
          <div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-white leading-tight mb-2">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-gray-400 font-sans text-sm">{movie.year}</span>
              {movie.rated && movie.rated !== "N/A" && (
                <span className="px-2 py-0.5 rounded border border-gray-600 text-gray-400 text-xs font-sans uppercase">
                  {movie.rated}
                </span>
              )}
            </div>

            {/* Genre badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30
                             text-gold-400 text-xs font-sans font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Rating */}
            {movie.imdbRating && movie.imdbRating !== "N/A" && (
              <div className="flex items-center gap-1 mb-4">
                <StarIcon />
                <span className="text-gold-400 font-bold text-xl font-sans">
                  {movie.imdbRating}
                </span>
                <span className="text-gray-500 text-sm font-sans">/10</span>
                {movie.imdbVotes && movie.imdbVotes !== "N/A" && (
                  <span className="text-gray-500 text-sm font-sans ml-1">
                    ({movie.imdbVotes} votes)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Director */}
          {movie.director && movie.director !== "N/A" && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-gray-500 text-xs font-sans uppercase tracking-widest mb-1">
                Director
              </p>
              <p className="text-gray-300 font-sans text-sm">{movie.director}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
