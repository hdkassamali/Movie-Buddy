'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { useSearchMovies, useSearchTVShows, useGenres } from '@/hooks/useTMDB';
import SearchResults from '@/components/SearchResults/SearchResults';
import SearchFilters from '@/components/SearchFilters/SearchFilters';

export type MediaType = 'all' | 'movie' | 'tv';

export interface SearchFilters {
  mediaType: MediaType;
  releaseYear?: number;
  genreIds?: number[];
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract initial state from URL parameters
  const initialQuery = searchParams.get('q') || '';
  const initialMediaType = (searchParams.get('type') as MediaType) || 'all';
  const initialYear = searchParams.get('year')
    ? parseInt(searchParams.get('year')!)
    : undefined;
  const initialGenres = searchParams.get('genres')
    ? searchParams.get('genres')!.split(',').map(Number)
    : [];

  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    mediaType: initialMediaType,
    releaseYear: initialYear,
    genreIds: initialGenres.length > 0 ? initialGenres : undefined,
  });

  // Debounce the search query to prevent excessive API calls
  const [debouncedQuery] = useDebounce(query, 500);

  // Search hooks
  const movieSearch = useSearchMovies(
    debouncedQuery,
    {
      year: filters.releaseYear,
      page: 1,
    },
    {
      enabled:
        debouncedQuery.length > 0 &&
        (filters.mediaType === 'all' || filters.mediaType === 'movie'),
    }
  );

  const tvSearch = useSearchTVShows(
    debouncedQuery,
    {
      firstAirDateYear: filters.releaseYear,
      page: 1,
    },
    {
      enabled:
        debouncedQuery.length > 0 &&
        (filters.mediaType === 'all' || filters.mediaType === 'tv'),
    }
  );

  // Genre data for filters
  const movieGenres = useGenres('movie');
  const tvGenres = useGenres('tv');

  // Update URL when search parameters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedQuery) {
      params.set('q', debouncedQuery);
    }

    if (filters.mediaType !== 'all') {
      params.set('type', filters.mediaType);
    }

    if (filters.releaseYear) {
      params.set('year', filters.releaseYear.toString());
    }

    if (filters.genreIds && filters.genreIds.length > 0) {
      params.set('genres', filters.genreIds.join(','));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/search?${queryString}` : '/search';

    // Only update URL if it has changed to avoid unnecessary history entries
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [debouncedQuery, filters, router]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  // Clear search and filters
  const handleClearSearch = () => {
    setQuery('');
    setFilters({
      mediaType: 'all',
      releaseYear: undefined,
      genreIds: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Movies & TV Shows
          </h1>
          <p className="text-gray-600">
            Discover your next favorite movie or TV show
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search for movies, TV shows..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Filters */}
        <SearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          movieGenres={movieGenres.data?.genres || []}
          tvGenres={tvGenres.data?.genres || []}
        />

        {/* Search Results */}
        <SearchResults
          query={debouncedQuery}
          filters={filters}
          movieResults={movieSearch.data}
          tvResults={tvSearch.data}
          isLoadingMovies={movieSearch.isLoading}
          isLoadingTV={tvSearch.isLoading}
          movieError={movieSearch.error}
          tvError={tvSearch.error}
        />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading search...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
