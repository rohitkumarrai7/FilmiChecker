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

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    return NextResponse.json(
      { message: "RapidAPI key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch user reviews from RapidAPI IMDb endpoint
    const response = await axios.get(
      "https://imdb8.p.rapidapi.com/title/get-user-reviews",
      {
        params: { tconst: imdbId },
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "imdb8.p.rapidapi.com",
        },
        timeout: 10000,
      }
    );

    // The API returns reviews under different field names — handle both
    const rawReviews: Array<Record<string, unknown>> =
      response.data?.reviews ?? [];

    if (!rawReviews || rawReviews.length === 0) {
      const result: ReviewsData = { reviews: [], fallback: true };
      return NextResponse.json(result);
    }

    // Extract review text (field is reviewText or content depending on API version)
    const reviews = rawReviews
      .slice(0, 6)
      .map((r) => {
        const text =
          (r.reviewText as string) ||
          (r.content as string) ||
          "";
        return text.trim().slice(0, 600);
      })
      .filter(Boolean); // drop any empty strings

    if (reviews.length === 0) {
      const result: ReviewsData = { reviews: [], fallback: true };
      return NextResponse.json(result);
    }

    const result: ReviewsData = { reviews, fallback: false };
    return NextResponse.json(result);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { message: "RapidAPI request timed out. Please try again." },
          { status: 504 }
        );
      }
      if (error.response?.status === 403 || error.response?.status === 401) {
        return NextResponse.json(
          { message: "Invalid RapidAPI key" },
          { status: 401 }
        );
      }
    }
    console.error("RapidAPI IMDb reviews error:", error);
    // Graceful degradation — Arcee will still run using metadata only
    const result: ReviewsData = { reviews: [], fallback: true };
    return NextResponse.json(result);
  }
}
