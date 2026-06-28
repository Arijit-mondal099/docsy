# Phase 2 — PDF Upload

## Goal
Allow authenticated users to upload PDFs, store them in Cloudinary, parse/chunk/embed them into Pinecone, and display in the dashboard.

## Steps

### 1. Install packages
- `cloudinary`, `@pinecone-database/pinecone`, `openai`
- `@langchain/core`, `@langchain/community`, `@langchain/pinecone`, `@langchain/openai`
- `react-dropzone`, `@tanstack/react-query`

### 2. Cloudinary helper (`lib/cloudinary/index.ts`)
- Upload buffer to Cloudinary
- Return URL + public ID

### 3. AI clients (`lib/ai/`)
- `pinecone.ts` — Pinecone client init
- `openai.ts` — OpenAI client init
- `embedding.ts` — PDF parsing → chunking → embedding → Pinecone upsert pipeline
  - Fetch PDF from Cloudinary URL
  - LangChain PDFLoader to extract text
  - RecursiveCharacterTextSplitter (chunk size 1000, overlap 200)
  - OpenAI text-embedding-3-small for embeddings
  - Upsert into Pinecone namespace `doc-{documentId}`

### 4. API Routes (`app/api/documents/`)
- `POST /api/documents/upload` — validate session, MIME type (application/pdf), size (<10MB), upload to Cloudinary, create DB record (pending), process embedding pipeline, update status → ready
- `GET /api/documents` — list documents for current user, ordered by createdAt desc

### 5. Upload Dropzone (`components/pdf/UploadDropzone.tsx`)
- `react-dropzone` drag & drop area
- File validation (type, size) on client side
- Upload progress indicator
- Toast on success/error

### 6. Dashboard integration
- `app/(dashboard)/documents/page.tsx` — document list with upload dropzone
- Document card: name, status badge, page count, upload date
- Use TanStack Query (`useQuery`, `useMutation`) for data fetching

## Verification
- Upload a PDF → appears in Cloudinary dashboard
- Document record created in Neon with status "ready"
- Embeddings stored in Pinecone under `doc-{id}` namespace
- Document list in dashboard shows the uploaded file
- `pnpm build` passes

## Commit
`feat(upload): cloudinary upload endpoint with pdf parsing, embedding pipeline, and dashboard document list`
