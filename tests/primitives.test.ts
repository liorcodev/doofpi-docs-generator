import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { inputSchema, inputExample, inputTypeScript } from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  str: d.endpointBuilder
    .model({ input: z.object({ v: z.string() }) })
    .read(() => ""),
  num: d.endpointBuilder
    .model({ input: z.object({ v: z.number() }) })
    .read(() => 0),
  bool: d.endpointBuilder
    .model({ input: z.object({ v: z.boolean() }) })
    .read(() => false),
  nullVal: d.endpointBuilder
    .model({ input: z.object({ v: z.null() }) })
    .read(() => null),
  intVal: d.endpointBuilder
    .model({ input: z.object({ v: z.number().int() }) })
    .read(() => 0),
});

describe("primitive types", () => {
  test("z.string() → type:string in JSON schema", () => {
    expect(
      inputSchema(collectRoutes(routes), "str").properties.v,
    ).toMatchObject({
      type: "string",
    });
  });

  test('z.string() → "string" example', () => {
    expect(inputExample(collectRoutes(routes), "str").v).toBe("string");
  });

  test("z.string() → string TypeScript type", () => {
    expect(inputTypeScript(collectRoutes(routes), "str")).toContain("string");
  });

  test("z.number() → type:number in JSON schema", () => {
    const schema = inputSchema(collectRoutes(routes), "num");
    expect(["number", "integer"]).toContain(schema.properties.v.type);
  });

  test("z.number() → 0 example", () => {
    expect(inputExample(collectRoutes(routes), "num").v).toBe(0);
  });

  test("z.boolean() → type:boolean in JSON schema", () => {
    expect(
      inputSchema(collectRoutes(routes), "bool").properties.v,
    ).toMatchObject({
      type: "boolean",
    });
  });

  test("z.boolean() → true example", () => {
    expect(inputExample(collectRoutes(routes), "bool").v).toBe(true);
  });

  test("z.null() → type:null in JSON schema", () => {
    expect(
      inputSchema(collectRoutes(routes), "nullVal").properties.v,
    ).toMatchObject({
      type: "null",
    });
  });

  test("z.null() → null example", () => {
    expect(inputExample(collectRoutes(routes), "nullVal").v).toBeNull();
  });

  test("z.number().int() → type:integer or number in JSON schema", () => {
    const schema = inputSchema(collectRoutes(routes), "intVal");
    expect(["number", "integer"]).toContain(schema.properties.v.type);
  });
});
