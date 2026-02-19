# DevFlow AI - API Reference

All API routes are server-side Route Handlers under `app/api/ai/`. They proxy AI calls so API keys never reach the browser.

## Authentication

No authentication required. All endpoints are open by design (no-barrier philosophy).

**BYOK (Bring Your Own Key):** Users can optionally provide their own API key via HTTP headers:

```
X-DevFlow-API-Key: <your-api-key>
X-DevFlow-Provider: gemini | groq
```

BYOK users get 5x rate limits (50 RPM vs 10 RPM).

## Response Envelope

All endpoints return a consistent `ApiResult<T>` envelope:

```json
// Success
{
  "data": { ... },
  "error": null
}

// Error
{
  "data": null,
  "error": "Error message"
}
```

## Rate Limiting

| Header | Description |
|--------|-------------|
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-RetryAfter` | Milliseconds until rate limit resets (only on 429) |

When rate-limited, the API returns HTTP 429 with:
```json
{
  "data": null,
  "error": "Rate limit exceeded. Try again in Xs."
}
```

---

## Endpoints

### POST `/api/ai/review`

AI-powered code review with structured analysis.

**Request Body:**
```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "typescript"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `code` | `string` | Required, max 50,000 chars |
| `language` | `enum` | `typescript`, `javascript`, `python`, `go`, `rust`, `java`, `php`, `csharp` |

**Response Data:**
```json
{
  "score": 75,
  "issues": [
    {
      "line": 1,
      "severity": "warning",
      "message": "Missing type annotations",
      "suggestion": "Add explicit parameter types"
    }
  ],
  "suggestions": ["Add error handling", "Use const instead of function"],
  "refactoredCode": "const add = (a: number, b: number): number => a + b;"
}
```

---

### POST `/api/ai/suggest`

AI-powered variable name suggestions or regex generation.

**Request Body (Variable Names):**
```json
{
  "context": "get the active user session token",
  "type": "variable",
  "language": "typescript",
  "mode": "variable-name"
}
```

**Request Body (Regex Generation):**
```json
{
  "context": "match a valid email address",
  "mode": "regex-generate"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `context` | `string` | Required, max 5,000 chars |
| `type` | `string` | Optional: `variable`, `function`, `constant`, `class`, `hook`, `component` |
| `language` | `string` | Optional: `typescript`, `python`, `java`, `go`, `csharp` |
| `mode` | `enum` | Required: `variable-name` or `regex-generate` |

**Response Data (Variable Names):**
```json
{
  "suggestions": [
    { "value": "activeSessionToken", "score": 92, "reasoning": "Descriptive and concise" },
    { "value": "userSessionKey", "score": 85, "reasoning": "Clear intent" }
  ]
}
```

**Response Data (Regex):**
```json
{
  "suggestions": [
    { "value": "/^[\\w.+-]+@[\\w-]+\\.[a-z]{2,}$/i", "score": 90, "reasoning": "RFC 5322 simplified" }
  ]
}
```

---

### POST `/api/ai/refine`

AI-powered prompt refinement with goal-based optimization.

**Request Body:**
```json
{
  "prompt": "Write a function that does something with users",
  "goal": "clarity"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `prompt` | `string` | Required, max 10,000 chars |
| `goal` | `enum` | `clarity`, `specificity`, `conciseness` |

**Response Data:**
```json
{
  "refinedPrompt": "Write a TypeScript function that retrieves active user profiles from a PostgreSQL database, returning an array of User objects with name, email, and last login date.",
  "score": 88,
  "changelog": [
    "Added specific language (TypeScript)",
    "Specified database technology",
    "Defined return type and fields"
  ]
}
```

---

### POST `/api/ai/tokenize`

Real BPE tokenization using `js-tiktoken`. No AI call needed.

**Request Body:**
```json
{
  "text": "Hello, world!",
  "model": "gpt-4o"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `text` | `string` | Required, max 100,000 chars |
| `model` | `enum` | `gpt-4o`, `gpt-4`, `gpt-3.5-turbo`, `cl100k_base`, `p50k_base` |

**Response Data:**
```json
{
  "model": "gpt-4o",
  "totalTokens": 4,
  "segments": [
    { "text": "Hello", "tokenId": 9906 },
    { "text": ",", "tokenId": 11 },
    { "text": " world", "tokenId": 1917 },
    { "text": "!", "tokenId": 0 }
  ]
}
```

---

### GET `/api/ai/status`

Health check endpoint. Returns AI configuration status.

**Response Data:**
```json
{
  "available": true,
  "provider": "gemini",
  "model": "gemini-2.0-flash",
  "limits": {
    "rpm": 10,
    "dailyTokens": 500000
  }
}
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Invalid request body (Zod validation failed) |
| 429 | Rate limit exceeded |
| 500 | Internal server error (AI provider failure) |
| 503 | AI not configured (no API key set) |
