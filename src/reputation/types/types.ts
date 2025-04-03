/**
 * Core reputation data types for the NANDA protocol
 */

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
  customFields?: Record<string, unknown>; // Developer-defined fields
}

/**
 * Structure for verification-related data
 */
export interface IVerificationStatus {
  serverId: string;
  currentLevel: string;           // e.g., "none", "bronze", "silver", "gold"
  verifications: Array<{
    method: string;               // Verification method 
    timestamp: string;            // When verified
    status: string;               // Status of verification
    details?: Record<string, unknown>; // Method-specific details
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

/**
 * Performance metrics for a server
 */
export interface IPerformanceMetrics {
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

/**
 * Aggregated feedback data for a server
 */
export interface IFeedbackData {
  serverId: string;
  average_rating: number;
  rating_count: number;
  rating_distribution: number[];
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  common_themes?: string[];
  recent_reviews_count?: number;
}

/**
 * Usage statistics for a server
 */
export interface IUsageStatistics {
  serverId: string;
  total_requests: number;
  unique_clients: number;
  longevity_days: number;
  daily_average_requests: number;
  peak_requests: number;
  peak_timestamp: string;
  usage_trend: "increasing" | "decreasing" | "stable";
  client_diversity: number;       // 0-1 measure of client diversity
  usage_patterns?: {
    hourly_distribution: number[];
    weekly_distribution: number[];
  };
}

/**
 * Individual user-submitted review
 */
export interface IUserReview {
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

/**
 * Collection of server reviews with pagination
 */
export interface IServerReviews {
  serverId: string;
  totalReviews: number;
  averageRating: number;
  reviews: IUserReview[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Updates to apply to a review
 */
export interface IReviewUpdates {
  rating?: number;
  reviewText?: string;
  categories?: Record<string, number>;
}

/**
 * Response containing error anomalies detected for a server
 */
export interface IAnomalyDetection {
  serverId: string;
  anomalies: Array<{
    metric_type: string;
    timestamp: string;
    expected_value: number;
    actual_value: number;
    deviation_percentage: number;
    severity: "low" | "medium" | "high";
    description: string;
  }>;
  analysis_period: {
    start: string;
    end: string;
  };
  total_anomalies_count: number;
}

/**
 * Error analysis for a server
 */
export interface IErrorAnalysis {
  serverId: string;
  period: string;
  total_errors: number;
  error_rate: number;
  error_types: Record<string, number>;
  most_common_errors: Array<{
    error_type: string;
    count: number;
    percentage: number;
    example?: string;
  }>;
  error_trend: "increasing" | "decreasing" | "stable";
}

/**
 * History of verification status changes
 */
export interface IVerificationHistory {
  serverId: string;
  current_level: string;
  history: Array<{
    timestamp: string;
    action: string;
    level: string;
    method?: string;
    success: boolean;
    details?: string;
  }>;
}

/**
 * Request to verify a server
 */
export interface IVerificationRequest {
  id: string;
  serverId: string;
  method: string;
  status: string;
  created_at: string;
  verification_token?: string;
  instructions?: string;
  expiration?: string;
}

/**
 * Verification badge for a server
 */
export interface IVerificationBadge {
  serverId: string;
  level: string;
  badge_url: string;
  verified_at: string;
  html?: string;
  svg?: string;
}