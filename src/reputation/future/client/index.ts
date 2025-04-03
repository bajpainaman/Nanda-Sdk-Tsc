/**
 * Comprehensive client for reputation functionality
 */

import { Client } from "../../client/index.js";
import { ReputationDataClient } from "./data.js";
import { ReviewClient } from "./reviews.js";
import { VerificationClient } from "./verification.js";
import { IReputationAlgorithm } from "../utils/algorithm.js";
import { IReputationStorage, LocalReputationStorage } from "../utils/storage.js";
import { IReputationScore } from "../types/types.js";

/**
 * Comprehensive client for reputation functionality
 */
export class ReputationClient {
  private client: Client;
  public data: ReputationDataClient;
  public reviews: ReviewClient;
  public verification: VerificationClient;
  private algorithms: Map<string, IReputationAlgorithm> = new Map();
  private storage: IReputationStorage;
  
  /**
   * Creates a new ReputationClient
   * 
   * @param client - The base MCP client
   * @param storage - Storage implementation for reputation data
   */
  constructor(
    client: Client,
    storage: IReputationStorage = new LocalReputationStorage()
  ) {
    this.client = client;
    this.data = new ReputationDataClient(client);
    this.reviews = new ReviewClient(client);
    this.verification = new VerificationClient(client);
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
   * Gets a registered algorithm by ID
   * 
   * @param algorithmId - The ID of the algorithm
   * @returns The algorithm implementation or undefined if not found
   */
  getAlgorithm(algorithmId: string): IReputationAlgorithm | undefined {
    return this.algorithms.get(algorithmId);
  }
  
  /**
   * Lists all registered algorithms
   * 
   * @returns Array of algorithm IDs and names
   */
  listAlgorithms(): Array<{ id: string; name: string; description: string }> {
    return Array.from(this.algorithms.values()).map(algorithm => ({
      id: algorithm.id,
      name: algorithm.name,
      description: algorithm.description
    }));
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