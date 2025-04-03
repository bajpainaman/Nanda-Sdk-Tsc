/**
 * Tests for the reputation storage adapters
 */

import { LocalReputationStorage } from './storage.js';

describe('Reputation Storage Adapters', () => {
  describe('LocalReputationStorage', () => {
    let storage: LocalReputationStorage;
    
    beforeEach(() => {
      storage = new LocalReputationStorage();
    });
    
    it('should save and retrieve a reputation score', async () => {
      const score = {
        serverId: 'test-server',
        overallScore: 85,
        categories: {
          performance: 90,
          verification: 75,
          feedback: 87,
          usage: 80
        },
        confidence: {
          level: 75,
          factors: {
            sample_size: 70,
            consistency: 80,
            diversity: 60,
            recency: 85,
            verification_level: 75
          }
        },
        lastUpdated: new Date().toISOString(),
        dataPoints: 42,
        algorithm: 'test-algorithm'
      };
      
      await storage.saveReputationScore(score);
      const retrieved = await storage.getReputationScore('test-server');
      
      expect(retrieved).toEqual(score);
    });
    
    it('should return null for a non-existent server', async () => {
      const retrieved = await storage.getReputationScore('non-existent-server');
      
      expect(retrieved).toBeNull();
    });
    
    it('should save and retrieve reputation history', async () => {
      const serverId = 'test-server';
      const score1 = {
        serverId,
        overallScore: 80,
        lastUpdated: new Date(Date.now() - 100000).toISOString(),
        algorithm: 'test-algorithm'
      };
      
      const score2 = {
        serverId,
        overallScore: 85,
        lastUpdated: new Date(Date.now() - 50000).toISOString(),
        algorithm: 'test-algorithm'
      };
      
      const score3 = {
        serverId,
        overallScore: 90,
        lastUpdated: new Date().toISOString(),
        algorithm: 'test-algorithm'
      };
      
      await storage.saveReputationScore(score1);
      await storage.saveReputationScore(score2);
      await storage.saveReputationScore(score3);
      
      const history = await storage.getReputationHistory(serverId);
      
      expect(history.length).toBe(3);
      expect(history[0]).toEqual(score1);
      expect(history[1]).toEqual(score2);
      expect(history[2]).toEqual(score3);
    });
    
    it('should limit history results when requested', async () => {
      const serverId = 'test-server';
      
      // Save 5 scores
      for (let i = 0; i < 5; i++) {
        await storage.saveReputationScore({
          serverId,
          overallScore: 80 + i,
          lastUpdated: new Date(Date.now() - (5 - i) * 10000).toISOString(),
          algorithm: 'test-algorithm'
        });
      }
      
      // Retrieve with limit 2
      const history = await storage.getReputationHistory(serverId, 2);
      
      expect(history.length).toBe(2);
      expect(history[0].overallScore).toBe(83); // 4th item (index 3)
      expect(history[1].overallScore).toBe(84); // 5th item (index 4)
    });
  });
});