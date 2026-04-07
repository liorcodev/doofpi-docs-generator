<div align="center">

<h1>
  <img src="./assets/logo.png" width="80" alt="doofpi Docs Generator logo" />
  <br/>
  doofpi Docs Generator
</h1>

<p><strong>Automatically generate beautiful, interactive documentation for your doofpi APIs</strong></p>

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

<p>
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#examples">Examples</a>
</p>

</div>

<br/>

## Why doofpi Docs Generator?

Building great APIs is one thing - documenting AND testing them shouldn't be hard. **doofpi Docs
Generator** automatically creates stunning, **fully interactive** documentation from your doofpi
routes with zero configuration. Not only does it document your API, but it also provides a
**built-in API testing playground** right in the browser!

- ⚡️ **Zero Config** - Works out of the box with any doofpi router
- 🧪 **Interactive Testing** - **Test endpoints directly in the browser with live fetch requests**
- 🔍 **Search & Filter** - Instantly find endpoints with real-time search and smart filters
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 🧠 **Smart Schema Inference** - Automatically extracts types from Zod validators
- 📝 **Auto-Filled Examples** - Pre-filled JSON with required fields, click to add optional fields
- 🔐 **Header Management** - Add custom headers (auth tokens, etc.), save and reuse them
- 🌐 **Deploy Anywhere** - Works with Express, Bun, Cloudflare Workers, and more

<br/>

## Features

### 🧪 Interactive API Testing Playground

**THE FEATURE** - Test your API endpoints directly from the documentation:

- **Live Fetch Requests** - Send real HTTP requests to your API with a single click
- **Pre-filled Request Bodies** - JSON automatically populated with required fields from schemas
- **Optional Fields Manager** - Click badges to instantly add optional fields to your request
- **Custom Headers** - Add authentication tokens, content-types, and custom headers
- **Header Persistence** - Save common headers (like auth tokens) and reuse them across endpoints
- **Real-time Responses** - See formatted JSON responses with status codes and error details
- **Auto-Method Detection** - Uses GET for reads, POST for writes automatically
- **Configurable Endpoint** - Point to localhost, staging, or production with one setting
- **Debug Information** - Shows full request details (URL, headers, body) on errors

### 🎯 Automatic Schema Extraction

Powered by Zod's `toJSONSchema()` method, the generator automatically:

- Extracts input/output schemas from your endpoints
- Generates realistic JSON examples with proper types
- Creates TypeScript type definitions
- Identifies optional vs required fields
- Handles complex types (unions, intersections, arrays, enums, records)
- **Date fields** - `z.date()` and `z.coerce.date()` are represented as ISO 8601 strings
  (`{ type: "string", format: "date-time" }`), matching how doofpi transports dates over the wire

### 🔍 Search & Filter System

Quickly find what you need in large APIs:

- **Real-time Search** - Filter endpoints by name, path, description, or tags as you type
- **Smart Filters** - Filter by type (read/write), auth status (public/protected), or custom tags
- **Filter Persistence** - Your filter selections are saved across page reloads
- **Visual Feedback** - Active filters highlighted in blue, clear button turns red when active
- **Dynamic Results** - Shows count of visible endpoints and auto-hides empty sections

### 🎨 Modern, Beautiful UI

- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Sidebar Navigation** - Organized by route groups with smooth scrolling
- **Expandable Cards** - Click to reveal detailed schema information
- **Type Badges** - Visual indicators for read/write endpoints
- **Auth & Role Badges** - Clearly shows protected routes and permissions
- **Deprecation Warnings** - Highlights deprecated endpoints
- **Dark-optimized Syntax** - Code blocks with syntax highlighting

### 📊 Smart Grouping

Routes are automatically organized by:

- **Tags** - Group related endpoints together
- **Endpoint Type** - Separate reads and writes
- **Statistics** - See route counts at a glance

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

### Basic Usage

```typescript
import { collectRoutes, generateDocsHtml } from "doofpi-docs-generator";
import { routes } from "./routes";

// 1. Collect route information from your routes
const routeInfo = collectRoutes(routes);

// 2. Generate HTML documentation
const html = generateDocsHtml(routeInfo, {
  title: "My API Documentation",
});

// 3. Serve it however you like
app.get("/docs", (req, res) => {
  res.send(html);
});
```

### Example Routes

```typescript
import { d } from "doofpi";
import { z } from "zod";
import type { RouteMeta } from "doofpi-docs-generator";

const doofpi = d.defineMeta<RouteMeta>();

export const routes = {
  // Read endpoint with metadata
  getUser: doofpi({
    meta: {
      docs: {
        title: "Get User",
        description: "Retrieve user information by ID",
        tags: ["Users"],
        auth: true,
      },
    },
    model: {
      input: z.object({ userId: z.string() }),
      output: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
      }),
    },
    read: async ({ input }) => {
      // Implementation
    },
  }),

  // Write endpoint example
  createPost: doofpi({
    meta: {
      docs: {
        title: "Create Post",
        description: "Create a new blog post",
        tags: ["Posts"],
        auth: true,
        roles: ["admin", "editor"],
      },
    },
    model: {
      input: z.object({
        title: z.string(),
        content: z.string(),
        published: z.boolean().optional(),
      }),
      output: z.object({
        id: z.string(),
        title: z.string(),
        createdAt: z.string(),
      }),
    },
    write: async ({ input }) => {
      // Implementation
    },
  }),
};
```

<br/>

## 🧪 Testing Your API

Every endpoint in the generated docs includes a **fully functional testing panel**:

### How to Test Endpoints

1. **Open the docs** - Navigate to your `/docs` endpoint
2. **Configure base URL** - Click the gear icon (top-right) and enter your API endpoint (e.g.,
   `http://127.0.0.1:3000/api`)
3. **Click any endpoint** - Expand the route card to see the testing panel
4. **Edit the request** - Pre-filled JSON is ready, modify as needed or click badges to add optional
   fields
5. **Add headers** (optional) - Add auth tokens or custom headers
6. **Click "Send Request"** - See real-time response!

### Header Management

```typescript
// Add custom headers for authenticated endpoints:
// 1. Click "Add Header" button
// 2. Enter: Authorization | Bearer your-token-here
// 3. Click "Save Headers" to persist for future requests
// 4. Use "Load Saved" on other endpoints to reuse headers
```

### Response Handling

The testing panel shows:

- ✅ **Success responses** - Green badge with formatted JSON
- ❌ **Error responses** - Red badge with error details and full request debug info
- 🔍 **Network errors** - Clear error messages with troubleshooting tips

<br/>

## Deployment Examples

### Express.js

```typescript
import express from "express";
import { collectRoutes, generateDocsHtml } from "doofpi-docs-generator";
import { routes } from "./routes";

const app = express();

app.get("/docs", (req, res) => {
  const routeInfo = collectRoutes(routes);
  const html = generateDocsHtml(routeInfo, {
    title: "My API Docs",
  });
  res.send(html);
});

app.listen(3000);
```

### Bun HTTP Server

```typescript
import { collectRoutes, generateDocsHtml } from "doofpi-docs-generator";
import { routes } from "./routes";

Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/docs") {
      const routeInfo = collectRoutes(routes);
      const html = generateDocsHtml(routeInfo, {
        title: "API Documentation",
      });
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Handle API requests...
  },
});
```

### Cloudflare Workers

```typescript
import { collectRoutes, generateDocsHtml } from "doofpi-docs-generator";
import { routes } from "./routes";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Serve docs
    if (url.pathname === "/docs") {
      const routeInfo = collectRoutes(routes);
      const html = generateDocsHtml(routeInfo, {
        title: "API Documentation",
      });
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Handle API requests...
  },
};
```

<br/>

## Troubleshooting

### Testing Panel Issues

**"Failed to fetch" or CORS errors**:

- Ensure the base URL hostname matches exactly how you're accessing the docs
  - If docs are at `http://localhost:3000/docs`, use `http://localhost:3000/api`
  - Don't mix `localhost` and `127.0.0.1` - this causes origin mismatch
- Verify your API server has CORS configured to allow requests from the docs origin
- Check browser console for specific CORS error messages

**404 Not Found**:

- Verify the complete mount path is included in base URL
  - If API is at `/api`, use `http://localhost:3000/api`, not just `http://localhost:3000`
- Ensure your API server is actually running
- Test the endpoint directly with curl or Postman to verify it works

**Base URL not saving**:

- Check browser console for localStorage errors
- Ensure you're using a modern browser with localStorage support
- Try clearing browser cache and reconfiguring

**Invalid JSON errors**:

- Ensure proper JSON syntax with double quotes for keys and string values
- Use the browser's JSON formatter or validator to check your input
- The testing panel validates JSON before sending

<br/>

## API Reference

### `collectRoutes(routes: DoofpiRoutes): RouteInfo[]`

Collects route information from doofpi routes by traversing all endpoints.

**Parameters:**

- `routes` - Your doofpi routes object

**Returns:**

- Array of `RouteInfo` objects containing:
  - `path` - Route path (e.g., `'users.getById'`)
  - `type` - Endpoint type (`'read'` | `'write'`)
  - `meta` - Metadata object (if provided)
  - `inputSchema` - JSON schema for input (if Zod validator exists)
  - `outputSchema` - JSON schema for output (if Zod validator exists)
  - `inputExample` - Auto-generated JSON example of input
  - `outputExample` - Auto-generated JSON example of output
  - `inputTypeScript` - TypeScript type representation of input
  - `outputTypeScript` - TypeScript type representation of output
  - `inputOptionalFields` - List of optional input fields with examples
  - `outputOptionalFields` - List of optional output fields with examples

### `generateDocsHtml(routes: RouteInfo[], options?: DocsGeneratorOptions): string`

Generates a complete HTML documentation page from route information.

**Parameters:**

- `routes` - Array of route information from `collectRoutes()`
- `options` - Optional configuration:
  - `title` - Page title (default: `'API Documentation'`)

**Returns:**

- Complete HTML string ready to serve

### `RouteMeta` Type

Type definition for route metadata (use with `d.defineMeta<RouteMeta>()`):

```typescript
type RouteMeta = {
  /** Documentation metadata */
  docs?: {
    /** Human-readable title for the route */
    title?: string;
    /** Description of what the route does */
    description?: string;
    /** Tags for grouping routes */
    tags?: string[];
    /** Whether this route is deprecated */
    deprecated?: boolean;
    /** Whether this route requires authentication */
    auth?: boolean;
    /** Roles allowed to access this route */
    roles?: string[];
  };
};
```

<br/>

## Examples

### Full Featured Routes

```typescript
import { d } from "doofpi";
import { z } from "zod";
import type { RouteMeta } from "doofpi-docs-generator";

const doofpi = d.defineMeta<RouteMeta>();

export const routes = {
  // Public endpoint
  health: doofpi({
    meta: {
      docs: {
        title: "Health Check",
        description: "Check if the API is running",
        tags: ["System"],
      },
    },
    model: {
      output: z.object({ status: z.literal("ok") }),
    },
    read: () => ({ status: "ok" as const }),
  }),

  // Protected endpoint
  users: {
    list: doofpi({
      meta: {
        docs: {
          title: "List Users",
          description: "Get a paginated list of users",
          tags: ["Users"],
          auth: true,
          roles: ["admin"],
        },
      },
      model: {
        input: z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
          search: z.string().optional(),
        }),
        output: z.object({
          users: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string().email(),
            }),
          ),
          total: z.number(),
          page: z.number(),
          totalPages: z.number(),
        }),
      },
      read: async ({ input }) => {
        // Implementation
      },
    }),

    // Deprecated endpoint
    getByEmail: doofpi({
      meta: {
        docs: {
          title: "Get User by Email",
          description: "Retrieve user by email address",
          tags: ["Users"],
          deprecated: true,
          auth: true,
        },
      },
      model: {
        input: z.object({ email: z.string().email() }),
        output: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        }),
      },
      read: async ({ input }) => {
        // Implementation
      },
    }),
  },
};
```

### Complex Schemas

The generator handles complex Zod schemas:

```typescript
doofpi({
  model: {
    input: z.object({
      // Unions
      status: z.union([z.literal("active"), z.literal("inactive")]),
      // Enums
      role: z.enum(["admin", "user", "guest"]),
      // Intersections
      profile: z
        .object({ name: z.string() })
        .and(z.object({ age: z.number() })),
      // Arrays
      tags: z.array(z.string()),
      // Nested objects
      settings: z.object({
        notifications: z.object({
          email: z.boolean(),
          push: z.boolean(),
        }),
      }),
      // Records (key-value maps)
      metadata: z.record(z.string(), z.string()).optional(),
    }),
  },
});
```

<br/>

## How It Works

1. **Route Collection** - `collectRoutes()` traverses your doofpi routes' structure to extract all
   endpoints and their metadata

2. **Schema Inference** - Uses Zod's `toJSONSchema()` method (Zod v4+) to convert Zod validators
   into JSON Schema format

3. **Example Generation** - Automatically generates:
   - Realistic JSON examples from schemas
   - TypeScript type definitions
   - Lists of optional fields

4. **HTML Generation** - Creates a beautiful, self-contained HTML page with:
   - Embedded CSS (no external dependencies)
   - Interactive JavaScript for expandable cards and navigation
   - Responsive design
   - Organized sections and groups

<br/>

## Best Practices

### 1. Add Rich Metadata

```typescript
doofpi({
  meta: {
    docs: {
      title: "Create User", // Clear, readable title
      description: "Creates a new user account with the provided information",
      tags: ["Users", "Authentication"], // Logical grouping
      auth: true, // Show auth requirement
      roles: ["admin"], // Show role requirements
    },
  },
});
```

### 2. Mark Deprecated Routes

```typescript
doofpi({
  meta: {
    docs: {
      deprecated: true,
      description: "Use users.getById instead",
    },
  },
});
```

### 3. Group Related Routes with Tags

```typescript
const routes = {
  // All auth-related routes
  login: doofpi({ meta: { docs: { tags: ["Authentication"] } } }),
  logout: doofpi({ meta: { docs: { tags: ["Authentication"] } } }),
  register: doofpi({ meta: { docs: { tags: ["Authentication"] } } }),

  // All user-related routes
  getUser: doofpi({ meta: { docs: { tags: ["Users"] } } }),
  updateUser: doofpi({ meta: { docs: { tags: ["Users"] } } }),
  deleteUser: doofpi({ meta: { docs: { tags: ["Users"] } } }),
};
```

<br/>

## TypeScript Support

Fully typed with TypeScript! Import types for better developer experience:

```typescript
import type {
  RouteMeta,
  RouteInfo,
  DocsGeneratorOptions,
} from "doofpi-docs-generator";
```

<br/>

## Development

### Generating a Preview

To generate a standalone HTML preview for testing the documentation output:

```bash
bun scripts/generate-preview.ts
```

This creates `preview.html` in the root directory with example routes. Open it in your browser to
see the generated documentation without setting up a server.

The preview script includes a comprehensive example with various features like authentication,
roles, deprecated endpoints, and different schema types.

<br/>

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

<br/>

## License

MIT © Lior Cohen

<br/>

---

<div align="center">
  <sub>Built with ❤️ for the doofpi community</sub>
</div>
