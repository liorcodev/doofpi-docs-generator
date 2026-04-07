import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import { type RouteMeta } from "../src/types";
import { getRoute } from "./_helpers";

const d = new Doofpi().defineMeta<RouteMeta>();

const routes = d.routes({
  readEndpoint: d.endpointBuilder
    .meta({
      name: "Get Item",
      docs: { description: "Fetches an item", tags: ["items"], auth: true },
    })
    .model({ input: z.object({ id: z.string() }) })
    .read(() => ""),
  writeEndpoint: d.endpointBuilder
    .model({ input: z.object({ name: z.string() }) })
    .write(() => ({ id: 1 })),
  noInput: d.endpointBuilder.read(() => "ok"),
});

describe("route metadata", () => {
  test('read endpoint has type "read"', () => {
    expect(getRoute(collectRoutes(routes), "readEndpoint").type).toBe("read");
  });

  test('write endpoint has type "write"', () => {
    expect(getRoute(collectRoutes(routes), "writeEndpoint").type).toBe("write");
  });

  test("meta fields are extracted correctly", () => {
    const route = getRoute(collectRoutes(routes), "readEndpoint");
    expect(route.meta?.name).toBe("Get Item");
    expect(route.meta?.docs?.description).toBe("Fetches an item");
    expect(route.meta?.docs?.tags).toEqual(["items"]);
    expect(route.meta?.docs?.auth).toBe(true);
  });

  test("endpoint without .meta() has undefined meta", () => {
    expect(
      getRoute(collectRoutes(routes), "writeEndpoint").meta,
    ).toBeUndefined();
  });

  test("endpoint without input model has undefined inputSchema", () => {
    expect(
      getRoute(collectRoutes(routes), "noInput").inputSchema,
    ).toBeUndefined();
  });

  test("endpoint without input model has undefined inputExample", () => {
    expect(
      getRoute(collectRoutes(routes), "noInput").inputExample,
    ).toBeUndefined();
  });

  test("all routes in routes object are collected", () => {
    const collected = collectRoutes(routes);
    expect(collected.some((r) => r.path === "readEndpoint")).toBe(true);
    expect(collected.some((r) => r.path === "writeEndpoint")).toBe(true);
    expect(collected.some((r) => r.path === "noInput")).toBe(true);
  });
});
