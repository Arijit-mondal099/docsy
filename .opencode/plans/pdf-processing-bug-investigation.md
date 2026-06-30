━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUG REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Root cause:
The PDF processing in `lib/ai/embedding.ts` uses `@langchain/community/document_loaders/fs/pdf` (PDFLoader) which internally depends on `pdf-parse@2.4.5`, which in turn depends on `pdfjs-dist@5.4.296`. The `pdfjs-dist` package requires a worker file (`pdf.worker.mjs`) that uses native bindings (`@napi-rs/canvas` as optional dependency). In Next.js standalone builds (used for Vercel deployment), the worker file cannot be resolved because the standalone output doesn't include the worker chunk properly, causing the error:

```
Error: Setting up fake worker failed: "Cannot find module 'D:\code\projects\chat-with-pdf\.next\dev\server\chunks\pdf.worker.mjs' imported from D:\code\projects\chat-with-pdf\.next\dev\server\chunks\1ie6_pdfjs-dist_legacy_build_pdf_mjs_0ge00ru._.js"
```

This is a known issue with `pdf-parse`/`pdfjs-dist` on Vercel/Next.js standalone builds — the worker file with native bindings cannot be resolved in the serverless/standalone environment.

Call chain:
app/api/documents/upload/route.ts → lib/ai/embedding.ts:processAndStoreDocument() → lib/ai/embedding.ts:PDFLoader.load() → @langchain/community/document_loaders/fs/pdf → pdf-parse → pdfjs-dist (worker fails)

Why it happens:

- `@langchain/community/document_loaders/fs/pdf` (PDFLoader) internally uses `pdf-parse`
- `pdf-parse@2.4.5` depends on `pdfjs-dist@5.4.296`
- `pdfjs-dist@5.4.296` has an optional dependency on `@napi-rs/canvas` (native bindings)
- The pdf.js worker requires native canvas bindings that don't work in Vercel's serverless environment or Next.js standalone output
- The Next.js standalone build output (`.next/standalone`) doesn't properly bundle the pdf.js worker chunk

Fix:
Replace `@langchain/community/document_loaders/fs/pdf` (PDFLoader) with `unpdf` for PDF text extraction. The project's own AI engineer agent guidance (`.opencode/agents/ai-engineer.md`) explicitly states: "Always use `unpdf`, not `pdf-parse` — `pdf-parse` uses binary dependencies that fail on Vercel serverless — `unpdf` is pure JS."

Replace in `lib/ai/embedding.ts`:

- Remove: `import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"`
- Add: `import { extractText } from "unpdf"`
- Replace PDFLoader.load() with extractText(buffer)

Risk:

- Need to install `unpdf` package (not currently in package.json)
- Need to verify chunking logic still works correctly with unpdf's output format (returns plain text, not Document objects)
- Need to update chunking to work with plain text instead of LangChain Document objects
- Low risk: This only affects PDF ingestion; chat/retrieval unchanged

What NOT to change:

- Do NOT modify the chunking logic in `lib/ai/embedding.ts` (RecursiveCharacterTextSplitter) - it works on plain text
- Do NOT change Pinecone upsert logic
- Do NOT change the upload API route structure
- Do NOT modify any other files in lib/ai/ or app/api/
