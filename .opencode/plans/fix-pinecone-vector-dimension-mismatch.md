# Fix Pinecone vector dimension mismatch

## Problem

Pinecone index expects 768-dim vectors, but `text-embedding-3-small`
defaults to 1536 dimensions. Results in:
`PineconeBadRequestError: Vector dimension 1536 does not match
the dimension of the index 768`

## Root cause

`lib/ai/embedding.ts:23-26` — `OpenAIEmbeddings` instantiated without
`dimensions` parameter. OpenAI's `text-embedding-3-small` supports
truncated dimensions via the `dimensions` API param.

## Fix

Add `dimensions: 768` to the `OpenAIEmbeddings` constructor options.

## Files changed

- `lib/ai/embedding.ts` — add `dimensions: 768` to OpenAIEmbeddings config
