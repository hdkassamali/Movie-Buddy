import { useQuery, useInfiniteQuery, QueryClient } from '@tanstack/react-query';
import {
  searchMulti,
  getMovieDetails,
  getTVShowDetails,
  getMovieCredits,
  getTVShowCredits,
  discoverMovies,
  discoverTVShows,
  getTrending,
  TMDBApiError,
} from '../lib/tmdb';
import type {
  TMDBDiscoverMovieResponse,
  TMDBDiscoverTVResponse,
  MovieSearchOptions,
  TVSearchOptions,
  DetailOptions,
} from '../types/tmdb';

// Query keys for consistent caching
export const tmdbKeys = {
  all: ['tmdb'] as const,
  search: () => [...tmdbKeys.all, 'search'] as const,
  searchMovies: (query: string, options?: MovieSearchOptions) =>
    [...tmdbKeys.search(), 'movies', query, options] as const,
  searchTVShows: (query: string, options?: TVSearchOptions) =>
    [...tmdbKeys.search(), 'tv', query, options] as const,
  searchMulti: (
    query: string,
    options?: { page?: number; language?: string }
  ) => [...tmdbKeys.search(), 'multi', query, options] as const,

  details: () => [...tmdbKeys.all, 'details'] as const,
  movieDetails: (id: number, options?: DetailOptions) =>
    [...tmdbKeys.details(), 'movie', id, options] as const,
  tvDetails: (id: number, options?: DetailOptions) =>
    [...tmdbKeys.details(), 'tv', id, options] as const,

  credits: () => [...tmdbKeys.all, 'credits'] as const,
  movieCredits: (id: number, options?: { language?: string }) =>
    [...tmdbKeys.credits(), 'movie', id, options] as const,
  tvCredits: (id: number, options?: { language?: string }) =>
    [...tmdbKeys.credits(), 'tv', id, options] as const,

  discover: () => [...tmdbKeys.all, 'discover'] as const,
  discoverMovies: (options?: Record<string, unknown>) =>
    [...tmdbKeys.discover(), 'movies', options] as const,
  discoverTVShows: (options?: Record<string, unknown>) =>
    [...tmdbKeys.discover(), 'tv', options] as const,

  genres: () => [...tmdbKeys.all, 'genres'] as const,
  genreList: (type: 'movie' | 'tv', language?: string) =>
    [...tmdbKeys.genres(), type, language] as const,

  trending: () => [...tmdbKeys.all, 'trending'] as const,
  trendingList: (
    mediaType: 'movie' | 'tv' | 'person' | 'all',
    timeWindow: 'day' | 'week',
    options?: Record<string, unknown>
  ) => [...tmdbKeys.trending(), mediaType, timeWindow, options] as const,
};

// Search hooks
export function useSearchMovies(
  query: string,
  options: MovieSearchOptions = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: tmdbKeys.searchMovies(query, options),
    queryFn: async () => {
      const params = new URLSearchParams({
        query,
        ...(options.page && { page: options.page.toString() }),
        ...(options.year && { year: options.year.toString() }),
        ...(options.language && { language: options.language }),
      });

      const response = await fetch(`/api/search/movies?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search movies');
      }
      return response.json();
    },
    enabled: queryOptions.enabled !== false && !!query.trim(),
    staleTime: queryOptions.staleTime ?? 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a client error or rate limit
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useSearchTVShows(
  query: string,
  options: TVSearchOptions = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: tmdbKeys.searchTVShows(query, options),
    queryFn: async () => {
      const params = new URLSearchParams({
        query,
        ...(options.page && { page: options.page.toString() }),
        ...(options.firstAirDateYear && {
          firstAirDateYear: options.firstAirDateYear.toString(),
        }),
        ...(options.language && { language: options.language }),
      });

      const response = await fetch(`/api/search/tv?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search TV shows');
      }
      return response.json();
    },
    enabled: queryOptions.enabled !== false && !!query.trim(),
    staleTime: queryOptions.staleTime ?? 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useSearchMulti(
  query: string,
  options: { page?: number; language?: string } = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: tmdbKeys.searchMulti(query, options),
    queryFn: () => searchMulti(query, options),
    enabled: queryOptions.enabled !== false && !!query.trim(),
    staleTime: queryOptions.staleTime ?? 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Details hooks
export function useMovieDetails(
  movieId: number,
  options: DetailOptions = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: tmdbKeys.movieDetails(movieId, options),
    queryFn: () => getMovieDetails(movieId, options),
    enabled: queryOptions.enabled !== false && !!movieId,
    staleTime: queryOptions.staleTime ?? 10 * 60 * 1000, // 10 minutes - details change less frequently
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useTVShowDetails(
  tvId: number,
  options: DetailOptions = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: tmdbKeys.tvDetails(tvId, options),
    queryFn: () => getTVShowDetails(tvId, options),
    enabled: queryOptions.enabled !== false && !!tvId,
    staleTime: queryOptions.staleTime ?? 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Credits hooks
export function useMovieCredits(
  movieId: number,
  options: { language?: string } = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: tmdbKeys.movieCredits(movieId, options),
    queryFn: () => getMovieCredits(movieId, options),
    enabled: queryOptions.enabled !== false && !!movieId,
    staleTime: queryOptions.staleTime ?? 15 * 60 * 1000, // 15 minutes - credits rarely change
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useTVShowCredits(
  tvId: number,
  options: { language?: string } = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: tmdbKeys.tvCredits(tvId, options),
    queryFn: () => getTVShowCredits(tvId, options),
    enabled: queryOptions.enabled !== false && !!tvId,
    staleTime: queryOptions.staleTime ?? 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Discover hooks with infinite query support
export function useDiscoverMovies(
  options: Record<string, unknown> = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useInfiniteQuery({
    queryKey: tmdbKeys.discoverMovies(options),
    queryFn: ({ pageParam = 1 }) =>
      discoverMovies({ ...options, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: TMDBDiscoverMovieResponse) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: queryOptions.staleTime ?? 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useDiscoverTVShows(
  options: Record<string, unknown> = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useInfiniteQuery({
    queryKey: tmdbKeys.discoverTVShows(options),
    queryFn: ({ pageParam = 1 }) =>
      discoverTVShows({ ...options, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: TMDBDiscoverTVResponse) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: queryOptions.staleTime ?? 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Utility hooks
export function useGenres(
  type: 'movie' | 'tv',
  language = 'en-US',
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: tmdbKeys.genreList(type, language),
    queryFn: async () => {
      const params = new URLSearchParams({
        type,
        language,
      });

      const response = await fetch(`/api/genres?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      return response.json();
    },
    enabled: queryOptions.enabled !== false,
    staleTime: queryOptions.staleTime ?? 24 * 60 * 60 * 1000, // 24 hours - genres rarely change
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useTrending(
  mediaType: 'movie' | 'tv' | 'person' | 'all',
  timeWindow: 'day' | 'week' = 'week',
  options: { page?: number; language?: string } = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: tmdbKeys.trendingList(mediaType, timeWindow, options),
    queryFn: () => getTrending(mediaType, timeWindow, options),
    enabled: queryOptions.enabled !== false,
    staleTime: queryOptions.staleTime ?? 30 * 60 * 1000, // 30 minutes - trending changes frequently
    retry: (failureCount, error) => {
      if (
        error instanceof TMDBApiError &&
        (error.statusCode < 500 || error.isRateLimit)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Utility functions for cache management
export function prefetchMovieDetails(
  queryClient: QueryClient,
  movieId: number,
  options: DetailOptions = {}
) {
  return queryClient.prefetchQuery({
    queryKey: tmdbKeys.movieDetails(movieId, options),
    queryFn: () => getMovieDetails(movieId, options),
    staleTime: 10 * 60 * 1000,
  });
}

export function prefetchTVShowDetails(
  queryClient: QueryClient,
  tvId: number,
  options: DetailOptions = {}
) {
  return queryClient.prefetchQuery({
    queryKey: tmdbKeys.tvDetails(tvId, options),
    queryFn: () => getTVShowDetails(tvId, options),
    staleTime: 10 * 60 * 1000,
  });
}

// Cache invalidation helpers
export function invalidateSearchCache(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: tmdbKeys.search(),
  });
}

export function invalidateMovieCache(
  queryClient: QueryClient,
  movieId?: number
) {
  if (movieId) {
    return queryClient.invalidateQueries({
      queryKey: [...tmdbKeys.details(), 'movie', movieId],
    });
  }
  return queryClient.invalidateQueries({
    queryKey: [...tmdbKeys.details(), 'movie'],
  });
}

export function invalidateTVCache(queryClient: QueryClient, tvId?: number) {
  if (tvId) {
    return queryClient.invalidateQueries({
      queryKey: [...tmdbKeys.details(), 'tv', tvId],
    });
  }
  return queryClient.invalidateQueries({
    queryKey: [...tmdbKeys.details(), 'tv'],
  });
}
