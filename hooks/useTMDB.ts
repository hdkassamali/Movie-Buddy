import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type {
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBCredits,
  TMDBMovieSearchResponse,
  TMDBTVShowSearchResponse,
  TMDBGenreList,
  MovieSearchOptions,
  TVSearchOptions,
} from '../types/tmdb';

// Type aliases for convenience
export type MovieDetails = TMDBMovieDetails;
export type TVShowDetails = TMDBTVShowDetails;
export type MovieCredits = TMDBCredits;
export type TVShowCredits = TMDBCredits;

// Helper function to create consistent API clients for server-side routes
function createTMDBClient() {
  return {
    movies: {
      getDetails: async (id: number): Promise<MovieDetails> => {
        const response = await fetch(`/api/movie/${id}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch movie details: ${response.statusText}`
          );
        }
        return response.json();
      },
      getCredits: async (id: number): Promise<MovieCredits> => {
        const response = await fetch(`/api/movie/${id}/credits`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch movie credits: ${response.statusText}`
          );
        }
        return response.json();
      },
      search: async (
        query: string,
        options: MovieSearchOptions = {}
      ): Promise<TMDBMovieSearchResponse> => {
        const params = new URLSearchParams({ query });
        if (options.page) params.append('page', options.page.toString());
        if (options.year) params.append('year', options.year.toString());
        if (options.language) params.append('language', options.language);

        const response = await fetch(`/api/search/movies?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to search movies: ${response.statusText}`);
        }
        return response.json();
      },
    },
    tv: {
      getDetails: async (id: number): Promise<TVShowDetails> => {
        const response = await fetch(`/api/tv/${id}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch TV show details: ${response.statusText}`
          );
        }
        return response.json();
      },
      getCredits: async (id: number): Promise<TVShowCredits> => {
        const response = await fetch(`/api/tv/${id}/credits`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch TV show credits: ${response.statusText}`
          );
        }
        return response.json();
      },
      search: async (
        query: string,
        options: TVSearchOptions = {}
      ): Promise<TMDBTVShowSearchResponse> => {
        const params = new URLSearchParams({ query });
        if (options.page) params.append('page', options.page.toString());
        if (options.firstAirDateYear)
          params.append(
            'firstAirDateYear',
            options.firstAirDateYear.toString()
          );
        if (options.language) params.append('language', options.language);

        const response = await fetch(`/api/search/tv?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to search TV shows: ${response.statusText}`);
        }
        return response.json();
      },
    },
    genres: {
      get: async (
        type: 'movie' | 'tv',
        language = 'en-US'
      ): Promise<TMDBGenreList> => {
        const params = new URLSearchParams({ type, language });
        const response = await fetch(`/api/genres?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch genres: ${response.statusText}`);
        }
        return response.json();
      },
    },
  };
}

// React Query hooks with proper caching
export function useMovieDetails(
  id: number,
  queryOptions?: Omit<UseQueryOptions<MovieDetails>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['movie', 'details', id],
    queryFn: () => createTMDBClient().movies.getDetails(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in newer React Query)
    ...queryOptions,
  });
}

export function useMovieCredits(
  id: number,
  queryOptions?: Omit<UseQueryOptions<MovieCredits>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['movie', 'credits', id],
    queryFn: () => createTMDBClient().movies.getCredits(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

export function useTVShowDetails(
  id: number,
  queryOptions?: Omit<UseQueryOptions<TVShowDetails>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['tv', 'details', id],
    queryFn: () => createTMDBClient().tv.getDetails(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

export function useTVShowCredits(
  id: number,
  queryOptions?: Omit<UseQueryOptions<TVShowCredits>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['tv', 'credits', id],
    queryFn: () => createTMDBClient().tv.getCredits(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

// Search hooks
export function useSearchMovies(
  query: string,
  options: MovieSearchOptions = {},
  queryOptions?: Omit<
    UseQueryOptions<TMDBMovieSearchResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['search', 'movies', query, options],
    queryFn: () => createTMDBClient().movies.search(query, options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: query.length > 0,
    ...queryOptions,
  });
}

export function useSearchTVShows(
  query: string,
  options: TVSearchOptions = {},
  queryOptions?: Omit<
    UseQueryOptions<TMDBTVShowSearchResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['search', 'tv', query, options],
    queryFn: () => createTMDBClient().tv.search(query, options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: query.length > 0,
    ...queryOptions,
  });
}

// Genre hook
export function useGenres(
  type: 'movie' | 'tv',
  language = 'en-US',
  queryOptions?: Omit<UseQueryOptions<TMDBGenreList>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['genres', type, language],
    queryFn: () => createTMDBClient().genres.get(type, language),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (genres don't change often)
    gcTime: 48 * 60 * 60 * 1000, // 48 hours
    ...queryOptions,
  });
}
