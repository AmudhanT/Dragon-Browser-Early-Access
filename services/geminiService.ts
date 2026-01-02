
import { GoogleGenAI } from "@google/genai";

export interface DragonSearchResult {
  title: string;
  url: string;
  domain: string;
}

export interface DragonSearchResponse {
  answer: string;
  results: DragonSearchResult[];
  error?: 'QUOTA_EXHAUSTED' | 'INVALID_KEY' | 'UNKNOWN' | 'ENTITY_NOT_FOUND';
}

/**
 * Dragon AI Search
 * Utilizes Gemini 3 Flash for grounded web search.
 */
export const performDragonSearch = async (query: string): Promise<DragonSearchResponse> => {
  if (!query) return { answer: "Empty search query.", results: [] };
  
  // Rule: Initialize instance inside the call to get the latest API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{googleSearch: {}}],
        systemInstruction: `You are Dragon Browser's AI Search Engine.
        Provide a direct, comprehensive answer to the user's query.
        Keep the tone professional, concise, and helpful.`,
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    const answer = response.text || "No results found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const results: DragonSearchResult[] = [];

    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        try {
          const domain = new URL(chunk.web.uri).hostname.replace('www.', '');
          results.push({ title: chunk.web.title, url: chunk.web.uri, domain: domain });
        } catch (e) {}
      }
    });

    const uniqueResults = Array.from(new Set(results.map(r => r.url)))
      .map(url => results.find(r => r.url === url)!);

    return { answer, results: uniqueResults };

  } catch (error: any) {
    console.error("Dragon Neural Search Error:", error);
    
    const errText = error.message?.toLowerCase() || '';
    
    // Explicit detection for Quota (429)
    if (errText.includes('429') || errText.includes('quota') || errText.includes('exhausted')) {
      return { answer: "", results: [], error: 'QUOTA_EXHAUSTED' };
    }
    
    // Check for "Requested entity was not found" per instructions
    if (errText.includes('not found') || errText.includes('404')) {
      return { answer: "", results: [], error: 'ENTITY_NOT_FOUND' };
    }

    if (errText.includes('403') || errText.includes('invalid') || errText.includes('key')) {
      return { answer: "", results: [], error: 'INVALID_KEY' };
    }
    
    return { answer: "Search failed.", results: [], error: 'UNKNOWN' };
  }
};

/**
 * Omnibox Suggestion Algorithm
 * Switched to standard web autocomplete (DuckDuckGo) for instant, low-latency suggestions.
 * Removes dependency on Gemini API for simple autocompletions.
 */
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 2) return [];

  try {
    // Using DuckDuckGo Autocomplete API (CORS-friendly, Privacy-focused)
    const response = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    // DDG format: [ { phrase: "suggestion" }, ... ]
    if (Array.isArray(data)) {
      return data.map((item: any) => item.phrase).slice(0, 8);
    }
    return [];
  } catch (error) {
    // Silent fail for suggestions is better than error logging in omnibox
    return [];
  }
};
