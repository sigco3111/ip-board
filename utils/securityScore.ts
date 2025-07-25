import { CloudflareTraceData } from '../types';

/**
 * Calculates a security score based on connection properties.
 * @param data The user's trace data.
 * @returns A score between 0 and 100.
 */
export const calculateSecurityScore = (data: CloudflareTraceData): number => {
  let score = 0;

  // TLS Score (max 35 points)
  if (data.tlsVersion === 'TLSv1.3') {
    score += 35;
  } else if (data.tlsVersion === 'TLSv1.2') {
    score += 15;
  }

  // HTTP Score (max 35 points)
  if (data.httpVersion === 'h3') {
    score += 35;
  } else if (data.httpVersion === 'http/2') {
    score += 25;
  }

  // WARP Bonus (max 30 points)
  if (data.warp === 'on') {
    score += 30;
  }

  // Ensure score is within 0-100 range
  return Math.min(100, Math.max(0, score));
};