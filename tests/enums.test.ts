import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { inputSchema, inputExample, inputTypeScript } from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  byStatus: d.endpointBuilder
    .model({
      input: z.object({ status: z.enum(["active", "inactive", "pending"]) }),
    })
    .read(() => ""),
});

describe("enums", () => {
  test("z.enum() → type:string in JSON schema", () => {
    expect(
      inputSchema(collectRoutes(routes), "byStatus").properties.status.type,
    ).toBe("string");
  });

  test("z.enum() → enum array in JSON schema", () => {
    expect(
      inputSchema(collectRoutes(routes), "byStatus").properties.status.enum,
    ).toEqual(["active", "inactive", "pending"]);
  });

  test("z.enum() example uses first value", () => {
    expect(inputExample(collectRoutes(routes), "byStatus").status).toBe(
      "active",
    );
  });

  test("z.enum() TypeScript type contains quoted union members", () => {
    const ts = inputTypeScript(collectRoutes(routes), "byStatus");
    expect(ts).toContain('"active"');
    expect(ts).toContain('"inactive"');
    expect(ts).toContain('"pending"');
  });
});
