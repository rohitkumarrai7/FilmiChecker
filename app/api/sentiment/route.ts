import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import type { SentimentData } from "@/types";

interface SentimentRequestBody {
  title: string;
  year: string;
  genre: string;
  plot: string;
  imdbRating: string;
  imdbVotes?: string;
  rtScore?: string;
  metascore?: string;
  reviews: string[];
}

// Free models tried in order — if one is unavailable, the next is attempted
const OPENROUTER_MODELS = [
  "arcee-ai/trinity-large-preview:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
];

function buildPrompt(body: SentimentRequestBody): string {
  const reviewText =
    body.reviews.length > 0
      ? body.reviews.join("\n\n")
      : "No user reviews available";

  // Build critical scores section from whatever data is available
  const scoreLines: string[] = [];
  if (body.imdbRating && body.imdbRating !== "N/A") {
    const votes = body.imdbVotes && body.imdbVotes !== "N/A"
      ? ` (${body.imdbVotes} votes)`
      : "";
    scoreLines.push(`IMDb: ${body.imdbRating}/10${votes}`);
  }
  if (body.rtScore) scoreLines.push(`Rotten Tomatoes: ${body.rtScore}`);
  if (body.metascore) scoreLines.push(`Metacritic: ${body.metascore}`);
  const criticalScores = scoreLines.length > 0
    ? scoreLines.join(" | ")
    : "N/A";

  return `You are a professional movie sentiment analyst.

Movie: ${body.title} (${body.year})
Genre: ${body.genre}
Critical Scores: ${criticalScores}
Plot: ${body.plot}

Audience Reviews:
${reviewText}

Analyze the above (use critical scores as a proxy for audience sentiment when reviews are limited) and respond ONLY in this exact JSON format with no extra text:
{
  "summary": "3-4 sentence summary of overall audience sentiment, what viewers loved and criticized",
  "classification": "positive" OR "mixed" OR "negative",
  "themes": ["theme 1", "theme 2", "theme 3"],
  "positiveScore": <number 0-100>,
  "negativeScore": <number 0-100>
}`;
}

function parseAIResponse(content: string): SentimentData {
  const cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

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

/** Try each free model in sequence until one succeeds. */
async function callOpenRouter(
  apiKey: string,
  prompt: string
): Promise<string> {
  let lastError: unknown;

  for (const model of OPENROUTER_MODELS) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 800,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://cinescope.vercel.app",
            "X-Title": "CineScope",
          },
          timeout: 30000,
        }
      );

      const content: string =
        response.data?.choices?.[0]?.message?.content || "";

      if (!content) {
        console.warn(`Model ${model} returned empty content — trying next`);
        continue;
      }

      console.log(`Sentiment generated using model: ${model}`);
      return content;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errMsg = err.response?.data?.error?.message || err.message;

        // 404 = model endpoint gone, try next model
        if (status === 404 || (errMsg && errMsg.includes("No endpoints found"))) {
          console.warn(`Model ${model} unavailable (${status}) — trying next`);
          lastError = err;
          continue;
        }

        // Auth error — no point trying other models
        if (status === 401 || status === 403) {
          throw err;
        }
      }
      lastError = err;
    }
  }

  throw lastError ?? new Error("All OpenRouter models failed");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ARCEE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "AI API key not configured" },
      { status: 500 }
    );
  }

  let body: SentimentRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (!body.title || !body.plot) {
    return NextResponse.json(
      { message: "Missing required fields: title and plot" },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(body);

  try {
    const content = await callOpenRouter(apiKey, prompt);
    const sentiment = parseAIResponse(content);
    return NextResponse.json(sentiment);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { message: "AI request timed out. Please try again." },
          { status: 504 }
        );
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        return NextResponse.json(
          { message: "Invalid OpenRouter API key" },
          { status: 401 }
        );
      }
      console.error("AI sentiment error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected sentiment error:", error);
    }
    return NextResponse.json(
      { message: "Failed to generate AI sentiment. Please try again." },
      { status: 500 }
    );
  }
}
