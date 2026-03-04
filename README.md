# FilmiChecker — AI Movie Insight Builder

A full-stack Next.js 14 app that takes an IMDb movie ID and returns rich movie metadata alongside AI-generated audience sentiment analysis.

## Live Demo

*(link will be added after Vercel deployment)*

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohitkumarrai7/CineScope.git
   cd CineScope
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API keys**
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and fill in the three API keys (see below).

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

5. **Run tests**
   ```bash
   npm test
   ```

## API Keys Required

| Variable | Source |
|---|---|
| `OMDB_API_KEY` | [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) — free tier |
| `RAPIDAPI_KEY` | [rapidapi.com/api-dojo/api/imdb8](https://rapidapi.com/api-dojo/api/imdb8) — free tier (optional, enables real user reviews) |
| `ARCEE_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) — free tier (used as OpenRouter key) |

## Tech Stack Rationale

| Technology | Why |
|---|---|
| **Next.js 14 App Router** | Unified frontend + backend in one repo. API routes keep secret keys server-side, never exposed to the browser. Vercel serverless functions handle both the React UI and Node.js API layer. |
| **TypeScript** | Type safety across API boundaries prevents silent data shape errors at runtime. |
| **Tailwind CSS** | Utility-first approach enables rapid, responsive styling without bloated CSS files. |
| **Framer Motion** | Declarative animation API that produces smooth, performant transitions with minimal code. |
| **Axios** | Consistent error objects (`isAxiosError`) and built-in timeout support make API error handling predictable. |
| **OMDB API** | Reliable, well-documented movie metadata with direct IMDb ID lookup. Also returns aggregated Rotten Tomatoes and Metacritic scores via its `Ratings` array. |
| **RapidAPI IMDb** | Source for real user-written reviews — up to 6 reviews per film, trimmed to 600 chars each for the AI prompt. |
| **OpenRouter AI** | Unified gateway to multiple free LLMs. Uses `arcee-ai/trinity-large-preview:free` as primary model with automatic fallback to `google/gemma-2-9b-it:free` and `mistralai/mistral-7b-instruct:free` if a model becomes unavailable. |

## Project Structure

```
app/
  layout.tsx           Global font and metadata configuration
  page.tsx             Main page — search, loading, and results
  globals.css          Tailwind directives + custom CSS variables
  api/
    movie/route.ts     OMDB movie metadata + RT%/Metacritic extraction
    reviews/route.ts   RapidAPI IMDb reviews endpoint (graceful fallback)
    sentiment/route.ts OpenRouter AI sentiment with model fallback chain
components/
  SearchInput.tsx      IMDb ID input with validation and gold focus glow
  MovieCard.tsx        Poster, title, year, genre, rating, director
  CastList.tsx         Horizontally scrollable actor chip row
  PlotSection.tsx      Collapsible plot summary
  SentimentCard.tsx    AI summary, classification badge, themes, score bars
  SkeletonLoader.tsx   Shimmer skeleton matching the results layout
  PopularMovies.tsx    Quick-launch grid of 4 popular films
lib/
  validators.ts        isValidImdbId and helper utilities
types/
  index.ts             Shared TypeScript interfaces
__tests__/
  validators.test.ts   7 unit tests covering IMDb ID validation edge cases
  MovieCard.test.tsx   8 render tests for MovieCard component
```

## Assumptions

- **Review availability**: RapidAPI IMDb reviews are used when available. If a film has no reviews or the API key is not subscribed to the imdb8 endpoint, the AI generates sentiment from plot, genre, IMDb rating, Rotten Tomatoes %, and Metacritic score. This fallback is surfaced to the user with a notice banner.
- **Deployment**: Next.js API routes run as Vercel serverless functions — no separate backend server required. Vercel handles both frontend and backend in a single deployment.
- **Free API tiers**: All three APIs operate within free-tier limits suitable for evaluation.
- **IMDb ID format**: Valid IDs follow the pattern `tt` followed by 7 or 8 digits (matching IMDb's documented format).
- **Poster images**: OMDB provides poster URLs hosted on Amazon's CDN, allowlisted in `next.config.mjs` for `next/image` optimisation.
- **Review length**: Each review is trimmed to 600 characters before being sent to the AI to keep the prompt within token limits while preserving meaning.
