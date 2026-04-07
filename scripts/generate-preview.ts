import Doofpi from "doofpi";
import { z } from "zod";
import { writeFileSync } from "fs";
import { collectRoutes } from "../src/collect-routes";
import { generateDocsHtml } from "../src/generate-html";
import type { RouteMeta } from "../src/types";

const d = new Doofpi().defineMeta<RouteMeta>();

const routes = d.routes({
  health: d.endpointBuilder
    .meta({
      name: "Health Check",
      docs: {
        description: "Returns the current health status of the API.",
        tags: ["System"],
      },
    })
    .model({
      output: z.object({ status: z.literal("ok"), uptime: z.number() }),
    })
    .read(() => ({ status: "ok" as const, uptime: 0 })),

  users: {
    list: d.endpointBuilder
      .meta({
        name: "List Users",
        docs: {
          description:
            "Returns a paginated list of users. Requires admin role.",
          tags: ["Users"],
          auth: true,
          roles: ["admin"],
        },
      })
      .model({
        input: z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
          search: z.string().optional(),
        }),
        output: z.object({
          users: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              createdAt: z.string(),
            }),
          ),
          total: z.number(),
          page: z.number(),
          totalPages: z.number(),
        }),
      })
      .read(async () => ({ users: [], total: 0, page: 1, totalPages: 0 })),

    getById: d.endpointBuilder
      .meta({
        name: "Get User",
        docs: {
          description: "Retrieve a single user by their unique ID.",
          tags: ["Users"],
          auth: true,
        },
      })
      .model({
        input: z.object({ id: z.string().uuid() }),
        output: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          role: z.enum(["admin", "editor", "viewer"]),
          createdAt: z.string(),
        }),
      })
      .read(async () => ({
        id: "",
        name: "",
        email: "",
        role: "viewer" as const,
        createdAt: "",
      })),

    create: d.endpointBuilder
      .meta({
        name: "Create User",
        docs: {
          description: "Create a new user account.",
          tags: ["Users"],
          auth: true,
          roles: ["admin"],
        },
      })
      .model({
        input: z.object({
          name: z.string().min(1).max(100),
          email: z.string().email(),
          role: z.enum(["admin", "editor", "viewer"]).optional(),
          password: z.string().min(8),
        }),
        output: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        }),
      })
      .write(async () => ({ id: "", name: "", email: "" })),

    delete: d.endpointBuilder
      .meta({
        name: "Delete User",
        docs: {
          description:
            "Permanently delete a user account. This action cannot be undone.",
          tags: ["Users"],
          auth: true,
          roles: ["admin"],
          deprecated: true,
        },
      })
      .model({
        input: z.object({ id: z.string().uuid() }),
        output: z.object({ success: z.boolean() }),
      })
      .write(async () => ({ success: true })),
  },

  posts: {
    list: d.endpointBuilder
      .meta({
        name: "List Posts",
        docs: {
          description: "Returns a list of published blog posts.",
          tags: ["Posts"],
        },
      })
      .model({
        input: z.object({
          page: z.number().default(1),
          tag: z.string().optional(),
        }),
        output: z.object({
          posts: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              excerpt: z.string(),
              author: z.string(),
              publishedAt: z.string(),
              tags: z.array(z.string()),
            }),
          ),
          total: z.number(),
        }),
      })
      .read(async () => ({ posts: [], total: 0 })),

    create: d.endpointBuilder
      .meta({
        name: "Create Post",
        docs: {
          description: "Create a new blog post.",
          tags: ["Posts"],
          auth: true,
          roles: ["admin", "editor"],
        },
      })
      .model({
        input: z.object({
          title: z.string().min(1).max(200),
          content: z.string().min(1),
          tags: z.array(z.string()).optional(),
          publishedAt: z.string().optional(),
        }),
        output: z.object({
          id: z.string(),
          title: z.string(),
          slug: z.string(),
        }),
      })
      .write(async () => ({ id: "", title: "", slug: "" })),
  },

  auth: {
    login: d.endpointBuilder
      .meta({
        name: "Login",
        docs: {
          description:
            "Authenticate with email and password. Returns a session token.",
          tags: ["Auth"],
        },
      })
      .model({
        input: z.object({ email: z.string().email(), password: z.string() }),
        output: z.object({
          token: z.string(),
          expiresAt: z.string(),
          user: z.object({
            id: z.string(),
            name: z.string(),
            role: z.string(),
          }),
        }),
      })
      .write(async () => ({
        token: "",
        expiresAt: "",
        user: { id: "", name: "", role: "" },
      })),

    logout: d.endpointBuilder
      .meta({
        name: "Logout",
        docs: {
          description: "Invalidate the current session token.",
          tags: ["Auth"],
          auth: true,
        },
      })
      .model({ output: z.object({ success: z.boolean() }) })
      .write(async () => ({ success: true })),

    me: d.endpointBuilder
      .meta({
        name: "Get Current User",
        docs: {
          description: "Returns the currently authenticated user.",
          tags: ["Auth"],
          auth: true,
        },
      })
      .model({
        output: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          role: z.string(),
        }),
      })
      .read(async () => ({ id: "", name: "", email: "", role: "" })),
  },
});

const collected = collectRoutes(routes);
const html = generateDocsHtml(collected, { title: "Example doofpi API Docs" });

writeFileSync("preview.html", html, "utf-8");
