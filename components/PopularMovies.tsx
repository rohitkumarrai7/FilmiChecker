"use client";

import { motion } from "framer-motion";

interface PopularMovie {
  id: string;
  title: string;
  year: string;
  emoji: string;
}

const POPULAR: PopularMovie[] = [
  { id: "tt0133093", title: "The Matrix", year: "1999", emoji: "🕶️" },
  { id: "tt0468569", title: "The Dark Knight", year: "2008", emoji: "🦇" },
  { id: "tt1375666", title: "Inception", year: "2010", emoji: "🌀" },
  { id: "tt0110912", title: "Pulp Fiction", year: "1994", emoji: "🎲" },
];

interface PopularMoviesProps {
  onSelect: (imdbId: string) => void;
}

export default function PopularMovies({ onSelect }: PopularMoviesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full"
    >
      <p className="text-gray-600 text-xs font-sans uppercase tracking-widest mb-3 text-center">
        Try a popular film
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {POPULAR.map((movie, i) => (
          <motion.button
            key={movie.id}
            onClick={() => onSelect(movie.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.07 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl
                       bg-navy-800 border border-white/5
                       hover:border-gold-500/30 hover:bg-navy-700
                       transition-colors duration-200 group"
          >
            <span className="text-2xl">{movie.emoji}</span>
            <span className="text-gray-300 group-hover:text-white text-xs font-sans
                             font-medium text-center leading-tight transition-colors">
              {movie.title}
            </span>
            <span className="text-gray-600 text-xs font-sans">{movie.year}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
