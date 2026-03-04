import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { isValidImdbId } from "@/lib/validators";
import type { ReviewsData } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get("id");

  if (!imdbId || !isValidImdbId(imdbId)) {
    return NextResponse.json(
      { message: "Invalid IMDb ID format" },
      { status: 400 }
    );
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Step 1: Resolve IMDb ID to TMDB movie ID
    const findResponse = await axios.get(
      `https://api.themoviedb.org/3/find/${imdbId}`,
      {
        params: { api_key: apiKey, external_source: "imdb_id" },
        timeout: 10000,
      }
    );

    const movieResults = findResponse.data?.movie_results;
    if (!movieResults || movieResults.length === 0) {
      // No TMDB match — return empty with fallback flag
      const result: ReviewsData = { reviews: [], fallback: true };
      return NextResponse.json(result);
    }

    const tmdbId: number = movieResults[0].id;

    // Step 2: Fetch user reviews using TMDB movie ID
    const reviewsResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}/reviews`,
      {
        params: { api_key: apiKey, language: "en-US", page: 1 },
        timeout: 10000,
      }
    );

    const rawReviews: Array<{ content: string }> =
      reviewsResponse.data?.results || [];

    if (rawReviews.length === 0) {
      const result: ReviewsData = { reviews: [], fallback: true };
      return NextResponse.json(result);
    }

    // Take first 6 reviews and trim each to 600 chars to keep the AI prompt concise
    const reviews = rawReviews
      .slice(0, 6)
      .map((r) => r.content.trim().slice(0, 600));

    const result: ReviewsData = { reviews, fallback: false };
    return NextResponse.json(result);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { message: "TMDB request timed out. Please try again." },
          { status: 504 }
        );
      }
    }
    console.error("TMDB API error:", error);
    // Graceful degradation — return empty fallback so sentiment can still run
    const result: ReviewsData = { reviews: [], fallback: true };
    return NextResponse.json(result);
  }
}
