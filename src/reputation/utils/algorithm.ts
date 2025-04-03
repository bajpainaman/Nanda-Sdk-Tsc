/**
 * Reputation algorithm interfaces and helpers
 */

import { 
  IReputationDataComponents, 
  IReputationScore 
} from "../types/types.js";

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
    customParams?: Record<string, unknown>; // Algorithm-specific parameters
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
 * Normalizes a value to a 0-100 scale
 * 
 * @param value - The value to normalize
 * @param min - Minimum expected value
 * @param max - Maximum expected value
 * @returns Normalized value (0-100)
 */
export function normalizeScore(
  value: number,
  min: number,
  max: number
): number {
  // Clamp the value to the range
  const clampedValue = Math.max(min, Math.min(max, value));
  
  // Normalize to 0-100
  return ((clampedValue - min) / (max - min)) * 100;
}

/**
 * Detects outliers in a set of values
 * 
 * @param values - Array of numeric values
 * @param zScoreThreshold - Z-score threshold for outlier detection
 * @returns Indices of outliers in the array
 */
export function detectOutliers(
  values: number[],
  zScoreThreshold: number = 2.5
): number[] {
  if (values.length < 2) return [];
  
  // Calculate mean
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Calculate standard deviation
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Find outliers
  const outliers: number[] = [];
  values.forEach((val, index) => {
    const zScore = Math.abs((val - mean) / stdDev);
    if (zScore > zScoreThreshold) {
      outliers.push(index);
    }
  });
  
  return outliers;
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
  const factors: Record<string, number> = {
    sample_size: 0,
    consistency: 0,
    diversity: 0,
    recency: 0,
    verification_level: 0
  };
  
  // Sample size factor
  const reviewCount = dataComponents.feedbackMetrics?.rating_count || 0;
  factors.sample_size = Math.min(100, (reviewCount / config.idealReviews) * 100);
  
  // Consistency factor (placeholder - developers would implement their own logic)
  factors.consistency = 70; // Example value
  
  // Diversity factor (placeholder)
  factors.diversity = 60; // Example value
  
  // Recency factor (placeholder)
  factors.recency = 80; // Example value
  
  // Verification level factor
  const verificationLevel = dataComponents.verificationDetails?.level || "none";
  switch (verificationLevel) {
    case "gold":
      factors.verification_level = 100;
      break;
    case "silver":
      factors.verification_level = 75;
      break;
    case "bronze":
      factors.verification_level = 50;
      break;
    default:
      factors.verification_level = 0;
  }
  
  // Calculate overall confidence level (weighted average)
  const weights = {
    sample_size: 0.3,
    consistency: 0.2,
    diversity: 0.1,
    recency: 0.2,
    verification_level: 0.2
  };
  
  let overallConfidence = 0;
  let weightSum = 0;
  
  Object.entries(factors).forEach(([factor, value]) => {
    const weight = weights[factor as keyof typeof weights] || 0;
    overallConfidence += value * weight;
    weightSum += weight;
  });
  
  const level = weightSum > 0 ? overallConfidence / weightSum : 0;
  
  return {
    level: Math.round(level),
    factors
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
      // This is a template implementation that developers would customize
      
      // Calculate category scores
      const performanceScore = calculatePerformanceScore(components);
      const verificationScore = calculateVerificationScore(components);
      const feedbackScore = calculateFeedbackScore(components);
      const usageScore = calculateUsageScore(components);
      
      // Apply weights
      const weightedScore = 
        (performanceScore * config.weights.performance) +
        (verificationScore * config.weights.verification) +
        (feedbackScore * config.weights.feedback) +
        (usageScore * config.weights.usage);
      
      // Normalize to ensure 0-100 range
      const normalizedScore = Math.min(100, Math.max(0, weightedScore));
      
      // Calculate confidence
      const confidence = calculateConfidence(components, {
        minReviews: config.minimumReviews,
        idealReviews: config.minimumReviews * 5,
        minAge: 7,
        idealAge: 30,
        verificationImportance: 0.2
      });
      
      return {
        serverId,
        overallScore: Math.round(normalizedScore),
        categories: {
          performance: Math.round(performanceScore),
          verification: Math.round(verificationScore),
          feedback: Math.round(feedbackScore),
          usage: Math.round(usageScore)
        },
        confidence,
        lastUpdated: new Date().toISOString(),
        dataPoints: components.feedbackMetrics?.rating_count || 0,
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

// Helper functions for score calculation
// These are placeholders - developers would implement their own logic

function calculatePerformanceScore(components: IReputationDataComponents): number {
  const metrics = components.performanceMetrics;
  if (!metrics) return 50; // Default score
  
  let score = 0;
  
  // Uptime score (0-100)
  const uptimeScore = metrics.uptime_percentage || 0;
  
  // Response time score (0-100)
  // Lower is better, so we invert
  const responseTimeScore = metrics.avg_response_time_ms
    ? Math.max(0, 100 - (metrics.avg_response_time_ms / 10))
    : 50;
  
  // Error rate score (0-100)
  // Lower is better, so we invert
  const errorRateScore = metrics.error_rate !== undefined
    ? Math.max(0, 100 - (metrics.error_rate * 100))
    : 50;
  
  // Combine scores with weights
  score = (uptimeScore * 0.5) + (responseTimeScore * 0.3) + (errorRateScore * 0.2);
  
  return score;
}

function calculateVerificationScore(components: IReputationDataComponents): number {
  const details = components.verificationDetails;
  if (!details) return 0;
  
  // Score based on verification level
  switch (details.level) {
    case "gold":
      return 100;
    case "silver":
      return 75;
    case "bronze":
      return 50;
    default:
      return 0;
  }
}

function calculateFeedbackScore(components: IReputationDataComponents): number {
  const metrics = components.feedbackMetrics;
  if (!metrics || !metrics.average_rating) return 50;
  
  // Assuming rating is on a 1-5 scale
  // Convert to 0-100
  return (metrics.average_rating - 1) / 4 * 100;
}

function calculateUsageScore(components: IReputationDataComponents): number {
  const metrics = components.usageMetrics;
  if (!metrics) return 50;
  
  let score = 0;
  
  // Request volume score
  const requestScore = metrics.total_requests
    ? Math.min(100, metrics.total_requests / 1000 * 100)
    : 0;
  
  // Client diversity score
  const diversityScore = metrics.unique_clients
    ? Math.min(100, metrics.unique_clients / 100 * 100)
    : 0;
  
  // Longevity score
  const longevityScore = metrics.longevity_days
    ? Math.min(100, metrics.longevity_days / 30 * 100)
    : 0;
  
  // Combine scores with weights
  score = (requestScore * 0.3) + (diversityScore * 0.4) + (longevityScore * 0.3);
  
  return score;
}