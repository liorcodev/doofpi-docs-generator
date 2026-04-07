import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";

const d = new Doofpi();

// ─── Routes ──────────────────────────────────────────────────────────────────

// z.date() – a plain date schema
const routesWithZodDate = d.routes({
  findByDate: d.endpointBuilder
    .model({ input: z.object({ from: z.date(), to: z.date() }) })
    .read(() => "ok"),
});

// z.coerce.date() – the most common culprit (uses a transform internally)
const routesWithCoerceDate = d.routes({
  findByCoerceDate: d.endpointBuilder
    .model({ input: z.object({ createdAt: z.coerce.date() }) })
    .read(() => "ok"),
});

// z.coerce.date() as an optional field
const routesWithOptionalDate = d.routes({
  findOptional: d.endpointBuilder
    .model({
      input: z.object({
        name: z.string(),
        updatedAt: z.coerce.date().optional(),
      }),
    })
    .read(() => "ok"),
});

// Mixed: a date field together with other normal fields
const routesMixed = d.routes({
  create: d.endpointBuilder
    .model({
      input: z.object({
        title: z.string(),
        count: z.number(),
        active: z.boolean(),
        publishedAt: z.coerce.date(),
        expiresAt: z.date().optional(),
      }),
    })
    .write(() => ({ id: 1 })),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parsedInput(routes: ReturnType<typeof collectRoutes>, path: string) {
  const route = routes.find((r) => r.path === path);
  expect(route).toBeDefined();
  const schema = JSON.parse(route!.inputSchema!);
  return schema;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("zod Date support", () => {
  test("does NOT throw when schema contains z.date()", () => {
    expect(() => collectRoutes(routesWithZodDate)).not.toThrow();
  });

  test("does NOT throw when schema contains z.coerce.date()", () => {
    expect(() => collectRoutes(routesWithCoerceDate)).not.toThrow();
  });

  test('z.date() fields are represented as { type: "string", format: "date-time" }', () => {
    const schema = parsedInput(collectRoutes(routesWithZodDate), "findByDate");
    expect(schema.properties.from).toMatchObject({
      type: "string",
      format: "date-time",
    });
    expect(schema.properties.to).toMatchObject({
      type: "string",
      format: "date-time",
    });
  });

  test('z.coerce.date() fields are represented as { type: "string", format: "date-time" }', () => {
    const schema = parsedInput(
      collectRoutes(routesWithCoerceDate),
      "findByCoerceDate",
    );
    expect(schema.properties.createdAt).toMatchObject({
      type: "string",
      format: "date-time",
    });
  });

  test('optional z.coerce.date() fields are represented as { type: "string", format: "date-time" }', () => {
    const schema = parsedInput(
      collectRoutes(routesWithOptionalDate),
      "findOptional",
    );
    // Optional fields become anyOf/oneOf with null, but the date part must still be string+date-time
    const updatedAt = schema.properties.updatedAt;
    const dateSchema = updatedAt?.anyOf
      ? updatedAt.anyOf.find((s: any) => s.type === "string")
      : updatedAt;
    expect(dateSchema).toMatchObject({ type: "string", format: "date-time" });
  });

  test("inputSchema is produced (not undefined) when date fields are present", () => {
    const routes = collectRoutes(routesWithZodDate);
    const route = routes.find((r) => r.path === "findByDate");
    expect(route?.inputSchema).toBeDefined();
  });

  test("example value for date fields is an ISO 8601 string", () => {
    const routes = collectRoutes(routesWithZodDate);
    const route = routes.find((r) => r.path === "findByDate");
    expect(route?.inputExample).toBeDefined();
    const example = JSON.parse(route!.inputExample!);
    expect(() => new Date(example.from)).not.toThrow();
    expect(new Date(example.from).toISOString()).toBe(example.from);
  });

  test("mixed schema with dates, strings, numbers, booleans works end-to-end", () => {
    expect(() => collectRoutes(routesMixed)).not.toThrow();
    const schema = parsedInput(collectRoutes(routesMixed), "create");
    expect(schema.properties.title).toMatchObject({ type: "string" });
    expect(schema.properties.count).toMatchObject({ type: "number" });
    expect(schema.properties.active).toMatchObject({ type: "boolean" });
    expect(schema.properties.publishedAt).toMatchObject({
      type: "string",
      format: "date-time",
    });
  });
});
