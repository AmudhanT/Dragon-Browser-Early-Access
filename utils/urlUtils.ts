
import { SearchEngine } from '../types';

/**
 * DRAGON CORE OMNIBOX LOGIC (v5.0 Literal-Sync)
 * - Returns 1:1 literal URL strings.
 * - No smart brand mapping or cleaning.
 */

export const SEARCH_ENGINES_CONFIG: Record<string, { name: string, url: string }> = {
  google: { 
    name: "Google Global", 
    url: "https://www.google.com/search?igu=1&q=" 
  },
  dragon: { 
    name: "Dragon Search", 
    url: "https://www.google.com/search?igu=1&q=" 
  },
  bing: { 
    name: "Microsoft Bing", 
    url: "https://www.bing.com/search?q=" 
  }
};

export const enforceSovereignProtocol = (url: string): string => {
  if (!url) return url;
  let processed = url;

  // Inject iframe-bypass (igu=1) for Google domains to enable functionality in WebViews
  const isGoogle = processed.includes('google.com') || processed.includes('google.co.in');
  const hasIgu = processed.includes('igu=1');

  if (isGoogle && !hasIgu) {
    const separator = processed.includes('?') ? '&' : '?';
    const [base, hash] = processed.split('#');
    processed = `${base}${separator}igu=1${hash ? '#' + hash : ''}`;
  }
  
  return processed;
};

/**
 * DISPLAY: Returns the actual full URL string for the address bar (Chrome Style).
 */
export const cleanUrlForDisplay = (url: string): string => {
  if (!url || url === 'dragon://home') return '';
  return url;
};

/**
 * NORMALIZATION: Strict URL vs Search differentiation.
 */
export const normalizeUrl = (input: string, engine: SearchEngine = 'google', httpsOnly = false): string => {
  const query = input ? input.trim() : "";
  if (!query) return 'dragon://home';
  if (query.startsWith('dragon://')) return query;

  // 1. Check for protocol
  if (query.startsWith("http://") || query.startsWith("https://")) {
    if (httpsOnly && query.startsWith("http://")) {
      return enforceSovereignProtocol(query.replace("http://", "https://"));
    }
    return enforceSovereignProtocol(query);
  }

  // 2. Strict URL Rule: Must have a dot and NO spaces
  const hasDot = query.includes('.');
  const hasSpace = query.includes(' ');
  
  if (hasDot && !hasSpace) {
    return enforceSovereignProtocol(`https://${query}`);
  }
  
  // 3. Search Fallback
  const engineConfig = SEARCH_ENGINES_CONFIG[engine] || SEARCH_ENGINES_CONFIG.google;
  return enforceSovereignProtocol(`${engineConfig.url}${encodeURIComponent(query)}`);
};

export const getDisplayTitle = (url: string): string => {
  if (!url || url === 'dragon://home') return 'Dragon Search';
  try {
    // If translated, show original domain with indicator
    if (isTranslatedUrl(url)) {
      const original = getOriginalUrl(url);
      const host = new URL(original).hostname.replace('www.', '');
      return `Translated: ${host.charAt(0).toUpperCase() + host.slice(1)}`;
    }
    const urlObj = new URL(url);
    const host = urlObj.hostname.replace('www.', '');
    return host.charAt(0).toUpperCase() + host.slice(1);
  } catch {
    return url;
  }
};

// --- Translation Utils ---

export const getTranslateUrl = (currentUrl: string, targetLangCode: string): string => {
  if (!currentUrl || currentUrl.startsWith('dragon://')) return currentUrl;
  // Strip region code (e.g. 'ta-IN' -> 'ta') to fit Google Translate params
  const lang = targetLangCode.split('-')[0];
  return `https://translate.google.com/translate?sl=auto&tl=${lang}&u=${encodeURIComponent(currentUrl)}`;
};

export const isTranslatedUrl = (url: string): boolean => {
  return url.includes('translate.google.com/translate');
};

export const getOriginalUrl = (translatedUrl: string): string => {
  try {
    const urlObj = new URL(translatedUrl);
    const original = urlObj.searchParams.get('u');
    return original || translatedUrl;
  } catch {
    return translatedUrl;
  }
};
