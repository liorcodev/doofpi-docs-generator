import { describe, test, expect } from "bun:test";
import Doofpi from "doofpi";
import { z } from "zod";
import { collectRoutes } from "../src/collect-routes";
import {
  generateCurlSnippet,
  generateFetchSnippet,
  generateDoofpiClientSnippet,
  generateSnippets,
} from "../src/generate-snippets";
import { getRoute } from "./_helpers";

const d = new Doofpi();

const routes = d.routes({
  getUser: d.endpointBuilder
    .model({ input: z.object({ id: z.string() }) })
    .read(() => ({ id: "1" })),
  createPost: d.endpointBuilder
    .model({ input: z.object({ title: z.string() }) })
    .write(() => ({ id: "1", title: "" })),
  ping: d.endpointBuilder.model({}).read(() => "pong"),
});

describe("generateCurlSnippet", () => {
  test("read with input uses GET and an encoded ?input= query param", () => {
    const route = getRoute(collectRoutes(routes), "getUser", "read");
    const snippet = generateCurlSnippet(route);
    expect(snippet).toContain("curl -X GET");
    expect(snippet).toContain("{{BASE_URL}}.getUser?input=");
  });

  test("write uses POST with a JSON -d body", () => {
    const route = getRoute(collectRoutes(routes), "createPost", "write");
    const snippet = generateCurlSnippet(route);
    expect(snippet).toContain("curl -X POST");
    expect(snippet).toContain("-d '");
    expect(snippet).toContain('"title"');
  });

  test("read without input has no ?input= query param", () => {
    const route = getRoute(collectRoutes(routes), "ping", "read");
    const snippet = generateCurlSnippet(route);
    expect(snippet).not.toContain("?input=");
  });

  test("respects a custom baseUrlPlaceholder", () => {
    const route = getRoute(collectRoutes(routes), "ping", "read");
    const snippet = generateCurlSnippet(route, {
      baseUrlPlaceholder: "http://localhost:3000/doofpi",
    });
    expect(snippet).toContain("http://localhost:3000/doofpi.ping");
  });
});

describe("generateFetchSnippet", () => {
  test("read with input builds an encodeURIComponent url", () => {
    const route = getRoute(collectRoutes(routes), "getUser", "read");
    const snippet = generateFetchSnippet(route);
    expect(snippet).toContain("method: 'GET'");
    expect(snippet).toContain("encodeURIComponent(JSON.stringify(input))");
  });

  test("write includes a JSON.stringify body option", () => {
    const route = getRoute(collectRoutes(routes), "createPost", "write");
    const snippet = generateFetchSnippet(route);
    expect(snippet).toContain("method: 'POST'");
    expect(snippet).toContain("body: JSON.stringify(");
  });

  test("read without input omits the input variable", () => {
    const route = getRoute(collectRoutes(routes), "ping", "read");
    const snippet = generateFetchSnippet(route);
    expect(snippet).not.toContain("const input =");
  });
});

describe("generateDoofpiClientSnippet", () => {
  test("read renders a .read(...) call using the dotted path", () => {
    const route = getRoute(collectRoutes(routes), "getUser", "read");
    const snippet = generateDoofpiClientSnippet(route);
    expect(snippet).toContain("client.getUser.read(");
    expect(snippet).toContain("import { createClient } from 'doofpi/client';");
  });

  test("write renders a .write(...) call", () => {
    const route = getRoute(collectRoutes(routes), "createPost", "write");
    const snippet = generateDoofpiClientSnippet(route);
    expect(snippet).toContain("client.createPost.write(");
  });
});

describe("generateSnippets", () => {
  test("returns curl, fetch, and doofpiClient snippets together", () => {
    const route = getRoute(collectRoutes(routes), "getUser", "read");
    const snippets = generateSnippets(route);
    expect(snippets.curl).toContain("curl");
    expect(snippets.fetch).toContain("fetch(");
    expect(snippets.doofpiClient).toContain("client.getUser.read(");
  });
});
