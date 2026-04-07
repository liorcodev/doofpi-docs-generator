import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { getRoute, outputSchema } from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  getUser: d.endpointBuilder
    .model({
      input: z.object({ id: z.string() }),
      output: z.object({
        id: z.string(),
        name: z.string(),
        age: z.number().optional(),
      }),
    })
    .read(() => ({ id: "1", name: "Alice" })),
  noOutput: d.endpointBuilder
    .model({ input: z.object({ id: z.string() }) })
    .read(() => ""),
});

describe("output schemas", () => {
  test("outputSchema is defined when output is set in .model()", () => {
    expect(
      getRoute(collectRoutes(routes), "getUser").outputSchema,
    ).toBeDefined();
  });

  test("outputSchema has correct types", () => {
    const schema = outputSchema(collectRoutes(routes), "getUser");
    expect(schema.properties.id).toMatchObject({ type: "string" });
    expect(schema.properties.name).toMatchObject({ type: "string" });
  });

  test("outputExample is generated for output schemas", () => {
    const route = getRoute(collectRoutes(routes), "getUser");
    expect(route.outputExample).toBeDefined();
    const ex = JSON.parse(route.outputExample!);
    expect(ex).toHaveProperty("id");
    expect(ex).toHaveProperty("name");
  });

  test("outputOptionalFields lists optional output fields", () => {
    const route = getRoute(collectRoutes(routes), "getUser");
    const names = route.outputOptionalFields?.map((f) => f.name) ?? [];
    expect(names).toContain("age");
  });

  test("outputSchema is undefined when output is not set in .model()", () => {
    expect(
      getRoute(collectRoutes(routes), "noOutput").outputSchema,
    ).toBeUndefined();
  });
});
