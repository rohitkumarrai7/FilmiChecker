export interface MovieData {
  title: string;
  year: string;
  rated: string;
  genre: string;
  director: string;
  actors: string;
  plot: string;
  poster: string;
  imdbRating: string;
  imdbVotes: string;
}

export interface SentimentData {
  summary: string;
  classification: "positive" | "mixed" | "negative";
  themes: string[];
  positiveScore: number;
  negativeScore: number;
}

export interface ReviewsData {
  reviews: string[];
  fallback: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}
