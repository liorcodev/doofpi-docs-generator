import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { inputSchema, inputExample, inputTypeScript } from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  strArr: d.endpointBuilder
    .model({ input: z.object({ tags: z.array(z.string()) }) })
    .read(() => ""),
  numArr: d.endpointBuilder
    .model({ input: z.object({ ids: z.array(z.number()) }) })
    .read(() => ""),
  objArr: d.endpointBuilder
    .model({
      input: z.object({
        items: z.array(z.object({ id: z.number(), name: z.string() })),
      }),
    })
    .read(() => ""),
});

describe("array types", () => {
  test("z.array(z.string()) → type:array in JSON schema", () => {
    expect(
      inputSchema(collectRoutes(routes), "strArr").properties.tags.type,
    ).toBe("array");
  });

  test("z.array(z.string()) items → type:string", () => {
    expect(
      inputSchema(collectRoutes(routes), "strArr").properties.tags.items.type,
    ).toBe("string");
  });

  test("z.array(z.string()) example is a JSON array", () => {
    const ex = inputExample(collectRoutes(routes), "strArr");
    expect(Array.isArray(ex.tags)).toBe(true);
    expect(ex.tags[0]).toBe("string");
  });

  test("z.array(z.number()) items → type:number|integer", () => {
    const schema = inputSchema(collectRoutes(routes), "numArr");
    expect(["number", "integer"]).toContain(schema.properties.ids.items.type);
  });

  test("z.array(z.object(...)) items → type:object", () => {
    expect(
      inputSchema(collectRoutes(routes), "objArr").properties.items.items.type,
    ).toBe("object");
  });

  test("z.array(z.string()) TypeScript type → string[] or Array<string>", () => {
    expect(inputTypeScript(collectRoutes(routes), "strArr")).toMatch(
      /string\[\]|Array<string>/,
    );
  });
});
