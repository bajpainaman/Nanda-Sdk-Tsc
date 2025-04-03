# NANDA Reputation System SDK Functions

This document outlines the key functions that will be implemented in the TypeScript SDK to support reputation systems for the NANDA protocol. These functions provide developers with the tools to gather data, implement their own reputation algorithms, and visualize reputation information.

## 1. Core Reputation Data Collection

### 1.1 ReputationDataClient

```typescript
// New file: src/client/reputation-data.ts

import { Client, RequestOptions } from "./index.js";
import { 
  IReputationDataComponents, 
  IPerformanceMetrics,
  IVerificationStatus,
  IFeedbackData,
  IUsageStatistics
} from "../types/reputation.types.js";

/**
 * Client for collecting data that can be used in reputation calculations
 */
export class ReputationDataClient {
  private client: Client;
  
  constructor(client: Client) {
    this.client = client;
  }
  
  /**
   * Retrieves all reputation-related data components for a server
   * 
   * @param serverId - The ID of the server
   * @returns Combined data components that can inform reputation
   */
  async getReputationData(
    serverId: string,
    options?: RequestOptions
  ): Promise<IReputationDataComponents> {
    return this.client.request(
      {
        method: "reputation/data",
        params: { serverId }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Retrieves performance metrics for a server
   * 
   * @param serverId - The ID of the server
   * @param period - Time period for metrics ("day", "week", "month", "year")
   * @returns Performance metrics for the specified period
   */
  async getPerformanceMetrics(
    serverId: string,
    period: string = "month",
    options?: RequestOptions
  ): Promise<IPerformanceMetrics> {
    return this.client.request(
      {
        method: "reputation/data/performance",
        params: { serverId, period }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Retrieves verification information for a server
   * 
   * @param serverId - The ID of the server
   * @returns Verification status and details
   */
  async getVerificationStatus(
    serverId: string,
    options?: RequestOptions
  ): Promise<IVerificationStatus> {
    return this.client.request(
      {
        method: "reputation/data/verification",
        params: { serverId }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Retrieves user feedback data for a server
   * 
   * @param serverId - The ID of the server
   * @returns Aggregated feedback metrics
   */
  async getFeedbackData(
    serverId: string,
    options?: RequestOptions
  ): Promise<IFeedbackData> {
    return this.client.request(
      {
        method: "reputation/data/feedback",
        params: { serverId }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Retrieves usage statistics for a server
   * 
   * @param serverId - The ID of the server
   * @returns Usage patterns and statistics
   */
  async getUsageStatistics(
    serverId: string,
    options?: RequestOptions
  ): Promise<IUsageStatistics> {
    return this.client.request(
      {
        method: "reputation/data/usage",
        params: { serverId }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Adds custom metrics for a server that might inform reputation
   * 
   * @param serverId - The ID of the server
   * @param metrics - Custom metrics to add
   */
  async addCustomMetrics(
    serverId: string,
    metrics: Record<string, number | string | boolean>,
    options?: RequestOptions
  ): Promise<void> {
    return this.client.request(
      {
        method: "reputation/data/custom",
        params: { serverId, metrics }
      },
      // Return schema
      options
    );
  }
}
```

### 1.2 Reputation Data Types

```typescript
// New file: src/types/reputation.types.ts

/**
 * Components that can be used to inform reputation calculations
 */
export interface IReputationDataComponents {
  // Performance metrics
  performanceMetrics?: {
    uptime_percentage?: number;        // Server availability
    avg_response_time_ms?: number;     // Response time statistics
    error_rate?: number;               // Error frequency
    successful_transactions?: number;  // Successful transaction count
  };
  
  // Verification information
  verificationDetails?: {
    level?: string;                    // Verification level achieved
    verified_at?: string;              // When verification occurred
    methods?: string[];                // Verification methods used
  };
  
  // User feedback elements
  feedbackMetrics?: {
    average_rating?: number;           // Average user rating
    rating_count?: number;             // Total number of ratings
    rating_distribution?: number[];    // Distribution across rating values
    review_count?: number;             // Number of text reviews
  };
  
  // Usage patterns
  usageMetrics?: {
    total_requests?: number;           // Overall usage volume
    unique_clients?: number;           // Distinct client count
    longevity_days?: number;           // Time in service
    consistency_score?: number;        // Consistency of availability
  };
  
  // Additional custom metrics
  customMetrics?: Record<string, number | string | boolean>;
}

/**
 * Common interface for reputation scores, regardless of calculation method
 */
export interface IReputationScore {
  serverId: string;
  overallScore?: number;          // Optional overall score (0-100)
  categories?: {                  // Optional category scores
    [category: string]: number;   // Developer-defined categories
  };
  confidence?: {                  // Optional confidence indicators
    level?: number;               // Overall confidence (0-100)
    factors?: Record<string, number>; // Confidence breakdown
  };
  lastUpdated: string;            // ISO timestamp
  dataPoints?: number;            // Number of data points used
  algorithm?: string;             // Reputation algorithm identifier
  customFields?: Record<string, any>; // Developer-defined fields
}

// Additional type definitions for specific data categories...
```

## 2. Review Management Functions

### 2.1 ReviewClient

```typescript
// New file: src/client/reviews.ts

import { Client, RequestOptions } from "./index.js";
import {
  IUserReview,
  IServerReviews,
  IReviewUpdates
} from "../types/reputation.types.js";

/**
 * Client for managing user reviews of servers
 */
export class ReviewClient {
  private client: Client;
  
  constructor(client: Client) {
    this.client = client;
  }
  
  /**
   * Retrieves reviews for a server
   * 
   * @param serverId - The ID of the server
   * @param page - Page number for pagination
   * @param limit - Number of reviews per page
   * @returns Collection of reviews with pagination
   */
  async getServerReviews(
    serverId: string,
    page: number = 1,
    limit: number = 20,
    options?: RequestOptions
  ): Promise<IServerReviews> {
    return this.client.request(
      {
        method: "reputation/reviews",
        params: { serverId, page, limit }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Submits a new review for a server
   * 
   * @param serverId - The ID of the server
   * @param rating - Numeric rating (typically 1-5)
   * @param reviewText - Optional text review
   * @param categories - Optional category-specific ratings
   * @returns The created review
   */
  async submitReview(
    serverId: string,
    rating: number,
    reviewText?: string,
    categories?: Record<string, number>,
    options?: RequestOptions
  ): Promise<IUserReview> {
    return this.client.request(
      {
        method: "reputation/reviews",
        params: { 
          serverId, 
          rating, 
          reviewText,
          categories
        }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Updates an existing review
   * 
   * @param reviewId - The ID of the review to update
   * @param updates - The updates to apply
   * @returns The updated review
   */
  async updateReview(
    reviewId: string,
    updates: IReviewUpdates,
    options?: RequestOptions
  ): Promise<IUserReview> {
    return this.client.request(
      {
        method: "reputation/reviews/update",
        params: { reviewId, updates }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Deletes a review
   * 
   * @param reviewId - The ID of the review to delete
   */
  async deleteReview(
    reviewId: string,
    options?: RequestOptions
  ): Promise<void> {
    return this.client.request(
      {
        method: "reputation/reviews/delete",
        params: { reviewId }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Marks a review as helpful
   * 
   * @param reviewId - The ID of the review
   */
  async markReviewHelpful(
    reviewId: string,
    options?: RequestOptions
  ): Promise<void> {
    return this.client.request(
      {
        method: "reputation/reviews/helpful",
        params: { reviewId }
      },
      // Return schema
      options
    );
  }
  
  /**
   * Flags a review as inappropriate
   * 
   * @param reviewId - The ID of the review
   * @param reason - Reason for flagging
   */
  async flagReview(
    reviewId: string,
    reason: string,
    options?: RequestOptions
  ): Promise<void> {
    return this.client.request(
      {
        method: "reputation/reviews/flag",
        params: { reviewId, reason }
      },
      // Return schema
      options
    );
  }
}
```

## 3. Reputation Algorithm Interface

### 3.1 Algorithm Interface and Helpers

```typescript
// New file: src/utils/reputation-algorithm.ts

import { 
  IReputationDataComponents, 
  IReputationScore 
} from "../types/reputation.types.js";

/**
 * Interface for pluggable reputation algorithms
 */
export interface IReputationAlgorithm {
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Core calculation function
  calculateScore(
    serverId: string,
    components: IReputationDataComponents
  ): Promise<IReputationScore>;
  
  // Optional configuration parameters
  config?: {
    weights?: Record<string, number>;   // Category weights
    timeDecay?: {                       // Time decay parameters
      halfLifeDays: number;             // Data half-life 
      maxAgeDays: number;               // Maximum age to consider
    };
    thresholds?: {                      // Threshold parameters
      minimumDataPoints: number;        // Minimum data for calculation
      outlierDetection: number;         // Outlier Z-score threshold
    };
    customParams?: Record<string, any>; // Algorithm-specific parameters
  };
}

/**
 * Applies time decay to a value based on its age
 * 
 * @param value - The original value
 * @param timestamp - When the value was recorded
 * @param halfLifeDays - Half-life in days
 * @returns Decay-adjusted value
 */
export function applyTimeDecay(
  value: number, 
  timestamp: string,
  halfLifeDays: number
): number {
  const now = new Date();
  const time = new Date(timestamp);
  const ageMs = now.getTime() - time.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  
  return value * Math.pow(0.5, ageDays / halfLifeDays);
}

/**
 * Calculates confidence in a reputation score
 * 
 * @param dataComponents - Data used in calculation
 * @param config - Confidence calculation configuration
 * @returns Confidence level and factors
 */
export function calculateConfidence(
  dataComponents: IReputationDataComponents, 
  config: {
    minReviews: number;
    idealReviews: number;
    minAge: number;
    idealAge: number;
    verificationImportance: number;
  }
): {level: number, factors: Record<string, number>} {
  // Implementation provided by developer
  // This just returns a template structure
  return {
    level: 0,
    factors: {
      sample_size: 0,
      consistency: 0,
      diversity: 0,
      recency: 0,
      verification_level: 0
    }
  };
}

/**
 * Creates a weighted algorithm implementation
 * 
 * @param config - Algorithm configuration
 * @returns A reputation algorithm implementation
 */
export function createWeightedAlgorithm(config: {
  weights: {
    performance: number;
    verification: number;
    feedback: number;
    usage: number;
  };
  timeDecayDays: number;
  minimumReviews: number;
}): IReputationAlgorithm {
  return {
    id: "weighted-score-v1",
    name: "Weighted Score Algorithm",
    description: "Calculates reputation based on weighted components with time decay",
    version: "1.0",
    
    calculateScore: async (serverId, components) => {
      // Template implementation to be customized by developers
      return {
        serverId,
        overallScore: 0, // Calculate based on components and weights
        categories: {
          // Calculate category scores
        },
        lastUpdated: new Date().toISOString(),
        algorithm: "weighted-score-v1"
      };
    },
    
    config: {
      weights: config.weights,
      timeDecay: {
        halfLifeDays: config.timeDecayDays,
        maxAgeDays: config.timeDecayDays * 4
      },
      thresholds: {
        minimumDataPoints: config.minimumReviews,
        outlierDetection: 2.5 // Default Z-score for outliers
      }
    }
  };
}
```

## 4. Storage Adapters

### 4.1 Reputation Storage Interface

```typescript
// New file: src/utils/reputation-storage.ts

import { IReputationScore } from "../types/reputation.types.js";

/**
 * Interface for reputation data storage
 */
export interface IReputationStorage {
  /**
   * Saves a reputation score
   * 
   * @param score - The reputation score to save
   */
  saveReputationScore(score: IReputationScore): Promise<void>;
  
  /**
   * Retrieves the current reputation score for a server
   * 
   * @param serverId - The ID of the server
   * @returns The current reputation score, or null if not found
   */
  getReputationScore(serverId: string): Promise<IReputationScore | null>;
  
  /**
   * Retrieves historical reputation scores for a server
   * 
   * @param serverId - The ID of the server
   * @param limit - Maximum number of scores to retrieve
   * @returns Array of historical reputation scores
   */
  getReputationHistory(
    serverId: string, 
    limit?: number
  ): Promise<IReputationScore[]>;
}

/**
 * Implementation of reputation storage using local storage
 * For development and testing
 */
export class LocalReputationStorage implements IReputationStorage {
  private storage: Map<string, IReputationScore> = new Map();
  private history: Map<string, IReputationScore[]> = new Map();
  
  async saveReputationScore(score: IReputationScore): Promise<void> {
    // Save current score
    this.storage.set(score.serverId, score);
    
    // Update history
    const serverHistory = this.history.get(score.serverId) || [];
    serverHistory.push(score);
    this.history.set(score.serverId, serverHistory);
  }
  
  async getReputationScore(serverId: string): Promise<IReputationScore | null> {
    return this.storage.get(serverId) || null;
  }
  
  async getReputationHistory(
    serverId: string,
    limit: number = 10
  ): Promise<IReputationScore[]> {
    const history = this.history.get(serverId) || [];
    return history.slice(-limit);
  }
}

/**
 * Example implementation for database storage
 * This is just a template - developers would implement their own
 */
export class DatabaseReputationStorage implements IReputationStorage {
  // Implementation would connect to an actual database
  
  async saveReputationScore(score: IReputationScore): Promise<void> {
    // Save to database
  }
  
  async getReputationScore(serverId: string): Promise<IReputationScore | null> {
    // Retrieve from database
    return null;
  }
  
  async getReputationHistory(
    serverId: string,
    limit: number = 10
  ): Promise<IReputationScore[]> {
    // Retrieve history from database
    return [];
  }
}
```

## 5. Badge Generation

### 5.1 Reputation Badge Utilities

```typescript
// New file: src/utils/badge-generator.ts

/**
 * Generates an HTML snippet for embedding a reputation badge
 * 
 * @param serverId - The ID of the server
 * @param options - Display options
 * @returns HTML string for embedding
 */
export function generateReputationBadgeHtml(
  serverId: string,
  options: {
    showScore?: boolean;
    showVerification?: boolean;
    size?: "small" | "medium" | "large";
    theme?: "light" | "dark";
    showCategories?: string[];
  } = {}
): string {
  const defaultOptions = {
    showScore: true,
    showVerification: true,
    size: "medium",
    theme: "light",
    showCategories: []
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Generate HTML for an iframe or div that loads the badge
  return `<div class="nanda-reputation-badge" 
    data-server-id="${serverId}"
    data-show-score="${mergedOptions.showScore}"
    data-show-verification="${mergedOptions.showVerification}" 
    data-size="${mergedOptions.size}"
    data-theme="${mergedOptions.theme}"
    data-categories="${mergedOptions.showCategories.join(',')}">
  </div>
  <script src="https://cdn.nanda.io/badges/v1/badge.js" async></script>`;
}

/**
 * Generates a URL for a reputation badge image
 * 
 * @param serverId - The ID of the server
 * @param style - Badge style options
 * @returns URL to badge image
 */
export function getReputationBadgeUrl(
  serverId: string,
  style: {
    format?: "svg" | "png";
    showScore?: boolean;
    showVerification?: boolean;
    theme?: "light" | "dark";
    width?: number;
    height?: number;
  } = {}
): string {
  const defaultStyle = {
    format: "svg",
    showScore: true,
    showVerification: true,
    theme: "light"
  };
  
  const mergedStyle = { ...defaultStyle, ...style };
  
  const params = new URLSearchParams({
    showScore: String(mergedStyle.showScore),
    showVerification: String(mergedStyle.showVerification),
    theme: mergedStyle.theme
  });
  
  if (mergedStyle.width) params.append("width", String(mergedStyle.width));
  if (mergedStyle.height) params.append("height", String(mergedStyle.height));
  
  return `https://api.nanda.io/reputation/badge/${serverId}.${mergedStyle.format}?${params.toString()}`;
}
```

## 6. Main Reputation Client

### 6.1 Comprehensive Reputation Client

```typescript
// New file: src/client/reputation.ts

import { Client } from "./index.js";
import { ReputationDataClient } from "./reputation-data.js";
import { ReviewClient } from "./reviews.js";
import { IReputationAlgorithm } from "../utils/reputation-algorithm.js";
import { IReputationStorage, LocalReputationStorage } from "../utils/reputation-storage.js";
import { IReputationScore } from "../types/reputation.types.js";

/**
 * Comprehensive client for reputation functionality
 */
export class ReputationClient {
  private client: Client;
  public data: ReputationDataClient;
  public reviews: ReviewClient;
  private algorithms: Map<string, IReputationAlgorithm> = new Map();
  private storage: IReputationStorage;
  
  constructor(
    client: Client,
    storage: IReputationStorage = new LocalReputationStorage()
  ) {
    this.client = client;
    this.data = new ReputationDataClient(client);
    this.reviews = new ReviewClient(client);
    this.storage = storage;
  }
  
  /**
   * Registers a reputation algorithm
   * 
   * @param algorithm - The algorithm implementation
   */
  registerAlgorithm(algorithm: IReputationAlgorithm): void {
    this.algorithms.set(algorithm.id, algorithm);
  }
  
  /**
   * Calculates a reputation score using a registered algorithm
   * 
   * @param serverId - The ID of the server
   * @param algorithmId - The ID of the algorithm to use
   * @returns The calculated reputation score
   */
  async calculateReputationScore(
    serverId: string,
    algorithmId: string
  ): Promise<IReputationScore> {
    // Get the algorithm
    const algorithm = this.algorithms.get(algorithmId);
    if (!algorithm) {
      throw new Error(`Algorithm with ID ${algorithmId} not found`);
    }
    
    // Get the data components
    const components = await this.data.getReputationData(serverId);
    
    // Calculate the score
    const score = await algorithm.calculateScore(serverId, components);
    
    // Save the score
    await this.storage.saveReputationScore(score);
    
    return score;
  }
  
  /**
   * Retrieves the current reputation score for a server
   * 
   * @param serverId - The ID of the server
   * @returns The current reputation score, or null if not found
   */
  async getReputationScore(
    serverId: string
  ): Promise<IReputationScore | null> {
    return this.storage.getReputationScore(serverId);
  }
  
  /**
   * Retrieves the reputation history for a server
   * 
   * @param serverId - The ID of the server
   * @param limit - Maximum number of scores to retrieve
   * @returns Array of historical reputation scores
   */
  async getReputationHistory(
    serverId: string,
    limit: number = 10
  ): Promise<IReputationScore[]> {
    return this.storage.getReputationHistory(serverId, limit);
  }
}
```

## 7. Integration with Main SDK

### 7.1 Integration Points

```typescript
// Update to src/index.ts

export * from "./types/reputation.types.js";
export * from "./client/reputation.js";
export * from "./client/reputation-data.js";
export * from "./client/reviews.js";
export * from "./utils/reputation-algorithm.js";
export * from "./utils/reputation-storage.js";
export * from "./utils/badge-generator.js";
```

## 8. Usage Example

```typescript
// Example usage of the reputation toolkit

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ReputationClient } from "@modelcontextprotocol/sdk/client/reputation.js";
import { createWeightedAlgorithm } from "@modelcontextprotocol/sdk/utils/reputation-algorithm.js";
import { generateReputationBadgeHtml } from "@modelcontextprotocol/sdk/utils/badge-generator.js";
import { DatabaseReputationStorage } from "@modelcontextprotocol/sdk/utils/reputation-storage.js";

// Initialize main SDK client
const client = new Client(
  {
    name: "my-app",
    version: "1.0.0"
  },
  {
    capabilities: {
      // Include required capabilities
    }
  }
);

// Create storage (could use default local storage instead)
const storage = new DatabaseReputationStorage();

// Create reputation client
const reputationClient = new ReputationClient(client, storage);

// Create a custom reputation algorithm
const myAlgorithm = createWeightedAlgorithm({
  weights: {
    performance: 0.4,
    verification: 0.3,
    feedback: 0.2,
    usage: 0.1
  },
  timeDecayDays: 30,
  minimumReviews: 5
});

// Register the algorithm
reputationClient.registerAlgorithm(myAlgorithm);

// Collect and calculate reputation
async function updateServerReputation(serverId: string) {
  try {
    // Calculate reputation using our algorithm
    const reputationScore = await reputationClient.calculateReputationScore(
      serverId,
      myAlgorithm.id
    );
    
    console.log(`Server ${serverId} reputation: ${reputationScore.overallScore}`);
    
    // Generate badge HTML
    const badgeHtml = generateReputationBadgeHtml(serverId, {
      showScore: true,
      showVerification: true
    });
    
    // Update the UI with the badge
    document.getElementById("badge-container").innerHTML = badgeHtml;
  } catch (error) {
    console.error("Error calculating reputation:", error);
  }
}

// Example of submitting a review
async function submitServerReview(serverId: string, rating: number, review: string) {
  try {
    await reputationClient.reviews.submitReview(serverId, rating, review);
    // After submitting, recalculate the reputation
    await updateServerReputation(serverId);
  } catch (error) {
    console.error("Error submitting review:", error);
  }
}
```

This toolkit provides developers with the building blocks they need to implement reputation systems for NANDA protocol servers, while giving them the flexibility to define their own algorithms and approaches.