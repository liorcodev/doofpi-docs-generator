/**
 * Metadata for a doofpi route/endpoint used for documentation.
 * Use with d.defineMeta<RouteMeta>()
 */
export type RouteMeta = {
  /** Documentation metadata */
  docs?: {
    /** Human-readable title for the route */
    title?: string;
    /** Description of what the route does */
    description?: string;
    /** Tags for grouping routes */
    tags?: string[];
    /** Whether this route is deprecated */
    deprecated?: boolean;
    /** Whether this route requires authentication */
    auth?: boolean;
    /** Roles allowed to access this route */
    roles?: string[];
  };
};

/**
 * Options for generating HTML documentation
 */
export type DocsGeneratorOptions = {
  /** Title to display in the documentation page */
  title?: string;
};
