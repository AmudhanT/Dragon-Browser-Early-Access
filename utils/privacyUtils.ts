
import { AppSettings } from '../types';

export type PrivacyGrade = 'A' | 'B' | 'C' | 'D';

export interface PrivacyScore {
  score: number;
  grade: PrivacyGrade;
  color: string;
  borderColor: string;
  bg: string;
  label: string;
  details: {
    https: boolean;
    trackerBlocking: boolean;
    adBlocking: boolean;
    safeBrowsing: boolean;
  }
}

export const calculatePrivacyScore = (url: string, settings: AppSettings): PrivacyScore => {
  // Dragon internal pages are always secure
  const isInternal = url.startsWith('dragon://');
  const isHttps = url.startsWith('https://') || isInternal;
  
  let score = 0;
  
  // HTTPS is the foundation (40 points)
  if (isHttps) score += 40;
  
  // Active Protections (25 points each)
  if (settings.trackerBlockingEnabled) score += 25;
  if (settings.adBlockEnabled) score += 25;
  
  // Safe Browsing (10 points)
  if (settings.safeBrowsing) score += 10;

  // Penalties
  if (!isHttps) {
    // If HTTP, cap score at 40 (D grade) regardless of other settings
    score = Math.min(score, 40); 
  }

  let grade: PrivacyGrade = 'D';
  let color = 'text-red-500';
  let borderColor = 'border-red-500';
  let bg = 'bg-red-500/10';
  let label = 'Weak';

  if (score >= 90) { 
    grade = 'A'; 
    color = 'text-green-500'; 
    borderColor = 'border-green-500';
    bg = 'bg-green-500/10';
    label = 'Excellent';
  } else if (score >= 70) { 
    grade = 'B'; 
    color = 'text-yellow-500'; 
    borderColor = 'border-yellow-500';
    bg = 'bg-yellow-500/10';
    label = 'Good';
  } else if (score >= 50) { 
    grade = 'C'; 
    color = 'text-orange-500'; 
    borderColor = 'border-orange-500';
    bg = 'bg-orange-500/10';
    label = 'Fair';
  }

  return {
    score,
    grade,
    color,
    borderColor,
    bg,
    label,
    details: {
      https: isHttps,
      trackerBlocking: settings.trackerBlockingEnabled,
      adBlocking: settings.adBlockEnabled,
      safeBrowsing: settings.safeBrowsing
    }
  };
};
