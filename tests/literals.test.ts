import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { inputSchema, inputExample } from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  strLit: d.endpointBuilder
    .model({ input: z.object({ v: z.literal("hello") }) })
    .read(() => ""),
  numLit: d.endpointBuilder
    .model({ input: z.object({ v: z.literal(42) }) })
    .read(() => 0),
  boolLit: d.endpointBuilder
    .model({ input: z.object({ v: z.literal(true) }) })
    .read(() => false),
});

describe("literals", () => {
  test('z.literal("hello") → const:"hello" in JSON schema', () => {
    expect(
      inputSchema(collectRoutes(routes), "strLit").properties.v.const,
    ).toBe("hello");
  });

  test('z.literal("hello") → "hello" example', () => {
    expect(inputExample(collectRoutes(routes), "strLit").v).toBe("hello");
  });

  test("z.literal(42) → const:42 in JSON schema", () => {
    expect(
      inputSchema(collectRoutes(routes), "numLit").properties.v.const,
    ).toBe(42);
  });

  test("z.literal(42) → 42 example", () => {
    expect(inputExample(collectRoutes(routes), "numLit").v).toBe(42);
  });

  test("z.literal(true) → const:true in JSON schema", () => {
    expect(
      inputSchema(collectRoutes(routes), "boolLit").properties.v.const,
    ).toBe(true);
  });
});
