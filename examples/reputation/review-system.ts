/**
 * Example implementation of a review system for servers
 */

import { Client } from '../../src/client/index.js';
import {
  ReputationClient,
  ReviewClient,
  IUserReview
} from '../../src/reputation.js';

// Create an MCP client
const client = new Client({
  serverUrl: 'https://example-mcp-server.com'
});

// Initialize reputation client
const reputationClient = new ReputationClient(client);

// Alternatively, initialize just the review client directly
const reviewClient = new ReviewClient(client);

// Example: Submit a new review for a server
async function submitNewReview(
  serverId: string,
  rating: number,
  reviewText?: string,
  categoryRatings?: Record<string, number>
) {
  try {
    const review = await reviewClient.submitReview(
      serverId,
      rating,
      reviewText,
      categoryRatings
    );
    
    console.log('Review submitted successfully:', review);
    return review;
  } catch (error) {
    console.error('Error submitting review:', error);
  }
}

// Example: Get all reviews for a server with pagination
async function getServerReviews(serverId: string, page: number = 1) {
  try {
    const reviewsData = await reviewClient.getServerReviews(serverId, page, 20);
    
    console.log(`Showing page ${page} of ${reviewsData.pagination.totalPages}`);
    console.log(`Total reviews: ${reviewsData.totalReviews}`);
    console.log(`Average rating: ${reviewsData.averageRating.toFixed(1)}`);
    
    // Process each review
    reviewsData.reviews.forEach((review, index) => {
      console.log(`\nReview #${index + 1}:`);
      console.log(`Rating: ${review.rating}/5`);
      if (review.reviewText) {
        console.log(`Text: ${review.reviewText}`);
      }
      console.log(`By: ${review.displayName || 'Anonymous'}`);
      console.log(`Date: ${new Date(review.created_at).toLocaleDateString()}`);
      
      if (review.categories && Object.keys(review.categories).length > 0) {
        console.log('Category ratings:');
        Object.entries(review.categories).forEach(([category, rating]) => {
          console.log(`  - ${category}: ${rating}/5`);
        });
      }
    });
    
    // Handle pagination
    if (reviewsData.pagination.hasNext) {
      console.log('\nNext page available.');
    }
    
    return reviewsData;
  } catch (error) {
    console.error('Error getting server reviews:', error);
  }
}

// Example: Update an existing review
async function updateExistingReview(
  reviewId: string,
  updates: {
    rating?: number;
    reviewText?: string;
    categories?: Record<string, number>;
  }
) {
  try {
    const updatedReview = await reviewClient.updateReview(reviewId, updates);
    console.log('Review updated successfully:', updatedReview);
    return updatedReview;
  } catch (error) {
    console.error('Error updating review:', error);
  }
}

// Example: Mark a review as helpful
async function markReviewAsHelpful(reviewId: string) {
  try {
    await reviewClient.markReviewHelpful(reviewId);
    console.log('Review marked as helpful.');
  } catch (error) {
    console.error('Error marking review as helpful:', error);
  }
}

// Example: Create a custom review display component
function createReviewComponent(review: IUserReview): string {
  const verifiedBadge = review.is_verified_user 
    ? '<span class="verified-badge">✓ Verified User</span>' 
    : '';
  
  const stars = '★'.repeat(Math.floor(review.rating)) + 
               '☆'.repeat(5 - Math.floor(review.rating));
  
  const helpfulCount = review.helpful_count 
    ? `<div class="helpful">${review.helpful_count} found this helpful</div>` 
    : '';
  
  return `
    <div class="review">
      <div class="review-header">
        <span class="author">${review.displayName || 'Anonymous'}</span>
        ${verifiedBadge}
        <span class="date">${new Date(review.created_at).toLocaleDateString()}</span>
      </div>
      <div class="rating">${stars} ${review.rating.toFixed(1)}</div>
      <div class="review-text">${review.reviewText || ''}</div>
      ${helpfulCount}
      <button class="helpful-button" data-review-id="${review.id}">Mark as Helpful</button>
    </div>
  `;
}

// Example usage
const serverId = 'example-server-id';

// Submit a review
submitNewReview(
  serverId,
  4.5,
  'This server has excellent performance and reliability. Highly recommended!',
  {
    performance: 5,
    reliability: 4,
    support: 4.5
  }
);

// Get reviews for the server
getServerReviews(serverId);