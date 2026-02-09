/* eslint-disable */
/**
 * Generated API types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ApiFromModules } from "convex/server";
import type * as abilities from "../abilities.js";
import type * as marketplace from "../marketplace.js";
import type * as credentials from "../credentials.js";
import type * as execution from "../execution.js";

export declare const api: ApiFromModules<{
  abilities: typeof abilities;
  marketplace: typeof marketplace;
  credentials: typeof credentials;
  execution: typeof execution;
}>;
