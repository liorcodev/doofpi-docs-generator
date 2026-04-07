import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { inputSchema, inputExample, inputTypeScript } from "./_helpers";

const d = new Doofpi();

const Base = z.object({ id: z.number() });
const Extra = z.object({ name: z.string() });

const routes = d.routes({
  merged: d.endpointBuilder.model({ input: Base.and(Extra) }).read(() => ""),
});

describe("intersection types", () => {
  test("z.intersection does not throw", () => {
    expect(() => collectRoutes(routes)).not.toThrow();
  });

  test("intersection schema contains allOf", () => {
    const schema = inputSchema(collectRoutes(routes), "merged");
    expect(schema.allOf).toBeDefined();
    expect(Array.isArray(schema.allOf)).toBe(true);
  });

  test("intersection example has fields from both sides", () => {
    const ex = inputExample(collectRoutes(routes), "merged");
    expect(ex).toHaveProperty("id");
    expect(ex).toHaveProperty("name");
  });

  test("intersection TypeScript type contains both field names", () => {
    const ts = inputTypeScript(collectRoutes(routes), "merged");
    expect(ts).toContain("id");
    expect(ts).toContain("name");
  });
});
