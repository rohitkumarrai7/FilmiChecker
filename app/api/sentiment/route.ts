import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import type { SentimentData } from "@/types";

interface SentimentRequestBody {
  title: string;
  year: string;
  genre: string;
  plot: string;
  imdbRating: string;
  reviews: string[];
}

function buildPrompt(body: SentimentRequestBody): string {
  const reviewText =
    body.reviews.length > 0
      ? body.reviews.join("\n\n")
      : "No reviews available, use metadata only";

  return `You are a professional movie sentiment analyst.

Movie: ${body.title} (${body.year})
Genre: ${body.genre}
IMDb Rating: ${body.imdbRating}/10
Plot: ${body.plot}

Audience Reviews:
${reviewText}

Analyze the above and respond ONLY in this exact JSON format with no extra text:
{
  "summary": "3-4 sentence summary of overall audience sentiment, what viewers loved and criticized",
  "classification": "positive" OR "mixed" OR "negative",
  "themes": ["theme 1", "theme 2", "theme 3"],
  "positiveScore": <number 0-100>,
  "negativeScore": <number 0-100>
}`;
}

function parseArceeResponse(content: string): SentimentData {
  // Strip markdown code fences if present
  const cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Extract the first JSON object from the response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in Arcee response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate required fields and apply safe defaults
  const classification = ["positive", "mixed", "negative"].includes(
    parsed.classification
  )
    ? (parsed.classification as SentimentData["classification"])
    : "mixed";

  return {
    summary: String(parsed.summary || "No summary available."),
    classification,
    themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 3) : [],
    positiveScore: Math.min(100, Math.max(0, Number(parsed.positiveScore) || 50)),
    negativeScore: Math.min(100, Math.max(0, Number(parsed.negativeScore) || 50)),
  };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ARCEE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Arcee API key not configured" },
      { status: 500 }
    );
  }

  let body: SentimentRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body.title || !body.plot) {
    return NextResponse.json(
      { message: "Missing required fields: title and plot" },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(body);

  try {
    const response = await axios.post(
      "https://models.arcee.ai/v1/chat/completions",
      {
        model: "arcee-ai/arcee-nova",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content: string =
      response.data?.choices?.[0]?.message?.content || "";

    if (!content) {
      throw new Error("Empty response from Arcee AI");
    }

    const sentiment = parseArceeResponse(content);
    return NextResponse.json(sentiment);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { message: "Arcee AI request timed out. Please try again." },
          { status: 504 }
        );
      }
      if (error.response?.status === 401) {
        return NextResponse.json(
          { message: "Invalid Arcee API key" },
          { status: 401 }
        );
      }
    }
    console.error("Arcee sentiment error:", error);
    return NextResponse.json(
      { message: "Failed to generate AI sentiment. Please try again." },
      { status: 500 }
    );
  }
}
