# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-17

### Added

- **Code Snippets (cURL / fetch / doofpi Client)** - Every route now shows ready-to-copy code
  snippets in three formats, generated from the same example data used to pre-fill the test panel:
  - **cURL** - shell command using doofpi's dot-notation URLs
  - **fetch** - plain `fetch()` snippet for browsers or Node
  - **doofpi Client** - typed call using `createClient` from `doofpi/client`
  - New exports: `generateSnippets()`, `generateCurlSnippet()`, `generateFetchSnippet()`,
    `generateDoofpiClientSnippet()`, and the `SnippetOptions`/`RouteSnippets` types
- **Response Schema Validation** - After sending a test request, the response is automatically
  checked against the route's documented output schema, showing a green confirmation or a list of
  specific mismatches (missing fields, wrong types, disallowed values). New standalone export:
  `validateAgainstSchema(data, schema, path?)`
- **Request History** - Each endpoint now keeps a local history of its test requests:
  - Records timestamp, input, and response status for every request sent
  - Click any past entry to replay it and refill the request panel with that entry's input
  - Scrollable item list with an always-visible "Clear history" button
  - Persisted in `localStorage`, scoped per route
- **`.describe()` → TypeScript Comments** - Zod `.describe()` text on object properties is now
  preserved as an inline `// comment` in the generated TypeScript type output

### Fixed

- **Node.js Native ESM Compatibility** - Package now works correctly with Node.js native ESM
  resolution (Node 16+, Node 22+):
  - All relative imports now include explicit `.js` file extensions as required by the ECMAScript
    spec
  - Updated TypeScript config to use `"moduleResolution": "node16"` and `"module": "Node16"` for
    proper ESM compliance
  - Fully backward compatible with existing bundler-based workflows (Vite, webpack, Rollup, etc.)

### Chore

- Added `LICENSE` and this `CHANGELOG.md` file
- Added `test-esm.mjs` smoke test and a `test:esm` script

## [0.1.0]

- Initial release
