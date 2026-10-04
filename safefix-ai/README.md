# SafeFix AI

AI-powered home safety and troubleshooting. Upload a photo of a household problem, add an optional description, and Google Gemini returns a structured safety assessment.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS and the Google Gemini API.

## Run locally

```bash
npm install
cp .env.example .env.local   # then add your key
npm run dev
```

Open http://localhost:3000. Get a free key at https://aistudio.google.com/apikey.

## Environment variables

| Name | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | yes | Used only in `app/api/analyze/route.ts` (server-side). |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.5-flash`. Any vision-capable Gemini model works. |

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import it at https://vercel.com/new (framework: Next.js, no config needed).
3. Add `GEMINI_API_KEY` under Project Settings > Environment Variables.
4. Deploy.

## How it works

- `POST /api/analyze` accepts `multipart/form-data` (`image`, `description`), calls Gemini with the image and text, requests JSON-only output, then validates it (`lib/validate.ts`).
- Images are downscaled in the browser to stay under Vercel's ~4.5 MB request limit.
- High and critical results always set `professionalHelp: true`.
- `Try Demo` (`/analyze?demo=1`) shows a static, clearly labelled example. It does not call Gemini.
