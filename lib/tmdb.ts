import type {
  TMDBMovieSearchResponse,
  TMDBTVShowSearchResponse,
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBCredits,
  TMDBMultiSearchResponse,
  TMDBDiscoverMovieResponse,
  TMDBDiscoverTVResponse,
  TMDBGenreList,
  TMDBTrendingResponse,
  MovieSearchOptions,
  TVSearchOptions,
  DetailOptions,
} from '../types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

interface TMDBApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string | number>;
}

interface TMDBError {
  success: false;
  status_code: number;
  status_message: string;
}

class TMDBApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isRateLimit = false
  ) {
    super(message);
    this.name = 'TMDBApiError';
  }
}

// Rate limiting: Track requests to avoid hitting API limits
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 40; // TMDB allows 40 requests per 10 seconds
  private readonly timeWindow = 10000; // 10 seconds in milliseconds

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove requests older than time window
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  async waitIfNeeded(): Promise<void> {
    if (!this.canMakeRequest()) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (Date.now() - oldestRequest) + 100; // Add 100ms buffer
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.recordRequest();
  }
}

const rateLimiter = new RateLimiter();

async function tmdbFetch<T>(
  endpoint: string,
  options: TMDBApiOptions = {}
): Promise<T> {
  // Server-side only API key access
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new TMDBApiError(
      500,
      'TMDB API key is not configured. Please add TMDB_API_KEY to your environment variables.'
    );
  }

  // Apply rate limiting
  await rateLimiter.waitIfNeeded();

  const { method = 'GET', params = {} } = options;

  // Build URL with parameters
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', apiKey);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        throw new TMDBApiError(
          429,
          'Rate limit exceeded. Please try again later.',
          true
        );
      }

      // Try to parse error response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData: TMDBError = await response.json();
        errorMessage = errorData.status_message || errorMessage;
      } catch {
        // If JSON parsing fails, use the default message
      }

      throw new TMDBApiError(response.status, errorMessage);
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TMDBApiError) {
      throw error;
    }

    // Network or other errors
    throw new TMDBApiError(
      500,
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Image URL helpers
export const tmdbImageUrl = {
  poster: (
    path: string | null,
    size:
      | 'w92'
      | 'w154'
      | 'w185'
      | 'w342'
      | 'w500'
      | 'w780'
      | 'original' = 'w500'
  ) => (path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null),

  backdrop: (
    path: string | null,
    size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'
  ) => (path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null),

  profile: (
    path: string | null,
    size: 'w45' | 'w185' | 'h632' | 'original' = 'w185'
  ) => (path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null),
};

// Search functions
export async function searchMovies(
  query: string,
  options: MovieSearchOptions = {}
): Promise<TMDBMovieSearchResponse> {
  if (!query.trim()) {
    throw new TMDBApiError(400, 'Search query cannot be empty');
  }

  const { page = 1, year, language = 'en-US' } = options;
  const params: Record<string, string | number> = {
    query: query.trim(),
    page,
    language,
  };

  if (year) {
    params.primary_release_year = year;
  }

  return tmdbFetch<TMDBMovieSearchResponse>(`/search/movie`, { params });
}

export async function searchTVShows(
  query: string,
  options: TVSearchOptions = {}
): Promise<TMDBTVShowSearchResponse> {
  if (!query.trim()) {
    throw new TMDBApiError(400, 'Search query cannot be empty');
  }

  const { page = 1, firstAirDateYear, language = 'en-US' } = options;
  const params: Record<string, string | number> = {
    query: query.trim(),
    page,
    language,
  };

  if (firstAirDateYear) {
    params.first_air_date_year = firstAirDateYear;
  }

  return tmdbFetch<TMDBTVShowSearchResponse>(`/search/tv`, { params });
}

// Details functions
export async function getMovieDetails(
  movieId: number,
  options: DetailOptions = {}
): Promise<TMDBMovieDetails> {
  const { language = 'en-US', appendToResponse = [] } = options;
  const params: Record<string, string | number> = { language };

  if (appendToResponse.length > 0) {
    params.append_to_response = appendToResponse.join(',');
  }

  return tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`, { params });
}

export async function getTVShowDetails(
  tvId: number,
  options: DetailOptions = {}
): Promise<TMDBTVShowDetails> {
  const { language = 'en-US', appendToResponse = [] } = options;
  const params: Record<string, string | number> = { language };

  if (appendToResponse.length > 0) {
    params.append_to_response = appendToResponse.join(',');
  }

  return tmdbFetch<TMDBTVShowDetails>(`/tv/${tvId}`, { params });
}

// Credits functions
export async function getMovieCredits(
  movieId: number,
  options: {
    language?: string;
  } = {}
): Promise<TMDBCredits> {
  const { language = 'en-US' } = options;
  return tmdbFetch<TMDBCredits>(`/movie/${movieId}/credits`, {
    params: { language },
  });
}

export async function getTVShowCredits(
  tvId: number,
  options: {
    language?: string;
  } = {}
): Promise<TMDBCredits> {
  const { language = 'en-US' } = options;
  return tmdbFetch<TMDBCredits>(`/tv/${tvId}/credits`, {
    params: { language },
  });
}

// Advanced search with multiple filters
export async function searchMulti(
  query: string,
  options: {
    page?: number;
    language?: string;
  } = {}
): Promise<TMDBMultiSearchResponse> {
  if (!query.trim()) {
    throw new TMDBApiError(400, 'Search query cannot be empty');
  }

  const { page = 1, language = 'en-US' } = options;
  return tmdbFetch<TMDBMultiSearchResponse>(`/search/multi`, {
    params: {
      query: query.trim(),
      page,
      language,
    },
  });
}

// Discover functions for advanced filtering
export async function discoverMovies(
  options: {
    page?: number;
    language?: string;
    sortBy?: string;
    year?: number;
    genreIds?: number[];
    withCast?: number[];
    withCrew?: number[];
    minRating?: number;
    maxRating?: number;
  } = {}
): Promise<TMDBDiscoverMovieResponse> {
  const {
    page = 1,
    language = 'en-US',
    sortBy = 'popularity.desc',
    year,
    genreIds,
    withCast,
    withCrew,
    minRating,
    maxRating,
  } = options;

  const params: Record<string, string | number> = {
    page,
    language,
    sort_by: sortBy,
  };

  if (year) params.year = year;
  if (genreIds?.length) params.with_genres = genreIds.join(',');
  if (withCast?.length) params.with_cast = withCast.join(',');
  if (withCrew?.length) params.with_crew = withCrew.join(',');
  if (minRating !== undefined) params['vote_average.gte'] = minRating;
  if (maxRating !== undefined) params['vote_average.lte'] = maxRating;

  return tmdbFetch<TMDBDiscoverMovieResponse>(`/discover/movie`, { params });
}

export async function discoverTVShows(
  options: {
    page?: number;
    language?: string;
    sortBy?: string;
    firstAirDateYear?: number;
    genreIds?: number[];
    withCast?: number[];
    withCrew?: number[];
    minRating?: number;
    maxRating?: number;
  } = {}
): Promise<TMDBDiscoverTVResponse> {
  const {
    page = 1,
    language = 'en-US',
    sortBy = 'popularity.desc',
    firstAirDateYear,
    genreIds,
    withCast,
    withCrew,
    minRating,
    maxRating,
  } = options;

  const params: Record<string, string | number> = {
    page,
    language,
    sort_by: sortBy,
  };

  if (firstAirDateYear) params.first_air_date_year = firstAirDateYear;
  if (genreIds?.length) params.with_genres = genreIds.join(',');
  if (withCast?.length) params.with_cast = withCast.join(',');
  if (withCrew?.length) params.with_crew = withCrew.join(',');
  if (minRating !== undefined) params['vote_average.gte'] = minRating;
  if (maxRating !== undefined) params['vote_average.lte'] = maxRating;

  return tmdbFetch<TMDBDiscoverTVResponse>(`/discover/tv`, { params });
}

// Utility functions
export async function getGenres(
  type: 'movie' | 'tv',
  language = 'en-US'
): Promise<TMDBGenreList> {
  return tmdbFetch<TMDBGenreList>(`/genre/${type}/list`, {
    params: { language },
  });
}

export async function getTrending(
  mediaType: 'movie' | 'tv' | 'person' | 'all',
  timeWindow: 'day' | 'week' = 'week',
  options: {
    page?: number;
    language?: string;
  } = {}
): Promise<TMDBTrendingResponse> {
  const { page = 1, language = 'en-US' } = options;
  return tmdbFetch<TMDBTrendingResponse>(
    `/trending/${mediaType}/${timeWindow}`,
    {
      params: { page, language },
    }
  );
}

// Export the error class and types for use in components
export { TMDBApiError };
export type { TMDBApiOptions, TMDBError };

// Export the main API function for custom endpoints
export { tmdbFetch };
