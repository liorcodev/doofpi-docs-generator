import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { inputTypeScript } from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  strField: d.endpointBuilder
    .model({ input: z.object({ v: z.string() }) })
    .read(() => ""),
  numField: d.endpointBuilder
    .model({ input: z.object({ v: z.number() }) })
    .read(() => 0),
  boolField: d.endpointBuilder
    .model({ input: z.object({ v: z.boolean() }) })
    .read(() => false),
  arrField: d.endpointBuilder
    .model({ input: z.object({ v: z.array(z.string()) }) })
    .read(() => ""),
  recordField: d.endpointBuilder
    .model({ input: z.object({ v: z.record(z.string(), z.number()) }) })
    .read(() => ""),
  enumField: d.endpointBuilder
    .model({ input: z.object({ v: z.enum(["a", "b", "c"]) }) })
    .read(() => ""),
  objField: d.endpointBuilder
    .model({
      input: z.object({
        v: z.object({ x: z.number(), y: z.string().optional() }),
      }),
    })
    .read(() => ""),
});

describe("TypeScript type generation", () => {
  test('string field → "string" in TypeScript', () => {
    expect(inputTypeScript(collectRoutes(routes), "strField")).toContain(
      "string",
    );
  });

  test('number field → "number" in TypeScript', () => {
    expect(inputTypeScript(collectRoutes(routes), "numField")).toContain(
      "number",
    );
  });

  test('boolean field → "boolean" in TypeScript', () => {
    expect(inputTypeScript(collectRoutes(routes), "boolField")).toContain(
      "boolean",
    );
  });

  test("array field → string[] or Array<string> in TypeScript", () => {
    expect(inputTypeScript(collectRoutes(routes), "arrField")).toMatch(
      /string\[\]|Array<string>/,
    );
  });

  test("record field → Record<string, number> in TypeScript", () => {
    const ts = inputTypeScript(collectRoutes(routes), "recordField");
    expect(ts).toContain("Record<string,");
    expect(ts).toContain("number");
  });

  test("enum field → quoted union in TypeScript", () => {
    const ts = inputTypeScript(collectRoutes(routes), "enumField");
    expect(ts).toContain('"a"');
    expect(ts).toContain('"b"');
    expect(ts).toContain('"c"');
  });

  test("object field has ? marker for optional properties", () => {
    expect(inputTypeScript(collectRoutes(routes), "objField")).toMatch(/y\?/);
  });
});
