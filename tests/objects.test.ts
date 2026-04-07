import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import {
  getRoute,
  inputSchema,
  inputExample,
  inputTypeScript,
} from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  create: d.endpointBuilder
    .model({
      input: z.object({
        name: z.string(),
        age: z.number().optional(),
        role: z.string().optional(),
      }),
    })
    .write(() => ({ id: 1 })),

  empty: d.endpointBuilder.model({ input: z.object({}) }).read(() => ""),

  nested: d.endpointBuilder
    .model({
      input: z.object({
        user: z.object({
          id: z.number(),
          address: z.object({ city: z.string() }),
        }),
      }),
    })
    .read(() => ""),
});

describe("object – required vs optional fields", () => {
  test("required fields appear in schema.required", () => {
    expect(
      inputSchema(collectRoutes(routes), "create", "write").required,
    ).toContain("name");
  });

  test("optional fields are NOT in schema.required", () => {
    const required =
      inputSchema(collectRoutes(routes), "create", "write").required ?? [];
    expect(required).not.toContain("age");
    expect(required).not.toContain("role");
  });

  test("required fields appear in the JSON example", () => {
    expect(
      inputExample(collectRoutes(routes), "create", "write"),
    ).toHaveProperty("name");
  });

  test("optional fields do NOT appear in the JSON example", () => {
    const ex = inputExample(collectRoutes(routes), "create", "write");
    expect(ex).not.toHaveProperty("age");
    expect(ex).not.toHaveProperty("role");
  });

  test("optional fields appear in inputOptionalFields", () => {
    const route = getRoute(collectRoutes(routes), "create", "write");
    const names = route.inputOptionalFields?.map((f) => f.name) ?? [];
    expect(names).toContain("age");
    expect(names).toContain("role");
  });

  test("optional fields in inputOptionalFields have valid examples", () => {
    const route = getRoute(collectRoutes(routes), "create", "write");
    const ageField = route.inputOptionalFields?.find((f) => f.name === "age");
    expect(ageField).toBeDefined();
    expect(ageField!.example).toBe("0");
  });

  test("empty object → {} example", () => {
    expect(inputExample(collectRoutes(routes), "empty")).toEqual({});
  });

  test("TypeScript type has ? marker for optional fields", () => {
    const ts = inputTypeScript(collectRoutes(routes), "create", "write");
    expect(ts).toMatch(/age\?/);
    expect(ts).toMatch(/role\?/);
  });
});

describe("nested objects", () => {
  test("nested object schema has nested properties", () => {
    const schema = inputSchema(collectRoutes(routes), "nested");
    expect(schema.properties.user.type).toBe("object");
    expect(schema.properties.user.properties.id).toBeDefined();
    expect(schema.properties.user.properties.address.type).toBe("object");
  });

  test("nested object example has correct shape", () => {
    const ex = inputExample(collectRoutes(routes), "nested");
    expect(typeof ex.user).toBe("object");
    expect(ex.user.id).toBe(0);
    expect(typeof ex.user.address).toBe("object");
  });
});
