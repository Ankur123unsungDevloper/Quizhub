/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai_agent from "../ai/agent.js";
import type * as ai_agentHelpers from "../ai/agentHelpers.js";
import type * as ai_generateImage from "../ai/generateImage.js";
import type * as ai_generateQuestions from "../ai/generateQuestions.js";
import type * as ai_generateStructure from "../ai/generateStructure.js";
import type * as ai_prompts from "../ai/prompts.js";
import type * as aibook from "../aibook.js";
import type * as attempts from "../attempts.js";
import type * as cards from "../cards.js";
import type * as crons from "../crons.js";
import type * as exams from "../exams.js";
import type * as imageFixBulk from "../imageFixBulk.js";
import type * as imageFixHelpers from "../imageFixHelpers.js";
import type * as paperExamHelpers from "../paperExamHelpers.js";
import type * as paperExams from "../paperExams.js";
import type * as questions from "../questions.js";
import type * as subscriptions from "../subscriptions.js";
import type * as userProfiles from "../userProfiles.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  "ai/agent": typeof ai_agent;
  "ai/agentHelpers": typeof ai_agentHelpers;
  "ai/generateImage": typeof ai_generateImage;
  "ai/generateQuestions": typeof ai_generateQuestions;
  "ai/generateStructure": typeof ai_generateStructure;
  "ai/prompts": typeof ai_prompts;
  aibook: typeof aibook;
  attempts: typeof attempts;
  cards: typeof cards;
  crons: typeof crons;
  exams: typeof exams;
  imageFixBulk: typeof imageFixBulk;
  imageFixHelpers: typeof imageFixHelpers;
  paperExamHelpers: typeof paperExamHelpers;
  paperExams: typeof paperExams;
  questions: typeof questions;
  subscriptions: typeof subscriptions;
  userProfiles: typeof userProfiles;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
