# NANDA Reputation System Documentation

**IMPORTANT: This is currently a prototype implementation and is not fully functional. It serves as a design specification for how the reputation system should work.**

The NANDA Reputation System is a toolkit for building reputation systems for MCP servers in the NANDA protocol. It provides a flexible, modular approach that allows developers to implement their own reputation algorithms while leveraging common building blocks.

## Table of Contents

1. [Overview](#overview)
2. [Key Concepts](#key-concepts)
3. [Getting Started](#getting-started)
4. [Components](#components)
5. [Building Custom Algorithms](#building-custom-algorithms)
6. [Displaying Reputation](#displaying-reputation)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

## Overview

The reputation system is designed with these principles in mind:

- **Flexibility**: Developers can create their own reputation algorithms
- **Modularity**: Use only the components you need
- **Transparency**: Reputation calculations are open and explainable
- **Data-driven**: Reputation is based on multiple data sources
- **Confidence awareness**: Scores include confidence metrics based on data quality

## Key Concepts

### Reputation Components

Reputation is calculated from multiple data components:

- **Performance metrics**: Uptime, response time, error rates
- **Verification**: Identity verification and certification
- **User feedback**: Ratings and reviews
- **Usage patterns**: Usage volume, consistency, client diversity

### Reputation Scores

Reputation scores typically include:

- **Overall score**: A numeric value (usually 0-100)
- **Category scores**: Granular scores for specific aspects
- **Confidence metrics**: Indicating reliability of the score
- **Data points**: Number of data points used in calculation
- **Timestamp**: When the score was calculated

### Algorithms

Algorithms define how reputation is calculated:

- **Weighted algorithms**: Apply weights to different factors
- **Time decay**: More recent data has more influence
- **Confidence calculation**: Based on data quantity and quality
- **Normalization**: Convert raw metrics to comparable scores

## Getting Started

### Installation

The reputation system is part of the MCP TypeScript SDK:

```bash
npm install @modelcontextprotocol/sdk
```

### Basic Usage

```typescript
import { Client } from '@modelcontextprotocol/sdk';
import { 
  ReputationClient,
  createWeightedAlgorithm
} from '@modelcontextprotocol/sdk/reputation';

// Create an MCP client
const client = new Client({ serverUrl: 'https://example-mcp-server.com' });

// Initialize reputation client
const reputation = new ReputationClient(client);

// Register a reputation algorithm
reputation.registerAlgorithm(createWeightedAlgorithm({
  weights: {
    performance: 0.4,
    verification: 0.3,
    feedback: 0.2,
    usage: 0.1
  }
}));

// Calculate reputation for a server
const score = await reputation.calculateReputationScore(
  'server-id',
  'weighted-score-v1'
);

console.log(`Overall score: ${score.overallScore}`);
```

## Components

### Clients

- **ReputationClient**: Main client for reputation functionality
- **ReputationDataClient**: Client for collecting reputation-related data
- **ReviewClient**: Client for managing user reviews
- **VerificationClient**: Client for working with verification information

### Data Types

- **IReputationDataComponents**: Components that inform reputation calculations
- **IReputationScore**: Common interface for reputation scores
- **IUserReview**: Structure for user-submitted reviews
- **IVerificationStatus**: Structure for verification-related data

### Utilities

- **Algorithm interfaces**: Define how reputation is calculated
- **Storage adapters**: Store and retrieve reputation data
- **Badge generation**: Create badges to display reputation

## Building Custom Algorithms

You can implement your own reputation algorithm:

```typescript
import { IReputationAlgorithm, IReputationDataComponents } from '@modelcontextprotocol/sdk/reputation';

// Create a custom algorithm
const myAlgorithm: IReputationAlgorithm = {
  id: 'my-custom-algorithm',
  name: 'My Custom Algorithm',
  description: 'A reputation algorithm with custom logic',
  version: '1.0.0',
  
  async calculateScore(serverId, components) {
    // Implement your reputation calculation logic here
    // Extract metrics from components
    const uptime = components.performanceMetrics?.uptime_percentage || 0;
    const avgRating = components.feedbackMetrics?.average_rating || 0;
    
    // Calculate category scores
    const performanceScore = calculatePerformanceScore(uptime);
    const feedbackScore = calculateFeedbackScore(avgRating);
    
    // Calculate overall score
    const overallScore = (performanceScore + feedbackScore) / 2;
    
    // Return reputation score
    return {
      serverId,
      overallScore,
      categories: {
        performance: performanceScore,
        feedback: feedbackScore
      },
      confidence: calculateConfidence(components),
      lastUpdated: new Date().toISOString(),
      dataPoints: countDataPoints(components),
      algorithm: this.id
    };
  }
};

// Helper functions
function calculatePerformanceScore(uptime) {
  // Convert uptime to score (0-100)
  return Math.min(100, uptime);
}

function calculateFeedbackScore(avgRating) {
  // Convert rating (e.g., 1-5) to score (0-100)
  return (avgRating / 5) * 100;
}

function calculateConfidence(components) {
  // Calculate confidence based on data quantity and quality
  // Return value between 0-100
  return { 
    level: 75, 
    factors: { 
      data_quality: 80, 
      sample_size: 70 
    } 
  };
}

function countDataPoints(components) {
  // Count the data points used in calculation
  let count = 0;
  if (components.performanceMetrics) count++;
  if (components.feedbackMetrics?.rating_count) count += components.feedbackMetrics.rating_count;
  // Add more counters as needed
  return count;
}

// Register the algorithm
reputationClient.registerAlgorithm(myAlgorithm);
```

Alternatively, use the helper function for weighted algorithms:

```typescript
import { createWeightedAlgorithm } from '@modelcontextprotocol/sdk/reputation';

const weightedAlgorithm = createWeightedAlgorithm({
  id: 'weighted-algorithm',
  name: 'Weighted Algorithm',
  description: 'Applies different weights to reputation components',
  weights: {
    performance: 0.4,
    verification: 0.3,
    feedback: 0.2,
    usage: 0.1
  },
  timeDecayDays: 30,  // Half-life in days
  minimumReviews: 5   // Minimum reviews for full confidence
});

reputationClient.registerAlgorithm(weightedAlgorithm);
```

## Displaying Reputation

Generate HTML badges to display reputation:

```typescript
import { 
  generateReputationBadgeHtml, 
  getReputationBadgeUrl, 
  generateInlineSvgBadge 
} from '@modelcontextprotocol/sdk/reputation';

// Generate HTML for embedding a badge
const badgeHtml = generateReputationBadgeHtml('server-id', {
  showScore: true,
  showVerification: true,
  size: 'medium',
  theme: 'light'
});

// Get a URL for a reputation badge image
const badgeUrl = getReputationBadgeUrl('server-id', {
  format: 'svg',
  theme: 'dark'
});

// Generate an inline SVG badge
const svgBadge = generateInlineSvgBadge(
  'server-id',
  85,             // score
  'silver',       // verification level
  { theme: 'dark' }
);
```

## Best Practices

### Designing Reputation Algorithms

- **Use multiple data sources**: Don't rely on a single metric
- **Apply appropriate weights**: Weight factors based on importance
- **Consider time decay**: Give more weight to recent data
- **Include confidence metrics**: Indicate reliability of scores
- **Normalize metrics**: Convert different metrics to comparable scales
- **Handle outliers**: Identify and manage extreme values
- **Be transparent**: Make algorithm details available to users

### Managing Reviews

- **Verify users**: Prioritize reviews from verified users
- **Track helpfulness**: Let users mark reviews as helpful
- **Detect spam**: Implement review quality checks
- **Consider recency**: Weight recent reviews more heavily
- **Support categories**: Allow rating different aspects

### Displaying Reputation

- **Show confidence**: Indicate the reliability of scores
- **Include components**: Break down overall score into components
- **Provide context**: Explain what scores mean
- **Use visual cues**: Colors and symbols can communicate quickly
- **Support embedding**: Allow embedding badges in websites

## Examples

See the [examples directory](../examples/reputation/) for complete examples:

- [Weighted Algorithm Example](../examples/reputation/weighted-algorithm.ts): Implementing a weighted reputation algorithm
- [Review System Example](../examples/reputation/review-system.ts): Managing server reviews