/**
 * NANDA Reputation System
 * 
 * This module provides tools for building reputation systems for servers in the NANDA protocol.
 * It includes data structures, APIs, and utilities that developers can use to implement
 * their own reputation algorithms and approaches.
 * 
 * IMPORTANT: This is currently a prototype implementation and is not fully functional.
 * The client methods are mocked, and API endpoints don't exist in the server.
 * This code serves as a design reference for how the reputation system could be implemented.
 */

// Export core types
export * from "./reputation/types/types.js";

// Export utilities
export { 
  applyTimeDecay,
  normalizeScore,
  detectOutliers,
  calculateConfidence,
  createWeightedAlgorithm
} from "./reputation/utils/algorithm.js";
export type { IReputationAlgorithm } from "./reputation/utils/algorithm.js";

export {
  LocalReputationStorage,
  BrowserLocalStorageAdapter
} from "./reputation/utils/storage.js";
export type { IReputationStorage } from "./reputation/utils/storage.js";

export {
  generateReputationBadgeHtml,
  getReputationBadgeUrl,
  generateInlineSvgBadge,
} from "./reputation/utils/badge-generator.js";
export type {
  BadgeOptions,
  BadgeStyleOptions
} from "./reputation/utils/badge-generator.js";