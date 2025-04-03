/**
 * Tests for the reputation algorithm utilities
 */

import {
  applyTimeDecay,
  normalizeScore,
  detectOutliers,
  calculateConfidence,
  createWeightedAlgorithm
} from './algorithm.js';

describe('Reputation Algorithm Utilities', () => {
  describe('applyTimeDecay', () => {
    it('should halve the value at half-life', () => {
      const now = new Date();
      const halfLifeDays = 30;
      
      // Create a date exactly halfLifeDays ago
      const pastDate = new Date(now);
      pastDate.setDate(pastDate.getDate() - halfLifeDays);
      
      const value = 100;
      const decayedValue = applyTimeDecay(value, pastDate.toISOString(), halfLifeDays);
      
      expect(decayedValue).toBeCloseTo(50, 0);
    });
    
    it('should not decay recent values significantly', () => {
      const now = new Date();
      const halfLifeDays = 30;
      
      // Create a date 1 day ago
      const recentDate = new Date(now);
      recentDate.setDate(recentDate.getDate() - 1);
      
      const value = 100;
      const decayedValue = applyTimeDecay(value, recentDate.toISOString(), halfLifeDays);
      
      // After 1 day with 30-day half-life, value should be about 97.7
      expect(decayedValue).toBeGreaterThan(97);
    });
    
    it('should decay old values significantly', () => {
      const now = new Date();
      const halfLifeDays = 30;
      
      // Create a date 90 days ago (3 half-lives)
      const oldDate = new Date(now);
      oldDate.setDate(oldDate.getDate() - 90);
      
      const value = 100;
      const decayedValue = applyTimeDecay(value, oldDate.toISOString(), halfLifeDays);
      
      // After 3 half-lives, value should be about 12.5
      expect(decayedValue).toBeCloseTo(12.5, 0);
    });
  });
  
  describe('normalizeScore', () => {
    it('should normalize values within range to 0-100', () => {
      expect(normalizeScore(5, 0, 10)).toBe(50);
      expect(normalizeScore(7.5, 5, 10)).toBe(50);
      expect(normalizeScore(0, 0, 10)).toBe(0);
      expect(normalizeScore(10, 0, 10)).toBe(100);
    });
    
    it('should clamp values outside the range', () => {
      expect(normalizeScore(-5, 0, 10)).toBe(0);
      expect(normalizeScore(15, 0, 10)).toBe(100);
    });
  });
  
  describe('detectOutliers', () => {
    it('should detect high outliers', () => {
      const values = [2, 3, 3, 4, 4, 4, 5, 5, 20];
      const outliers = detectOutliers(values, 2);
      
      expect(outliers).toContain(8); // Index of value 20
    });
    
    it('should detect low outliers', () => {
      const values = [1, 10, 10, 11, 11, 12, 12, 13];
      const outliers = detectOutliers(values, 2);
      
      expect(outliers).toContain(0); // Index of value 1
    });
    
    it('should handle empty arrays', () => {
      expect(detectOutliers([])).toEqual([]);
    });
    
    it('should handle arrays with one element', () => {
      expect(detectOutliers([5])).toEqual([]);
    });
  });
  
  describe('calculateConfidence', () => {
    it('should calculate confidence based on data components', () => {
      const components = {
        feedbackMetrics: {
          rating_count: 20
        },
        verificationDetails: {
          level: 'silver'
        }
      };
      
      const confidence = calculateConfidence(components, {
        minReviews: 5,
        idealReviews: 25,
        minAge: 7,
        idealAge: 30,
        verificationImportance: 0.2
      });
      
      expect(confidence.level).toBeGreaterThan(0);
      expect(confidence.factors.sample_size).toBeGreaterThan(0);
      expect(confidence.factors.verification_level).toBe(75); // Silver level
    });
    
    it('should handle missing data components', () => {
      const emptyComponents = {};
      
      const confidence = calculateConfidence(emptyComponents, {
        minReviews: 5,
        idealReviews: 25,
        minAge: 7,
        idealAge: 30,
        verificationImportance: 0.2
      });
      
      expect(confidence.level).toBeGreaterThanOrEqual(0);
      expect(confidence.factors.sample_size).toBe(0);
      expect(confidence.factors.verification_level).toBe(0);
    });
  });
  
  describe('createWeightedAlgorithm', () => {
    it('should create a valid algorithm with the provided configuration', () => {
      const algorithm = createWeightedAlgorithm({
        weights: {
          performance: 0.4,
          verification: 0.3,
          feedback: 0.2,
          usage: 0.1
        },
        timeDecayDays: 30,
        minimumReviews: 5
      });
      
      expect(algorithm.id).toBe('weighted-score-v1');
      expect(algorithm.calculateScore).toBeInstanceOf(Function);
      expect(algorithm.config?.weights?.performance).toBe(0.4);
      expect(algorithm.config?.timeDecay?.halfLifeDays).toBe(30);
      expect(algorithm.config?.thresholds?.minimumDataPoints).toBe(5);
    });
    
    it('should generate a score when provided with data components', async () => {
      const algorithm = createWeightedAlgorithm({
        weights: {
          performance: 0.4,
          verification: 0.3,
          feedback: 0.2,
          usage: 0.1
        },
        timeDecayDays: 30,
        minimumReviews: 5
      });
      
      const components = {
        performanceMetrics: {
          uptime_percentage: 99.9,
          avg_response_time_ms: 150,
          error_rate: 0.01
        },
        verificationDetails: {
          level: 'gold',
          verified_at: new Date().toISOString(),
          methods: ['dns']
        },
        feedbackMetrics: {
          average_rating: 4.8,
          rating_count: 50
        },
        usageMetrics: {
          total_requests: 10000,
          unique_clients: 500,
          longevity_days: 90
        }
      };
      
      const score = await algorithm.calculateScore('test-server', components);
      
      expect(score.serverId).toBe('test-server');
      expect(score.overallScore).toBeGreaterThan(0);
      expect(score.overallScore).toBeLessThanOrEqual(100);
      expect(score.categories?.performance).toBeDefined();
      expect(score.categories?.verification).toBeDefined();
      expect(score.categories?.feedback).toBeDefined();
      expect(score.categories?.usage).toBeDefined();
      expect(score.confidence?.level).toBeGreaterThan(0);
      expect(score.algorithm).toBe('weighted-score-v1');
    });
  });
});