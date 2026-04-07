/**
 * The type of a doofpi endpoint
 */
export type EndpointType = "read" | "write";

/**
 * Internal representation of a doofpi endpoint at runtime
 */
type EndpointLike = {
  read?: unknown;
  write?: unknown;
  model?: { input?: unknown; output?: unknown };
  meta?: any;
  middleware?: unknown[];
};

/**
 * A doofpi Routes object: nested record whose leaf values are endpoints
 */
type DoofpiRoutes = { [key: string]: any };

/**
 * Complete information about a single doofpi endpoint
 */
export type RouteInfo = {
  path: string;
  type: EndpointType;
  meta?: any;
  inputSchema?: string;
  outputSchema?: string;
  inputExample?: string;
  outputExample?: string;
  inputTypeScript?: string;
  outputTypeScript?: string;
  inputOptionalFields?: { name: string; example: string }[];
  outputOptionalFields?: { name: string; example: string }[];
};

/**
 * Generate a JSON example from a JSON schema string
 */
function generateExampleFromSchema(schemaJson: string): string | undefined {
  try {
    const schema = JSON.parse(schemaJson);
    return generateJSONExample(schema);
  } catch {
    return undefined;
  }
}

/**
 * Generate TypeScript type definition from a JSON schema string
 */
function generateTypeScriptFromSchema(schemaJson: string): string | undefined {
  try {
    const schema = JSON.parse(schemaJson);
    return generateTypeScriptExample(schema);
  } catch {
    return undefined;
  }
}

function extractOptionalFields(
  schemaJson: string,
): { name: string; example: string }[] | undefined {
  try {
    const schema = JSON.parse(schemaJson);
    return getOptionalFields(schema);
  } catch {
    return undefined;
  }
}

function getOptionalFields(
  schema: any,
  depth: number = 0,
): { name: string; example: string }[] {
  const optionalFields: { name: string; example: string }[] = [];

  if (!schema || typeof schema !== "object") return optionalFields;

  // Handle allOf
  if (schema.allOf && Array.isArray(schema.allOf)) {
    const allProps: Record<string, any> = {};
    const allRequired = new Set<string>();

    for (const subSchema of schema.allOf) {
      if (subSchema.type === "object" && subSchema.properties) {
        Object.assign(allProps, subSchema.properties);
      }
      if (subSchema.required) {
        subSchema.required.forEach((r: string) => allRequired.add(r));
      }
    }

    for (const [key, propSchema] of Object.entries(allProps)) {
      if (!allRequired.has(key)) {
        const example = generateJSONExample(propSchema as any, 0, true);
        optionalFields.push({ name: key, example });
      }
    }
    return optionalFields;
  }

  if (schema.type === "object" && schema.properties) {
    const required = new Set(schema.required || []);

    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (!required.has(key)) {
        const example = generateJSONExample(propSchema as any, 0, true);
        optionalFields.push({ name: key, example });
      }
    }
  }

  return optionalFields;
}

function generateJSONExample(
  schema: any,
  depth: number = 0,
  includeOptional: boolean = false,
): string {
  if (!schema || typeof schema !== "object") return '"value"';

  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  // Handle const (Zod literals)
  if (schema.const !== undefined) {
    if (typeof schema.const === "string") {
      return `"${schema.const}"`;
    }
    return JSON.stringify(schema.const);
  }

  // Handle allOf (intersections)
  if (schema.allOf && Array.isArray(schema.allOf)) {
    const objects: any[] = [];

    for (const subSchema of schema.allOf) {
      if (subSchema.type === "object" && subSchema.properties) {
        objects.push(subSchema);
      }
    }

    if (objects.length > 0) {
      const allProps: Record<string, any> = {};
      const allRequired = new Set<string>();

      for (const obj of objects) {
        if (obj.properties) {
          Object.assign(allProps, obj.properties);
        }
        if (obj.required) {
          obj.required.forEach((r: string) => allRequired.add(r));
        }
      }

      const props: string[] = [];
      for (const [key, propSchema] of Object.entries(allProps)) {
        const isRequired = allRequired.has(key);
        if (isRequired || includeOptional) {
          const propValue = generateJSONExample(
            propSchema as any,
            depth + 1,
            includeOptional,
          );
          props.push(`${nextIndent}"${key}": ${propValue}`);
        }
      }

      return `{\n${props.join(",\n")}\n${indent}}`;
    }
  }

  // Handle oneOf/anyOf (unions) - use first option
  if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return generateJSONExample(schema.oneOf[0], depth, includeOptional);
  }

  if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return generateJSONExample(schema.anyOf[0], depth, includeOptional);
  }

  switch (schema.type) {
    case "object": {
      // Handle z.record() - uses additionalProperties instead of properties
      if (schema.additionalProperties && !schema.properties) {
        const keyExample =
          schema.propertyNames?.type === "string" ? "key" : "key";
        const valueExample = generateJSONExample(
          schema.additionalProperties,
          depth + 1,
          includeOptional,
        );
        return `{\n${nextIndent}"${keyExample}": ${valueExample}\n${indent}}`;
      }

      if (!schema.properties || Object.keys(schema.properties).length === 0) {
        return "{}";
      }

      const required = new Set(schema.required || []);
      const props: string[] = [];

      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const isRequired = required.has(key);
        if (isRequired || includeOptional) {
          const propValue = generateJSONExample(
            propSchema as any,
            depth + 1,
            includeOptional,
          );
          props.push(`${nextIndent}"${key}": ${propValue}`);
        }
      }

      return `{\n${props.join(",\n")}\n${indent}}`;
    }

    case "array": {
      if (schema.items) {
        const itemValue = generateJSONExample(
          schema.items,
          depth + 1,
          includeOptional,
        );
        return `[${itemValue}]`;
      }
      return "[]";
    }

    case "string": {
      if (schema.enum && schema.enum.length > 0) {
        return `"${schema.enum[0]}"`;
      }
      if (schema.format === "date-time") {
        return '"2024-01-01T00:00:00.000Z"';
      }
      if (schema.format === "date") {
        return '"2024-01-01"';
      }
      return '"string"';
    }

    case "number":
    case "integer":
      return "0";

    case "boolean":
      return "true";

    case "null":
      return "null";

    default:
      return '"value"';
  }
}

/**
 * Generate TypeScript type definition from a parsed schema object
 */
function generateTypeScriptExample(schema: any, depth: number = 0): string {
  if (!schema || typeof schema !== "object") return "any";

  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  // Handle const (Zod literals)
  if (schema.const !== undefined) {
    if (typeof schema.const === "string") {
      return `"${schema.const}"`;
    }
    return JSON.stringify(schema.const);
  }

  // Handle allOf (intersections)
  if (schema.allOf && Array.isArray(schema.allOf)) {
    const objects: any[] = [];
    const nonObjects: any[] = [];

    for (const subSchema of schema.allOf) {
      if (subSchema.type === "object" && subSchema.properties) {
        objects.push(subSchema);
      } else {
        nonObjects.push(subSchema);
      }
    }

    if (objects.length > 0) {
      const allProps: Record<string, any> = {};
      const allRequired = new Set<string>();

      for (const obj of objects) {
        if (obj.properties) {
          Object.assign(allProps, obj.properties);
        }
        if (obj.required) {
          obj.required.forEach((r: string) => allRequired.add(r));
        }
      }

      const props: string[] = [];
      for (const [key, propSchema] of Object.entries(allProps)) {
        const isRequired = allRequired.has(key);
        const propType = generateTypeScriptExample(
          propSchema as any,
          depth + 1,
        );
        const optionalMark = isRequired ? "" : "?";
        props.push(`${nextIndent}${key}${optionalMark}: ${propType}`);
      }

      const objectType = `{\n${props.join("\n")}\n${indent}}`;

      if (nonObjects.length > 0) {
        const nonObjectTypes = nonObjects.map((s) =>
          generateTypeScriptExample(s, depth),
        );
        return `${objectType} & (${nonObjectTypes.join(" & ")})`;
      }

      return objectType;
    } else if (nonObjects.length > 0) {
      const types = nonObjects.map((s) => generateTypeScriptExample(s, depth));
      return types.join(" & ");
    }
  }

  // Handle oneOf (unions)
  if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    const types = schema.oneOf.map((s: any) =>
      generateTypeScriptExample(s, depth),
    );
    return types.join(" | ");
  }

  // Handle anyOf (unions)
  if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    const types = schema.anyOf.map((s: any) =>
      generateTypeScriptExample(s, depth),
    );
    return types.join(" | ");
  }

  switch (schema.type) {
    case "object": {
      if (schema.additionalProperties && !schema.properties) {
        const keyType =
          schema.propertyNames?.type === "string" ? "string" : "string";
        const valueType = generateTypeScriptExample(
          schema.additionalProperties,
          depth,
        );
        return `Record<${keyType}, ${valueType}>`;
      }

      if (!schema.properties || Object.keys(schema.properties).length === 0) {
        return "{}";
      }

      const required = new Set(schema.required || []);
      const props: string[] = [];

      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const isRequired = required.has(key);
        const propType = generateTypeScriptExample(
          propSchema as any,
          depth + 1,
        );
        const optionalMark = isRequired ? "" : "?";
        props.push(`${nextIndent}${key}${optionalMark}: ${propType}`);
      }

      return `{\n${props.join("\n")}\n${indent}}`;
    }

    case "array": {
      if (schema.items) {
        const itemType = generateTypeScriptExample(schema.items, depth);
        if (itemType.includes("\n")) {
          return `Array<${itemType}>`;
        }
        return `${itemType}[]`;
      }
      return "any[]";
    }

    case "string": {
      if (schema.enum && schema.enum.length > 0) {
        return schema.enum.map((v: string) => `"${v}"`).join(" | ");
      }
      return "string";
    }

    case "number":
    case "integer":
      return "number";

    case "boolean":
      return "boolean";

    case "null":
      return "null";

    default:
      return "any";
  }
}

/**
 * Determine whether a Zod schema node represents a date type.
 * Works with both Zod v3 (_def.typeName) and Zod v4 (def.type).
 */
function isZodDateSchema(zodSchema: unknown): boolean {
  if (!zodSchema || typeof zodSchema !== "object") return false;
  const s = zodSchema as Record<string, any>;
  // Zod v3
  if (s._def?.typeName === "ZodDate") return true;
  // Zod v4
  if (s.def?.type === "date") return true;
  if (s._zod?.def?.type === "date") return true;
  return false;
}

/**
 * Convert a Zod schema to JSON schema string using Zod v4+ toJSONSchema method.
 * - Dates are mapped to { type: "string", format: "date-time" } since doofpi
 *   transports dates as ISO 8601 strings.
 * - Other unrepresentable types are silently mapped to {} via unrepresentable: 'any'.
 */
function zodSchemaToString(schema: unknown): string | undefined {
  if (!schema) return undefined;
  try {
    if (schema && typeof schema === "object" && "toJSONSchema" in schema) {
      const toJSONSchema = (
        schema as { toJSONSchema: (options?: unknown) => unknown }
      ).toJSONSchema;
      if (typeof toJSONSchema === "function") {
        const jsonSchema = toJSONSchema.call(schema, {
          unrepresentable: "any",
          override: (ctx: any) => {
            if (isZodDateSchema(ctx.zodSchema)) {
              Object.assign(ctx.jsonSchema, {
                type: "string",
                format: "date-time",
              });
            }
          },
        });
        return JSON.stringify(jsonSchema, null, 2);
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Recursively traverse a doofpi Routes object and extract all endpoint information.
 */
function traverseRoutes(
  routes: DoofpiRoutes,
  pathPrefix: string = "",
): RouteInfo[] {
  const result: RouteInfo[] = [];

  for (const [key, value] of Object.entries(routes)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      ("read" in value || "write" in value)
    ) {
      // This is a leaf endpoint
      const endpoint = value as EndpointLike;
      const inputSchema = endpoint.model?.input
        ? zodSchemaToString(endpoint.model.input)
        : undefined;
      const outputSchema = endpoint.model?.output
        ? zodSchemaToString(endpoint.model.output)
        : undefined;

      const inputExample = inputSchema
        ? generateExampleFromSchema(inputSchema)
        : undefined;
      const outputExample = outputSchema
        ? generateExampleFromSchema(outputSchema)
        : undefined;
      const inputTypeScript = inputSchema
        ? generateTypeScriptFromSchema(inputSchema)
        : undefined;
      const outputTypeScript = outputSchema
        ? generateTypeScriptFromSchema(outputSchema)
        : undefined;
      const inputOptionalFields = inputSchema
        ? extractOptionalFields(inputSchema)
        : undefined;
      const outputOptionalFields = outputSchema
        ? extractOptionalFields(outputSchema)
        : undefined;

      // An endpoint can have both read and write - emit a RouteInfo for each
      if ("read" in endpoint) {
        result.push({
          path: currentPath,
          type: "read",
          meta: endpoint.meta,
          inputSchema,
          outputSchema,
          inputExample,
          outputExample,
          inputTypeScript,
          outputTypeScript,
          inputOptionalFields,
          outputOptionalFields,
        });
      }
      if ("write" in endpoint) {
        result.push({
          path: currentPath,
          type: "write",
          meta: endpoint.meta,
          inputSchema,
          outputSchema,
          inputExample,
          outputExample,
          inputTypeScript,
          outputTypeScript,
          inputOptionalFields,
          outputOptionalFields,
        });
      }
    } else if (value && typeof value === "object") {
      // Nested routes object
      result.push(...traverseRoutes(value as DoofpiRoutes, currentPath));
    }
  }

  return result;
}

/**
 * Collect route information from a doofpi Routes object.
 * @param routes - The routes object returned from d.routes({...})
 * @returns Array of route information for all endpoints
 */
export function collectRoutes(routes: DoofpiRoutes): RouteInfo[] {
  return traverseRoutes(routes);
}

// Internal helpers exported for white-box tests of branch behavior.
export const __internal = {
  extractOptionalFields,
  generateExampleFromSchema,
  generateJSONExample,
  generateTypeScriptExample,
  generateTypeScriptFromSchema,
  getOptionalFields,
  isZodDateSchema,
  zodSchemaToString,
};
