/**
 * Reputation storage interfaces and implementations
 */

import { IReputationScore } from "../types/types.js";

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
 * Implementation of reputation storage using local memory
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
 * Implementation of reputation storage using browser's localStorage
 * For client-side applications
 */
export class BrowserLocalStorageAdapter implements IReputationStorage {
  private readonly CURRENT_SCORES_KEY = 'nanda_reputation_scores';
  private readonly HISTORY_PREFIX = 'nanda_reputation_history_';
  
  constructor() {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available in this environment');
    }
  }
  
  async saveReputationScore(score: IReputationScore): Promise<void> {
    try {
      // Save current score
      const scoresJson = localStorage.getItem(this.CURRENT_SCORES_KEY) || '{}';
      const scores = JSON.parse(scoresJson);
      scores[score.serverId] = score;
      localStorage.setItem(this.CURRENT_SCORES_KEY, JSON.stringify(scores));
      
      // Update history
      const historyKey = this.HISTORY_PREFIX + score.serverId;
      const historyJson = localStorage.getItem(historyKey) || '[]';
      const history = JSON.parse(historyJson);
      history.push(score);
      
      // Limit history size to prevent localStorage from growing too large
      const maxHistorySize = 100;
      if (history.length > maxHistorySize) {
        history.splice(0, history.length - maxHistorySize);
      }
      
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving reputation score to localStorage:', error);
      throw error;
    }
  }
  
  async getReputationScore(serverId: string): Promise<IReputationScore | null> {
    try {
      const scoresJson = localStorage.getItem(this.CURRENT_SCORES_KEY) || '{}';
      const scores = JSON.parse(scoresJson);
      return scores[serverId] || null;
    } catch (error) {
      console.error('Error retrieving reputation score from localStorage:', error);
      return null;
    }
  }
  
  async getReputationHistory(
    serverId: string,
    limit: number = 10
  ): Promise<IReputationScore[]> {
    try {
      const historyKey = this.HISTORY_PREFIX + serverId;
      const historyJson = localStorage.getItem(historyKey) || '[]';
      const history = JSON.parse(historyJson);
      
      return history.slice(-limit);
    } catch (error) {
      console.error('Error retrieving reputation history from localStorage:', error);
      return [];
    }
  }
}

/**
 * Example implementation for database storage
 * This is just a template - developers would implement their own
 */
export class DatabaseReputationStorage implements IReputationStorage {
  // Connection details would be provided in constructor
  constructor(
    // private dbConnection: any,
    private tableName: string = 'reputation_scores',
    private historyTableName: string = 'reputation_history'
  ) {
    // Initialize database connection
  }
  
  async saveReputationScore(_score: IReputationScore): Promise<void> {
    // In a real implementation, this would save to a database
    // Example pseudo-code:
    /*
    await this.dbConnection.query(
      `INSERT INTO ${this.tableName} (server_id, overall_score, categories, confidence, last_updated, data_points, algorithm)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       overall_score = VALUES(overall_score),
       categories = VALUES(categories),
       confidence = VALUES(confidence),
       last_updated = VALUES(last_updated),
       data_points = VALUES(data_points),
       algorithm = VALUES(algorithm)`,
      [
        _score.serverId,
        _score.overallScore,
        JSON.stringify(_score.categories),
        JSON.stringify(_score.confidence),
        _score.lastUpdated,
        _score.dataPoints,
        _score.algorithm
      ]
    );
    
    // Save to history
    await this.dbConnection.query(
      `INSERT INTO ${this.historyTableName} (server_id, overall_score, categories, confidence, timestamp, data_points, algorithm)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        _score.serverId,
        _score.overallScore,
        JSON.stringify(_score.categories),
        JSON.stringify(_score.confidence),
        _score.lastUpdated,
        _score.dataPoints,
        _score.algorithm
      ]
    );
    */
  }
  
  async getReputationScore(_serverId: string): Promise<IReputationScore | null> {
    // In a real implementation, this would query a database
    // Example pseudo-code:
    /*
    const result = await this.dbConnection.query(
      `SELECT * FROM ${this.tableName} WHERE server_id = ? LIMIT 1`,
      [_serverId]
    );
    
    if (result.length === 0) {
      return null;
    }
    
    const row = result[0];
    return {
      serverId: row.server_id,
      overallScore: row.overall_score,
      categories: JSON.parse(row.categories),
      confidence: JSON.parse(row.confidence),
      lastUpdated: row.last_updated,
      dataPoints: row.data_points,
      algorithm: row.algorithm
    };
    */
    
    return null; // Placeholder
  }
  
  async getReputationHistory(
    serverId: string,
    _limit: number = 10
  ): Promise<IReputationScore[]> {
    // In a real implementation, this would query a database
    // Example pseudo-code:
    /*
    const result = await this.dbConnection.query(
      `SELECT * FROM ${this.historyTableName} 
       WHERE server_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [serverId, _limit]
    );
    
    return result.map(row => ({
      serverId: row.server_id,
      overallScore: row.overall_score,
      categories: JSON.parse(row.categories),
      confidence: JSON.parse(row.confidence),
      lastUpdated: row.timestamp,
      dataPoints: row.data_points,
      algorithm: row.algorithm
    }));
    */
    
    return []; // Placeholder
  }
}