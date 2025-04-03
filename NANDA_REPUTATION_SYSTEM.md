# NANDA Reputation System Architecture

## 1. Introduction

The NANDA Reputation System provides developers with a toolkit to implement and customize their own reputation scoring mechanisms for MCP servers in the NANDA protocol. Rather than prescribing a single reputation algorithm, this architecture offers building blocks, APIs, and data structures that developers can use to create reputation systems tailored to their specific requirements and use cases.

## 2. Core Components

### 2.1 Reputation Data Components

```typescript
// Data elements that can be collected to inform reputation
interface IReputationDataComponents {
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

// Individual user-submitted review
interface IUserReview {
  id: string;
  serverId: string;
  userId: string;
  displayName?: string;           // User's display name
  rating: number;                 // Numeric rating (e.g., 1-5)
  reviewText?: string;            // Optional review text
  helpful_count?: number;         // Users finding this helpful
  created_at: string;             // ISO timestamp
  updated_at: string;             // ISO timestamp
  is_verified_user?: boolean;     // User made verified transactions
  categories?: Record<string, number>; // Category-specific ratings
}
```

### 2.2 Reputation Score Structure

A common interface for reputation scores, regardless of how calculated:

```typescript
interface IReputationScore {
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
```

### 2.3 Verification Components

Structure for verification-related data: 

```typescript
interface IVerificationStatus {
  serverId: string;
  currentLevel: string;           // e.g., "none", "bronze", "silver", "gold"
  verifications: Array<{
    method: string;               // Verification method 
    timestamp: string;            // When verified
    status: string;               // Status of verification
    details?: Record<string, any>; // Method-specific details
    verifierInfo?: {              // Who performed verification
      id: string;
      name: string;
    };
  }>;
  badges?: Array<{               // Verification badges
    type: string;                 // Badge type
    imageUrl: string;             // Badge image URL
    criteria: string;             // Criteria for badge
  }>;
  lastChecked: string;            // Last verification check
}
```

### 2.4 Analytics Data Structure

Data structure for analytics that can inform reputation:

```typescript
interface IPerformanceMetrics {
  serverId: string;
  period_start: string;          // ISO timestamp
  period_end: string;            // ISO timestamp
  
  // Core metrics
  uptime_percentage: number;
  avg_response_time_ms: number;
  error_rate: number;
  successful_transactions: number;
  
  // Time series data
  timeline_data?: Array<{
    timestamp: string;           // ISO timestamp
    metric_type: string;         // Type of metric
    value: number;               // Metric value
  }>;
  
  // Optional detailed metrics
  request_distribution?: Record<string, number>; // Requests by endpoint
  error_distribution?: Record<string, number>;   // Errors by type
  response_time_percentiles?: Record<string, number>; // Response time distributions
}
```

## 3. API Design

### 3.1 Reputation Data Collection APIs

APIs for gathering data that can be used in reputation calculations:

```
GET    /api/v1/reputation/data/{server_id}              # Get all reputation data components
GET    /api/v1/reputation/data/{server_id}/performance  # Get performance metrics
GET    /api/v1/reputation/data/{server_id}/verification # Get verification details
GET    /api/v1/reputation/data/{server_id}/feedback     # Get user feedback data
GET    /api/v1/reputation/data/{server_id}/usage        # Get usage statistics
POST   /api/v1/reputation/data/{server_id}/custom       # Add custom metrics
```

### 3.2 Review Management APIs

APIs for managing user reviews:

```
GET    /api/v1/reputation/reviews/{server_id}           # Get server reviews
POST   /api/v1/reputation/reviews/{server_id}           # Submit a review
PUT    /api/v1/reputation/reviews/{review_id}           # Update a review
DELETE /api/v1/reputation/reviews/{review_id}           # Delete a review
POST   /api/v1/reputation/reviews/{review_id}/helpful   # Mark review helpful
POST   /api/v1/reputation/reviews/{review_id}/flag      # Flag inappropriate review
```

### 3.3 Verification APIs

APIs for verification information:

```
GET    /api/v1/verification/{server_id}/status          # Get verification status
GET    /api/v1/verification/{server_id}/history         # Get verification history
POST   /api/v1/verification/{server_id}/request         # Request verification
GET    /api/v1/verification/{server_id}/badge           # Get verification badge
```

### 3.4 Analytics Integration APIs

APIs for performance analytics:

```
GET    /api/v1/analytics/{server_id}/performance        # Get performance metrics
GET    /api/v1/analytics/{server_id}/errors             # Get error analysis
GET    /api/v1/analytics/{server_id}/usage              # Get usage patterns
GET    /api/v1/analytics/{server_id}/anomalies          # Get anomaly detection
```

## 4. Developer Customization Options

### 4.1 Reputation Algorithm Interface

Interface for plugging in custom reputation algorithms:

```typescript
interface IReputationAlgorithm {
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
```

### 4.2 Example Weight-Based Algorithm Template

```typescript
// Template for implementing a weighted scoring algorithm
function createWeightedAlgorithm(config: {
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
      // Implementation provided by developer...
      
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

### 4.3 Confidence Calculation Helper

```typescript
// Helper function for confidence calculation
function calculateConfidence(
  dataComponents: IReputationDataComponents, 
  config: {
    minReviews: number;
    idealReviews: number;
    minAge: number;
    idealAge: number;
    verificationImportance: number;
  }
): {level: number, factors: Record<string, number>} {
  // Sample implementation logic for developers to customize...
  
  return {
    level: 0, // Overall confidence level
    factors: {
      sample_size: 0,
      consistency: 0,
      diversity: 0,
      recency: 0,
      verification_level: 0
    }
  };
}
```

### 4.4 Time Decay Function

```typescript
// Helper function for applying time decay to data points
function applyTimeDecay(
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
```

## 5. Developer Tools

### 5.1 Reputation SDK Components

Instead of a monolithic reputation system, the SDK provides modular components:

1. **Data Collection Tools**: APIs and utilities for gathering reputation-relevant data
2. **Algorithm Templates**: Customizable templates for common reputation algorithms
3. **Storage Adapters**: Interfaces for storing and retrieving reputation data
4. **Visualization Components**: UI elements for displaying reputation information
5. **Testing Utilities**: Tools for testing and validating reputation systems

### 5.2 Verification Tools

Tools for implementing verification:

1. **Verification Request Handlers**: Process and manage verification requests
2. **Badge Generation**: Create and display verification badges
3. **Verification Checkers**: Perform verification checks
4. **Multi-Level Templates**: Templates for implementing tiered verification

### 5.3 Analytics Integration

Tools for collecting and processing analytics:

1. **Metric Collectors**: Standardized performance metrics collection
2. **Data Processors**: Processing raw data into structured formats
3. **Anomaly Detection**: Identifying unusual patterns
4. **Time Series Analysis**: Analyzing performance trends

### 5.4 Example User Interface Components

UI component templates that developers can customize:

1. **Rating Widget**: Customizable rating input component
2. **Reputation Display**: Visualization of reputation scores
3. **Review Display**: Component for showing user reviews
4. **Server Comparison**: Tool for comparing multiple servers
5. **Badge Display**: Component for showing verification badges

## 6. Implementation Strategies

### 6.1 Developer-Defined Reputation Models

Unlike traditional "black box" reputation systems, NANDA allows developers to:

1. **Define Their Own Models**: Choose what data to consider important
2. **Control Algorithms**: Implement specific algorithms tailored to their needs
3. **Handle Privacy Concerns**: Implement privacy policies specific to their domain
4. **Set Standards**: Establish domain-specific reputation criteria

### 6.2 Implementation Approaches

Different approaches developers might take:

1. **Simple Rating Average**: Basic rating average with optional weighting
2. **Comprehensive Multi-Factor**: Advanced system with multiple data sources
3. **Domain-Specific**: Specialized algorithms for specific domains
4. **Community-Governed**: Reputation determined by community consensus
5. **Hybrid Approaches**: Combining multiple techniques

### 6.3 Reputation Data Storage Options

Options for storing reputation data:

1. **Local Storage**: For simple, single-node implementations
2. **Distributed Database**: For scalable, multi-node systems
3. **Blockchain Anchoring**: For tamper-evident reputation records
4. **Hybrid Storage**: Combining approaches for different data types

## 7. Implementation Roadmap

### Phase 1: Core Data Structures and APIs
- Define interfaces for reputation data components
- Implement API endpoints for data collection
- Create base templates for algorithm implementation

### Phase 2: Developer Tools
- Build SDK components for data collection and processing
- Create customizable algorithm templates
- Develop testing utilities for verification

### Phase 3: User Interface Components
- Create UI components for displaying reputation
- Implement review collection and display widgets
- Build verification badge components

### Phase 4: Documentation and Examples
- Comprehensive documentation of the framework
- Example implementations of different approaches
- Best practices and guidelines

## 8. Conclusion

The NANDA Reputation System architecture provides developers with the building blocks needed to implement customized reputation systems for MCP servers. By offering flexible data structures, customizable algorithms, and standardized APIs rather than a one-size-fits-all approach, the system enables innovation while maintaining interoperability across the NANDA ecosystem.