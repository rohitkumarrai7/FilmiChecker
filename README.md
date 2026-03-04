# CineScope — AI Movie Insight Builder

A full-stack Next.js 14 app that takes an IMDb movie ID and returns rich movie metadata alongside AI-generated audience sentiment analysis.

## Live Demo

[https://cinescope-five.vercel.app](https://cinescope-five.vercel.app)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd cinescope
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
| `TMDB_API_KEY` | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) — free tier |
| `ARCEE_API_KEY` | [app.arcee.ai](https://app.arcee.ai) — free tier |

## Tech Stack Rationale

| Technology | Why |
|---|---|
| **Next.js 14 App Router** | Unified frontend + backend in one repo. API routes keep secret keys server-side, never exposed to the browser. |
| **TypeScript** | Type safety across API boundaries prevents silent data shape errors at runtime. |
| **Tailwind CSS** | Utility-first approach enables rapid, responsive styling without bloated CSS files. |
| **Framer Motion** | Declarative animation API that produces smooth, performant transitions with minimal code. |
| **Axios** | Consistent error objects (`isAxiosError`) and built-in timeout support make API error handling predictable. |
| **OMDB API** | Reliable, well-documented movie metadata with direct IMDb ID lookup support. |
| **TMDB API** | Official source for real user-written reviews — eliminates the need for fragile web scraping. |
| **Arcee Nova (AI)** | Free, capable LLM that reliably returns structured JSON sentiment output with a low temperature setting. |

## Project Structure

```
app/
  layout.tsx           Global font and metadata configuration
  page.tsx             Main page — search, loading, and results
  globals.css          Tailwind directives + custom CSS variables
  api/
    movie/route.ts     OMDB movie metadata endpoint
    reviews/route.ts   TMDB reviews resolver endpoint
    sentiment/route.ts Arcee AI sentiment endpoint
components/
  SearchInput.tsx      IMDb ID input with validation and gold focus glow
  MovieCard.tsx        Poster, title, year, genre, rating, director
  CastList.tsx         Horizontally scrollable actor chip row
  PlotSection.tsx      Collapsible plot summary
  SentimentCard.tsx    AI summary, classification badge, themes, score bars
  SkeletonLoader.tsx   Shimmer skeleton matching the results layout
lib/
  validators.ts        isValidImdbId and helper utilities
types/
  index.ts             Shared TypeScript interfaces
__tests__/
  validators.test.ts   7 unit tests covering IMDb ID validation edge cases
  MovieCard.test.tsx   6 render tests for MovieCard component
```

## Assumptions

- **Review availability**: TMDB reviews are used when available. If a film has no reviews on TMDB, Arcee generates sentiment from its plot, genre, and IMDb rating using its training knowledge. This is surfaced to the user with a notice banner.
- **Free API tiers**: All three APIs operate within free-tier limits suitable for evaluation.
- **IMDb ID format**: Valid IDs follow the pattern `tt` followed by exactly 7 or 8 digits (matching IMDb's documented format).
- **Poster images**: OMDB provides poster URLs hosted on Amazon's CDN. These are allowlisted in `next.config.ts` for `next/image` optimisation.
- **Review length**: Each review is trimmed to 600 characters before being sent to the AI to keep the prompt within token limits while preserving meaning.
