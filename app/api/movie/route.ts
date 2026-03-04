import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { isValidImdbId } from "@/lib/validators";
import type { MovieData } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get("id");

  if (!imdbId || !isValidImdbId(imdbId)) {
    return NextResponse.json(
      { message: "Invalid IMDb ID format. Expected format: tt1234567" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "OMDB API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await axios.get("https://www.omdbapi.com/", {
      params: {
        i: imdbId,
        apikey: apiKey,
        plot: "full",
      },
      timeout: 10000,
    });

    const data = response.data;

    // OMDB returns Response: "False" when movie is not found
    if (data.Response === "False") {
      return NextResponse.json(
        { message: data.Error || "Movie not found for this IMDb ID" },
        { status: 404 }
      );
    }

    const movie: MovieData = {
      title: data.Title || "Unknown",
      year: data.Year || "N/A",
      rated: data.Rated || "N/A",
      genre: data.Genre || "N/A",
      director: data.Director || "N/A",
      actors: data.Actors || "N/A",
      plot: data.Plot || "No plot available.",
      poster: data.Poster !== "N/A" ? data.Poster : "",
      imdbRating: data.imdbRating || "N/A",
      imdbVotes: data.imdbVotes || "N/A",
    };

    return NextResponse.json(movie);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { message: "Request to OMDB timed out. Please try again." },
          { status: 504 }
        );
      }
    }
    console.error("OMDB API error:", error);
    return NextResponse.json(
      { message: "Failed to fetch movie data. Please try again." },
      { status: 500 }
    );
  }
}
