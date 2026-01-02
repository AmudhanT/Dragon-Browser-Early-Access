
import { useState, useCallback, useEffect } from 'react';
import { getSearchSuggestions } from '../services/geminiService';

// Local Simulation for Trending Topics (No API Key Required)
const getLocalTrendingSearches = async (): Promise<string[]> => {
  const trends = [
    "Artificial Intelligence",
    "Latest Tech News",
    "Dragon Browser Features",
    "Crypto Market",
    "Space Exploration",
    "Global Weather",
    "Sustainable Energy",
    "Cybersecurity Tips",
    "New Movies 2025",
    "Healthy Recipes"
  ];
  // Shuffle for variety
  return trends.sort(() => 0.5 - Math.random()).slice(0, 6);
};

export const useDragonAI = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTrends = async () => {
      // Use local logic instead of service call
      const trends = await getLocalTrendingSearches();
      setTrending(trends);
    };
    loadTrends();
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await getSearchSuggestions(query);
      setSuggestions(results);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    suggestions,
    trending,
    fetchSuggestions,
    setSuggestions,
    isLoading
  };
};
