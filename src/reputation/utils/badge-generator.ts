/**
 * Utilities for generating reputation badges
 */

/**
 * Options for reputation badge display
 */
export interface BadgeOptions {
  showScore?: boolean;
  showVerification?: boolean;
  size?: "small" | "medium" | "large";
  theme?: "light" | "dark";
  showCategories?: string[];
}

/**
 * Options for badge image style
 */
export interface BadgeStyleOptions {
  format?: "svg" | "png";
  showScore?: boolean;
  showVerification?: boolean;
  theme?: "light" | "dark";
  width?: number;
  height?: number;
}

/**
 * Generates an HTML snippet for embedding a reputation badge
 * 
 * @param serverId - The ID of the server
 * @param options - Display options
 * @returns HTML string for embedding
 */
export function generateReputationBadgeHtml(
  serverId: string,
  options: BadgeOptions = {}
): string {
  const defaultOptions = {
    showScore: true,
    showVerification: true,
    size: "medium",
    theme: "light",
    showCategories: []
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Generate HTML for an iframe or div that loads the badge
  return `<div class="nanda-reputation-badge" 
    data-server-id="${serverId}"
    data-show-score="${mergedOptions.showScore}"
    data-show-verification="${mergedOptions.showVerification}" 
    data-size="${mergedOptions.size}"
    data-theme="${mergedOptions.theme}"
    data-categories="${(mergedOptions.showCategories || []).join(',')}">
  </div>
  <script src="https://cdn.nanda.io/badges/v1/badge.js" async></script>`;
}

/**
 * Generates a URL for a reputation badge image
 * 
 * @param serverId - The ID of the server
 * @param style - Badge style options
 * @returns URL to badge image
 */
export function getReputationBadgeUrl(
  serverId: string,
  style: BadgeStyleOptions = {}
): string {
  const defaultStyle = {
    format: "svg",
    showScore: true,
    showVerification: true,
    theme: "light"
  };
  
  const mergedStyle = { ...defaultStyle, ...style };
  
  const params = new URLSearchParams({
    showScore: String(mergedStyle.showScore),
    showVerification: String(mergedStyle.showVerification),
    theme: mergedStyle.theme
  });
  
  if (mergedStyle.width) params.append("width", String(mergedStyle.width));
  if (mergedStyle.height) params.append("height", String(mergedStyle.height));
  
  return `https://api.nanda.io/reputation/badge/${serverId}.${mergedStyle.format}?${params.toString()}`;
}

/**
 * Generates an SVG reputation badge that can be used inline
 * 
 * @param serverId - The ID of the server
 * @param score - Reputation score (0-100)
 * @param verificationLevel - Verification level
 * @param options - Display options
 * @returns SVG string
 */
export function generateInlineSvgBadge(
  serverId: string,
  score: number,
  verificationLevel: string = "none",
  options: {
    width?: number;
    height?: number;
    theme?: "light" | "dark";
  } = {}
): string {
  const width = options.width || 200;
  const height = options.height || 60;
  const theme = options.theme || "light";
  
  // Define colors based on theme
  const colors = theme === "light" 
    ? {
        background: "#ffffff",
        border: "#e0e0e0",
        text: "#333333",
        score: getScoreColor(score)
      }
    : {
        background: "#333333",
        border: "#555555",
        text: "#ffffff",
        score: getScoreColor(score)
      };
  
  // Define verification badge color
  const verificationColor = getVerificationColor(verificationLevel);
  
  // Format score for display
  const displayScore = Math.round(score);
  
  // Create SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${colors.background}" rx="6" ry="6" stroke="${colors.border}" stroke-width="1"/>
    <text x="10" y="20" font-family="Arial, sans-serif" font-size="12" fill="${colors.text}">NANDA Reputation</text>
    <text x="10" y="40" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${colors.score}">${displayScore}/100</text>
    <circle cx="${width - 20}" cy="20" r="8" fill="${verificationColor}"/>
    <text x="${width - 28}" y="${height - 12}" font-family="Arial, sans-serif" font-size="10" fill="${colors.text}">${verificationLevel}</text>
  </svg>`;
}

/**
 * Gets color for score display
 */
function getScoreColor(score: number): string {
  if (score >= 90) return "#4CAF50"; // Green
  if (score >= 70) return "#8BC34A"; // Light green
  if (score >= 50) return "#FFC107"; // Amber
  if (score >= 30) return "#FF9800"; // Orange
  return "#F44336"; // Red
}

/**
 * Gets color for verification level
 */
function getVerificationColor(level: string): string {
  switch (level.toLowerCase()) {
    case "gold":
      return "#FFD700";
    case "silver":
      return "#C0C0C0";
    case "bronze":
      return "#CD7F32";
    default:
      return "#E0E0E0";
  }
}