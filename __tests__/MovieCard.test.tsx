import React from "react";
import { render, screen } from "@testing-library/react";
import MovieCard from "@/components/MovieCard";
import type { MovieData } from "@/types";

// Strip framer-motion specific props that are not valid HTML attributes
function stripMotionProps(props: Record<string, unknown>) {
  const motionKeys = [
    "initial", "animate", "exit", "whileHover", "whileTap", "whileFocus",
    "transition", "variants", "layout", "layoutId",
  ];
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!motionKeys.includes(k)) clean[k] = v;
  }
  return clean;
}

// Framer Motion is mocked to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...(stripMotionProps(props) as React.HTMLAttributes<HTMLDivElement>)}>
        {children as React.ReactNode}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// next/image is mocked to a plain <img> without Next.js-specific props
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  ),
}));

const baseMovie: MovieData = {
  title: "The Matrix",
  year: "1999",
  rated: "R",
  genre: "Action, Sci-Fi",
  director: "The Wachowskis",
  actors: "Keanu Reeves, Laurence Fishburne",
  plot: "A hacker discovers the true nature of reality.",
  poster: "https://m.media-amazon.com/images/test.jpg",
  imdbRating: "8.7",
  imdbVotes: "1,500,000",
};

describe("MovieCard", () => {
  it("renders the movie title correctly", () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText("The Matrix")).toBeInTheDocument();
  });

  it("renders the release year", () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText("1999")).toBeInTheDocument();
  });

  it("renders genre badges", () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
  });

  it("renders IMDb rating", () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText("8.7")).toBeInTheDocument();
  });

  it("renders director name", () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText("The Wachowskis")).toBeInTheDocument();
  });

  it("renders fallback message when poster is empty", () => {
    render(<MovieCard movie={{ ...baseMovie, poster: "" }} />);
    expect(screen.getByLabelText("No poster available")).toBeInTheDocument();
  });
});
