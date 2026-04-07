import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { inputSchema, inputExample, inputTypeScript } from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  strRec: d.endpointBuilder
    .model({ input: z.object({ map: z.record(z.string(), z.string()) }) })
    .read(() => ""),
  numRec: d.endpointBuilder
    .model({ input: z.object({ scores: z.record(z.string(), z.number()) }) })
    .read(() => ""),
  objRec: d.endpointBuilder
    .model({
      input: z.object({
        data: z.record(z.string(), z.object({ val: z.boolean() })),
      }),
    })
    .read(() => ""),
});

describe("record types", () => {
  test("z.record() → type:object in JSON schema", () => {
    expect(
      inputSchema(collectRoutes(routes), "strRec").properties.map.type,
    ).toBe("object");
  });

  test("z.record(z.string(), z.string()) → additionalProperties.type:string", () => {
    expect(
      inputSchema(collectRoutes(routes), "strRec").properties.map
        .additionalProperties,
    ).toMatchObject({ type: "string" });
  });

  test("z.record(z.string(), z.number()) → additionalProperties.type:number|integer", () => {
    const schema = inputSchema(collectRoutes(routes), "numRec");
    expect(["number", "integer"]).toContain(
      schema.properties.scores.additionalProperties.type,
    );
  });

  test("z.record() example is an object with at least one key", () => {
    const ex = inputExample(collectRoutes(routes), "strRec");
    expect(typeof ex.map).toBe("object");
    expect(Object.keys(ex.map).length).toBeGreaterThan(0);
  });

  test("z.record() TypeScript type → Record<string, ...>", () => {
    expect(inputTypeScript(collectRoutes(routes), "strRec")).toContain(
      "Record<string,",
    );
  });
});
