/**
 * Client for working with verification information
 */

import { Client, RequestOptions } from "../../client/index.js";
import { 
  IVerificationStatus, 
  IVerificationHistory,
  IVerificationRequest,
  IVerificationBadge
} from "../types/types.js";

/**
 * Client for working with verification information
 */
export class VerificationClient {
  private client: Client;
  
  constructor(client: Client) {
    this.client = client;
  }
  
  /**
   * Gets the current verification status of a server
   * 
   * @param serverId - The ID of the server
   * @returns The verification status with level and details
   */
  async getVerificationStatus(
    serverId: string,
    options?: RequestOptions
  ): Promise<IVerificationStatus> {
    return await this.client.request(
      {
        method: "verification/status",
        params: { serverId }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Gets the verification history for a server
   * 
   * @param serverId - The ID of the server
   * @returns History of verification status changes
   */
  async getVerificationHistory(
    serverId: string,
    options?: RequestOptions
  ): Promise<IVerificationHistory> {
    return await this.client.request(
      {
        method: "verification/history",
        params: { serverId }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Initiates a verification level upgrade request
   * 
   * @param serverId - The ID of the server
   * @param targetLevel - The verification level to upgrade to
   * @param method - The verification method to use
   * @returns Verification instructions and token
   */
  async requestVerificationUpgrade(
    serverId: string,
    targetLevel: "bronze" | "silver" | "gold",
    method: string,
    options?: RequestOptions
  ): Promise<IVerificationRequest> {
    return await this.client.request(
      {
        method: "verification/request",
        params: { serverId, targetLevel, method }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Completes a verification request
   * 
   * @param verificationId - The ID of the verification request
   * @param proof - The verification proof
   * @returns Updated verification status
   */
  async completeVerification(
    verificationId: string,
    proof: string,
    options?: RequestOptions
  ): Promise<IVerificationStatus> {
    return await this.client.request(
      {
        method: "verification/complete",
        params: { verificationId, proof }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Gets a verification badge for a server
   * 
   * @param serverId - The ID of the server
   * @param format - The format of the badge
   * @returns The verification badge in the requested format
   */
  async getVerificationBadge(
    serverId: string,
    format: "svg" | "json" | "html" = "svg",
    options?: RequestOptions
  ): Promise<IVerificationBadge> {
    return await this.client.request(
      {
        method: "verification/badge",
        params: { serverId, format }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Checks a server's compliance with MCP standards
   * 
   * @param serverId - The ID of the server
   * @returns Compliance check results
   */
  async checkServerCompliance(
    serverId: string,
    options?: RequestOptions
  ): Promise<{
    serverId: string;
    compliant: boolean;
    checks: Array<{
      name: string;
      passed: boolean;
      details?: string;
    }>;
    overallScore: number;
    recommendations?: string[];
  }> {
    return await this.client.request(
      {
        method: "verification/compliance",
        params: { serverId }
      },
      // Return schema would be defined here
      options
    );
  }
}