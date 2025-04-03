/**
 * Client for managing user reviews of servers
 */

import { Client, RequestOptions } from "../../client/index.js";
import {
  IUserReview,
  IServerReviews,
  IReviewUpdates
} from "../types/types.js";

/**
 * Client for managing user reviews of servers
 */
export class ReviewClient {
  private client: Client;
  
  constructor(client: Client) {
    this.client = client;
  }
  
  /**
   * Retrieves reviews for a server
   * 
   * @param serverId - The ID of the server
   * @param page - Page number for pagination
   * @param limit - Number of reviews per page
   * @returns Collection of reviews with pagination
   */
  async getServerReviews(
    serverId: string,
    page: number = 1,
    limit: number = 20,
    options?: RequestOptions
  ): Promise<IServerReviews> {
    return await this.client.request(
      {
        method: "reputation/reviews",
        params: { serverId, page, limit }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Submits a new review for a server
   * 
   * @param serverId - The ID of the server
   * @param rating - Numeric rating (typically 1-5)
   * @param reviewText - Optional text review
   * @param categories - Optional category-specific ratings
   * @returns The created review
   */
  async submitReview(
    serverId: string,
    rating: number,
    reviewText?: string,
    categories?: Record<string, number>,
    options?: RequestOptions
  ): Promise<IUserReview> {
    return await this.client.request(
      {
        method: "reputation/reviews/submit",
        params: { 
          serverId, 
          rating, 
          reviewText,
          categories
        }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Updates an existing review
   * 
   * @param reviewId - The ID of the review to update
   * @param updates - The updates to apply
   * @returns The updated review
   */
  async updateReview(
    reviewId: string,
    updates: IReviewUpdates,
    options?: RequestOptions
  ): Promise<IUserReview> {
    return await this.client.request(
      {
        method: "reputation/reviews/update",
        params: { reviewId, updates }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Deletes a review
   * 
   * @param reviewId - The ID of the review to delete
   */
  async deleteReview(
    reviewId: string,
    options?: RequestOptions
  ): Promise<void> {
    await this.client.request(
      {
        method: "reputation/reviews/delete",
        params: { reviewId }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Marks a review as helpful
   * 
   * @param reviewId - The ID of the review
   */
  async markReviewHelpful(
    reviewId: string,
    options?: RequestOptions
  ): Promise<void> {
    await this.client.request(
      {
        method: "reputation/reviews/helpful",
        params: { reviewId }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Flags a review as inappropriate
   * 
   * @param reviewId - The ID of the review
   * @param reason - Reason for flagging
   */
  async flagReview(
    reviewId: string,
    reason: string,
    options?: RequestOptions
  ): Promise<void> {
    await this.client.request(
      {
        method: "reputation/reviews/flag",
        params: { reviewId, reason }
      },
      // Return schema would be defined here
      options
    );
  }
  
  /**
   * Gets review history for the current user
   * 
   * @param page - Page number for pagination
   * @param limit - Number of reviews per page
   * @returns Collection of user's reviews with pagination
   */
  async getUserReviewHistory(
    page: number = 1,
    limit: number = 20,
    options?: RequestOptions
  ): Promise<IServerReviews> {
    return await this.client.request(
      {
        method: "reputation/reviews/user",
        params: { page, limit }
      },
      // Return schema would be defined here
      options
    );
  }
}