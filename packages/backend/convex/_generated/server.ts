/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { DataModel } from "./dataModel.js";

import {
  queryGeneric,
  mutationGeneric,
  actionGeneric,
  internalQueryGeneric,
  internalMutationGeneric,
  internalActionGeneric,
  httpActionGeneric,
} from "convex/server";

/**
 * Define a query in this Convex app's public API.
 */
export const query = queryGeneric as typeof queryGeneric;

/**
 * Define a mutation in this Convex app's public API.
 */
export const mutation = mutationGeneric as typeof mutationGeneric;

/**
 * Define an action in this Convex app's public API.
 */
export const action = actionGeneric as typeof actionGeneric;

/**
 * Define a query that is only callable by other Convex functions.
 */
export const internalQuery = internalQueryGeneric as typeof internalQueryGeneric;

/**
 * Define a mutation that is only callable by other Convex functions.
 */
export const internalMutation = internalMutationGeneric as typeof internalMutationGeneric;

/**
 * Define an action that is only callable by other Convex functions.
 */
export const internalAction = internalActionGeneric as typeof internalActionGeneric;

/**
 * Define an HTTP action.
 */
export const httpAction = httpActionGeneric as typeof httpActionGeneric;

// DataModel used for type generation
export type { DataModel };

