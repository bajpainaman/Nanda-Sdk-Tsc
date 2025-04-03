/**
 * Example implementation of a weighted reputation algorithm
 */

import { Client } from '../../src/client/index.js';
import {
  ReputationClient,
  createWeightedAlgorithm,
  IReputationDataComponents
} from '../../src/reputation.js';

// Create an MCP client
const client = new Client({
  serverUrl: 'https://example-mcp-server.com'
});

// Initialize reputation client
const reputationClient = new ReputationClient(client);

// Define a custom weighted algorithm
const myAlgorithm = createWeightedAlgorithm({
  id: 'my-custom-algorithm',
  name: 'My Custom Algorithm',
  description: 'A reputation algorithm with custom weights for different components',
  weights: {
    performance: 0.4,   // Performance is prioritized
    verification: 0.3,   // Verification is important too
    feedback: 0.2,       // User feedback matters but less
    usage: 0.1           // Usage patterns have minimal impact
  },
  timeDecayDays: 60,     // Scores decay over 60 days
  minimumReviews: 10     // At least 10 reviews for good confidence
});

// Register the algorithm
reputationClient.registerAlgorithm(myAlgorithm);

// Use the algorithm to calculate a score
async function calculateServerScore(serverId: string) {
  try {
    // Calculate the reputation score
    const score = await reputationClient.calculateReputationScore(
      serverId,
      'my-custom-algorithm'
    );
    
    console.log('Calculated reputation score:', score);
    
    // The score includes:
    // - Overall score
    // - Category scores
    // - Confidence metrics
    // - Data points used
    // - Timestamp
    
    return score;
  } catch (error) {
    console.error('Error calculating reputation score:', error);
  }
}

// Manually implement a custom reputation algorithm
async function implementCustomAlgorithm(components: IReputationDataComponents) {
  // Get raw metrics
  const uptime = components.performanceMetrics?.uptime_percentage || 0;
  const responseTime = components.performanceMetrics?.avg_response_time_ms || 0;
  const errorRate = components.performanceMetrics?.error_rate || 0;
  
  const verificationLevel = components.verificationDetails?.level || 'none';
  const avgRating = components.feedbackMetrics?.average_rating || 0;
  const reviewCount = components.feedbackMetrics?.rating_count || 0;
  
  // Calculate component scores (0-100)
  const performanceScore = calculatePerformanceScore(uptime, responseTime, errorRate);
  const verificationScore = calculateVerificationScore(verificationLevel);
  const feedbackScore = calculateFeedbackScore(avgRating, reviewCount);
  
  // Apply your algorithm's weights
  const overallScore = (
    performanceScore * 0.5 +
    verificationScore * 0.3 +
    feedbackScore * 0.2
  );
  
  // Calculate confidence based on data availability
  const confidence = calculateConfidenceMetrics(components);
  
  return {
    overallScore,
    categories: {
      performance: performanceScore,
      verification: verificationScore,
      feedback: feedbackScore
    },
    confidence
  };
}

// Helper functions for the custom algorithm
function calculatePerformanceScore(uptime: number, responseTime: number, errorRate: number): number {
  // Example: uptime is very important, followed by error rate, then response time
  const uptimeScore = normalizeValue(uptime, 95, 100, 0, 100);
  const responseTimeScore = normalizeValue(responseTime, 500, 50, 0, 100);
  const errorRateScore = normalizeValue(errorRate, 0.1, 0, 0, 100);
  
  return uptimeScore * 0.6 + responseTimeScore * 0.2 + errorRateScore * 0.2;
}

function calculateVerificationScore(level: string): number {
  switch (level.toLowerCase()) {
    case 'gold': return 100;
    case 'silver': return 75;
    case 'bronze': return 50;
    default: return 0;
  }
}

function calculateFeedbackScore(avgRating: number, reviewCount: number): number {
  const ratingScore = normalizeValue(avgRating, 1, 5, 0, 100);
  const countWeight = Math.min(reviewCount / 50, 1); // Max weight at 50+ reviews
  
  // If there are no reviews, the score is 0
  // As review count increases, we trust the average rating more
  return ratingScore * countWeight;
}

function calculateConfidenceMetrics(components: IReputationDataComponents) {
  // Implement confidence calculation logic here
  // Return values between 0-100 for each factor
  return {
    level: 75,
    factors: {
      data_completeness: 80,
      verification_level: 70,
      sample_size: 65
    }
  };
}

function normalizeValue(
  value: number,
  min: number,
  max: number,
  targetMin: number = 0,
  targetMax: number = 100
): number {
  // Ensure value is within range
  value = Math.max(min, Math.min(max, value));
  
  // Normalize to target range
  return targetMin + ((value - min) / (max - min)) * (targetMax - targetMin);
}

// Example usage
calculateServerScore('example-server-id');