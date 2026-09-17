<div align="center">

<h1>
  <img src="./assets/logo.png" width="80" alt="doofpi Docs Generator logo" />
  <br/>
  doofpi Docs Generator
</h1>

<p><strong>Generate interactive, zero-config API documentation with a built-in testing playground for doofpi APIs</strong></p>

<p>
  <a href="https://www.npmjs.com/package/doofpi-docs-generator">
    <img src="https://img.shields.io/npm/v/doofpi-docs-generator?style=flat-square&color=5a67d8" alt="npm version" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License: MIT" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
</p>

</div>

<br/>

## Installation

```bash
bun install doofpi-docs-generator
# or
npm install doofpi-docs-generator
```

**Requirements:**

- `doofpi` ^1.0.0
- Zod v4+ (with `toJSONSchema` support)

<br/>

## Quick Start

```typescript
import { collectRoutes, generateDocsHtml } from "doofpi-docs-generator";
import { routes } from "./routes";

const routeInfo = collectRoutes(routes);
const html = generateDocsHtml(routeInfo, { title: "My API Documentation" });

app.get("/docs", (req, res) => {
  res.send(html);
});
```

```typescript
import { d } from "doofpi";
import { z } from "zod";
import type { RouteMeta } from "doofpi-docs-generator";

const doofpi = d.defineMeta<RouteMeta>();

export const routes = {
  getUser: doofpi({
    meta: {
      docs: { title: "Get User", description: "Retrieve a user by ID", tags: ["Users"] },
    },
    model: {
      input: z.object({ userId: z.string() }),
      output: z.object({ id: z.string(), name: z.string() }),
    },
    read: async ({ input }) => {
      // Implementation
    },
  }),
};
```

Open `/docs` in your browser: every endpoint gets a testing panel (configurable base URL, headers,
auto-filled request bodies), copy-paste code snippets (cURL / fetch / doofpi client), response
schema validation, and per-endpoint request history.

<br/>

## API Reference

- `collectRoutes(routes)` - Traverses a doofpi `routes` object and returns `RouteInfo[]` with
  input/output JSON schemas, TypeScript types, and generated examples.
- `generateDocsHtml(routes, options?)` - Renders the full interactive documentation page. `options`
  accepts `title`.
- `generateSnippets(route, options?)` / `generateCurlSnippet` / `generateFetchSnippet` /
  `generateDoofpiClientSnippet` - Generate ready-to-copy call snippets for a single route.
- `validateAgainstSchema(data, schema, path?)` - Validates a value against a JSON Schema object,
  returning a list of human-readable mismatch messages (empty when it matches).
- Types: `RouteMeta`, `DocsGeneratorOptions`, `RouteInfo`, `SnippetOptions`, `RouteSnippets`.

<br/>

## Troubleshooting

- **"Failed to fetch" / CORS errors** - Make sure the configured base URL's host matches exactly how
  you're accessing the docs (don't mix `localhost` and `127.0.0.1`), and that your API allows CORS
  from the docs origin.
- **404 Not Found** - The base URL must include your doofpi root mount path (e.g.
  `http://localhost:3000/doofpi`).
