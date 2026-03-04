import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { isValidImdbId } from "@/lib/validators";
import type { ReviewsData } from "@/types";

const FALLBACK: ReviewsData = { reviews: [], fallback: true };

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
  // Missing key is non-fatal — AI sentiment still runs using movie metadata
  if (!rapidApiKey) {
    console.warn("RAPIDAPI_KEY not set — skipping reviews");
    return NextResponse.json(FALLBACK);
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

    // The API may nest reviews under data.reviews or return them directly
    const rawReviews: Array<Record<string, unknown>> =
      response.data?.reviews ?? response.data?.data?.reviews ?? [];

    if (!rawReviews || rawReviews.length === 0) {
      return NextResponse.json(FALLBACK);
    }

    // Extract text — field name varies between imdb8 API versions
    const reviews = rawReviews
      .slice(0, 6)
      .map((r) => {
        const text =
          (r.reviewText as string) ||
          (r.content as string) ||
          (r.text as string) ||
          "";
        return text.trim().slice(0, 600);
      })
      .filter(Boolean);

    if (reviews.length === 0) {
      return NextResponse.json(FALLBACK);
    }

    const result: ReviewsData = { reviews, fallback: false };
    return NextResponse.json(result);
  } catch (error) {
    // Reviews are optional — ANY error falls back gracefully so the movie card
    // and AI sentiment still render. Never propagate a 4xx/5xx here.
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        const errBody = error.response?.data;
        console.warn(
          `RapidAPI rejected key (${status}) — running without reviews.`,
          `Response body: ${JSON.stringify(errBody)}`
        );
      } else if (error.code === "ECONNABORTED") {
        console.warn("RapidAPI timed out — running without reviews");
      } else {
        console.error("RapidAPI reviews error:", error.message, error.response?.data);
      }
    } else {
      console.error("Unexpected reviews error:", error);
    }
    return NextResponse.json(FALLBACK);
  }
}
