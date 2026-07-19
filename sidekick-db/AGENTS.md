# Sidekick form backend — integration guide

This is a Payload CMS app (SQLite) that turns a blank PDF form into a filled one
from freeform information about a person. It is the **backend**. Your job (the
chatbot frontend) is to **talk to the user, produce a freeform "blob" describing
them, and submit it** — the backend infers the form answers, fills the PDF, and
tells you what it couldn't infer so a human can finish it.

Nothing auto-submits anywhere. The backend drafts; a human confirms.

## Mental model

Two collections:

- **`forms`** — one blank PDF form + its extracted questions. Someone uploads a
  PDF in the admin; the app extracts a `questions` spec (labels, options, PDF
  bindings). `status`: `inactive` → `extracting` → `ready`. You only use forms
  that are `ready`.
- **`submissions`** — one person's attempt at a form. You create it with a
  `form` id and an `info` blob. The app infers answers, fills the PDF, and sets
  `status`: `filling` → `ready` (or `error`). When `ready` it has `answers`
  (what it filled), `review` (what it couldn't infer — for the human), and
  `filledPdf` (a downloadable file).

Your whole integration is: **read `forms` → create a `submission` → poll it →
show the answers, the review list, and the PDF.**

## Auth

**The endpoints you use need no auth.** `forms`, `submissions`, and `media`
reads are all wide open (`access: read/create/update` return `true` — see
`src/collections/Forms.ts` and `Submissions.ts`), which is intentional for a
private ngrok / demo deployment. Quick check you're wired up:

```bash
curl "$BASE_URL/api/forms?where[status][equals]=ready"
```

A `docs` array back means you're in.

> **If the deployment is ever locked down:** the `users` collection has
> `useAPIKey: true`, so you can require a key instead — in `/admin` open your
> user, enable **API Key**, and send it on every request:
> `Authorization: users API-Key <THE_KEY>`.

## The endpoints you use

Base URL is wherever the app runs — dev: `http://localhost:3000`; remote demo:
an ngrok URL like `https://abc123.ngrok-free.app`. Standard Payload REST.

### 1. List available forms

```
GET /api/forms?where[status][equals]=ready
```

Response (trimmed):

```json
{ "docs": [ { "id": 1, "title": "CA DMV Disabled Placard", "status": "ready",
              "questions": { "formTitle": "...", "questions": [ ... ] } } ] }
```

### 2. Read a form's questions (to guide the conversation)

The form's `questions.questions` array is what the form needs. Each item:

```json
{ "id": "applicantName",
  "label": "What is the applicant's full legal name (Last, First, Middle)?",
  "inputType": "text",              // "text" | "date" | "choice"
  "options": ["Permanent", "..."],  // present for "choice"
  "help": "..." }                   // optional context
```

Use these labels to decide what to ask the user about. You do **not** answer them
directly — you gather info and hand it over as a blob (next step).

### 3. Create a submission (this is the main call)

```
POST /api/submissions
Content-Type: application/json

{ "form": 1, "info": "<the freeform blob you assembled>" }
```

Returns immediately with the created doc at `status: "filling"`:

```json
{ "doc": { "id": 7, "status": "filling", "form": 1 }, "message": "..." }
```

### 4. Poll until it's done

```
GET /api/submissions/7
```

Poll every ~2s until `status` is `ready` or `error` (inference takes a few
seconds). When `ready`:

```json
{ "id": 7, "status": "ready",
  "answers": { "applicantName": "Doe, Jane", "physicalCity": "Sacramento", ... },
  "review": [ { "id": "vin", "label": "What is the Vehicle Identification Number?" }, ... ],
  "filledPdf": { "id": 3, "url": "/api/media/file/filled-7-....pdf", "filename": "..." } }
```

(`filledPdf` is populated at the default `depth=1`; `url` is directly usable.)

### 5. Show the result

- `answers` — the fields it filled. Show them for confirmation (human-in-the-loop).
- `review` — the questions it could NOT infer. Ask the user these, then either
  create a **new submission** with a fuller blob, or let the human complete them
  on the PDF.
- `filledPdf.url` — link/embed the filled PDF (`<iframe src>` or a download).
  It's a path on the backend; for a remote/ngrok deployment prefix `BASE_URL`
  onto it (`"$BASE_URL" + filledPdf.url`).

## The blob — what to actually send in `info`

`info` is **freeform text**. There is no schema. The backend LLM reads it and
infers as many form answers as it honestly can; anything unsupported falls to
`review`. So:

- **More relevant detail = more auto-filled fields.** Include identity basics
  (name, DOB, address, phone, ID numbers) and any form-specific context (for a
  disability placard: the mobility condition and whether it's permanent).
- **Don't fabricate.** If the user didn't say it, leave it out — the backend
  will not invent personal facts, it will list them for review. That's correct.
- Format doesn't matter. A natural paragraph, or your raw Q/A transcript
  concatenated, both work. Example:

```
Jane Marie Doe, born 3/12/1958, lives at 123 Main St, Sacramento CA 95814.
CA driver license D1234567. Has severe COPD, can't walk more than half a block,
permanent condition. Never had a disabled placard before. Not applying for plates.
```

## Recommended chatbot loop

1. `GET /api/forms?where[status][equals]=ready` → let the user pick a form.
2. `questions[].label` tells you what the form needs → converse to collect it
   (prioritize the fields, don't interrogate — a natural chat is fine).
3. Assemble everything the user told you into one `info` blob.
4. `POST /api/submissions { form, info }`.
5. Poll `GET /api/submissions/:id` until `ready`.
6. Show `answers` (confirm), walk the user through `review` (the gaps), offer
   `filledPdf.url`.
7. If the user answers review items, submit a new submission with the augmented
   blob to fill more.

## Caveats

- Extraction/inference are live LLM calls (seconds, not instant) — always poll,
  don't assume synchronous.
- Some form sections have no fillable PDF fields (e.g. a provider's signature
  block) and won't auto-fill — they surface in `review`.
- The server needs `qpdf` and `pdftotext` (poppler) installed to read PDFs.
- A `404` on a submission id means it doesn't exist. `status: "error"` means the
  backend logged why it failed — retry with a clearer, fuller `info` blob.
