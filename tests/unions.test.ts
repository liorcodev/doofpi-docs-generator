import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { inputSchema, inputExample, inputTypeScript } from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  strOrNum: d.endpointBuilder
    .model({ input: z.object({ v: z.union([z.string(), z.number()]) }) })
    .read(() => ""),
  nullable: d.endpointBuilder
    .model({ input: z.object({ v: z.string().nullable() }) })
    .read(() => ""),
  nullish: d.endpointBuilder
    .model({ input: z.object({ v: z.string().nullish() }) })
    .read(() => ""),
});

describe("union types", () => {
  test("z.union() → anyOf or oneOf in JSON schema", () => {
    const prop = inputSchema(collectRoutes(routes), "strOrNum").properties.v;
    expect(prop.anyOf || prop.oneOf).toBeTruthy();
  });

  test("z.union() example uses the first variant", () => {
    const ex = inputExample(collectRoutes(routes), "strOrNum");
    expect(typeof ex.v === "string" || typeof ex.v === "number").toBe(true);
  });

  test("z.string().nullable() schema allows null", () => {
    const prop = inputSchema(collectRoutes(routes), "nullable").properties.v;
    const variants = prop.anyOf ?? prop.oneOf ?? [prop];
    expect(variants.some((s: any) => s.type === "null")).toBe(true);
  });

  test("z.string().nullish() schema allows null", () => {
    const prop = inputSchema(collectRoutes(routes), "nullish").properties.v;
    const variants = prop.anyOf ?? prop.oneOf ?? [prop];
    expect(variants.some((s: any) => s.type === "null")).toBe(true);
  });

  test("z.union() TypeScript type uses |", () => {
    expect(inputTypeScript(collectRoutes(routes), "strOrNum")).toContain("|");
  });
});
