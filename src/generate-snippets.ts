import type { RouteInfo } from "./collect-routes.js";

/**
 * Options controlling how code snippets are generated for a route.
 */
export type SnippetOptions = {
  /**
   * Token used as a stand-in for the real endpoint base URL. Replaced at runtime (client-side)
   * once the user configures their base URL, or left as-is for the reader to substitute manually.
   * @default '{{BASE_URL}}'
   */
  baseUrlPlaceholder?: string;
};

/**
 * Ready-to-copy code snippets demonstrating how to call a single route.
 */
export type RouteSnippets = {
  curl: string;
  fetch: string;
  doofpiClient: string;
};

const DEFAULT_PLACEHOLDER = "{{BASE_URL}}";

function parseExample(inputExample?: string): unknown {
  if (!inputExample) return undefined;
  try {
    return JSON.parse(inputExample);
  } catch {
    return undefined;
  }
}

/**
 * Generate a curl command for calling the given route.
 */
export function generateCurlSnippet(
  route: RouteInfo,
  options: SnippetOptions = {},
): string {
  const placeholder = options.baseUrlPlaceholder ?? DEFAULT_PLACEHOLDER;
  const method = route.type === "read" ? "GET" : "POST";
  const input = parseExample(route.inputExample);
  const url = `${placeholder}.${route.path}`;

  if (method === "GET") {
    if (input !== undefined) {
      const encoded = encodeURIComponent(JSON.stringify(input));
      return `curl -X GET '${url}?input=${encoded}' \\\n  -H 'Content-Type: application/json'`;
    }
    return `curl -X GET '${url}' \\\n  -H 'Content-Type: application/json'`;
  }

  if (input !== undefined) {
    const body = JSON.stringify(input).replace(/'/g, "'\\''");
    return `curl -X POST '${url}' \\\n  -H 'Content-Type: application/json' \\\n  -d '${body}'`;
  }
  return `curl -X POST '${url}' \\\n  -H 'Content-Type: application/json'`;
}

/**
 * Generate a plain `fetch()` snippet for calling the given route.
 */
export function generateFetchSnippet(
  route: RouteInfo,
  options: SnippetOptions = {},
): string {
  const placeholder = options.baseUrlPlaceholder ?? DEFAULT_PLACEHOLDER;
  const method = route.type === "read" ? "GET" : "POST";
  const input = parseExample(route.inputExample);

  if (method === "GET") {
    const urlLines =
      input !== undefined
        ? `const input = ${JSON.stringify(input, null, 2)};\nconst url = '${placeholder}.${route.path}?input=' + encodeURIComponent(JSON.stringify(input));`
        : `const url = '${placeholder}.${route.path}';`;

    return `${urlLines}\n\nconst response = await fetch(url, {\n  method: 'GET',\n  headers: { 'Content-Type': 'application/json' }\n});\n\nconst data = await response.json();\nconsole.log(data);`;
  }

  const bodyOption =
    input !== undefined
      ? `,\n  body: JSON.stringify(${JSON.stringify(input, null, 2)})`
      : "";

  return `const response = await fetch('${placeholder}.${route.path}', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' }${bodyOption}\n});\n\nconst data = await response.json();\nconsole.log(data);`;
}

/**
 * Generate a `doofpi` client snippet for calling the given route using `createClient`.
 */
export function generateDoofpiClientSnippet(
  route: RouteInfo,
  options: SnippetOptions = {},
): string {
  const placeholder = options.baseUrlPlaceholder ?? DEFAULT_PLACEHOLDER;
  const input = parseExample(route.inputExample);
  const args = input !== undefined ? JSON.stringify(input, null, 2) : "";

  // baseUrlPlaceholder already includes the doofpi root path, so root is cleared here.
  const header = `import { createClient } from 'doofpi/client';\nimport type { Routes } from './routes'; // adjust to your routes' type export\n\nconst client = createClient<Routes>({ url: '${placeholder}', root: '' });\n\n`;

  return `${header}const result = await client.${route.path}.${route.type}(${args});\nconsole.log(result);`;
}

/**
 * Generate all available code snippets (curl, fetch, and doofpi client) for a single route.
 */
export function generateSnippets(
  route: RouteInfo,
  options: SnippetOptions = {},
): RouteSnippets {
  return {
    curl: generateCurlSnippet(route, options),
    fetch: generateFetchSnippet(route, options),
    doofpiClient: generateDoofpiClientSnippet(route, options),
  };
}
