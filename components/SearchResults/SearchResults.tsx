import type {
  TMDBMovieSearchResponse,
  TMDBTVShowSearchResponse,
  TMDBMovieSearchResult,
  TMDBTVShowSearchResult,
} from '@/types/tmdb';
import type { SearchFilters } from '@/app/search/page';
import MovieCard from '@/components/MovieCard/MovieCard';
import TVShowCard from '@/components/TVShowCard/TVShowCard';
import LoadingSkeleton from '@/components/LoadingSkeleton/LoadingSkeleton';

interface SearchResultsProps {
  query: string;
  filters: SearchFilters;
  movieResults?: TMDBMovieSearchResponse;
  tvResults?: TMDBTVShowSearchResponse;
  isLoadingMovies: boolean;
  isLoadingTV: boolean;
  movieError: Error | null;
  tvError: Error | null;
}

export default function SearchResults({
  query,
  filters,
  movieResults,
  tvResults,
  isLoadingMovies,
  isLoadingTV,
  movieError,
  tvError,
}: SearchResultsProps) {
  // Don't show anything if there's no query
  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Start searching
        </h3>
        <p className="text-gray-600">
          Enter a movie or TV show title to find your next favorite watch.
        </p>
      </div>
    );
  }

  const isLoading = isLoadingMovies || isLoadingTV;
  const hasError = movieError || tvError;

  // Filter results based on genre selection
  const filterByGenre = (
    results: (TMDBMovieSearchResult | TMDBTVShowSearchResult)[]
  ) => {
    if (!filters.genreIds || filters.genreIds.length === 0) {
      return results;
    }
    return results.filter((item) =>
      filters.genreIds!.some((genreId) => item.genre_ids.includes(genreId))
    );
  };

  // Get filtered results
  const filteredMovieResults = movieResults
    ? filterByGenre(movieResults.results)
    : [];
  const filteredTVResults = tvResults ? filterByGenre(tvResults.results) : [];

  // Combine and sort results if showing all
  const allResults = [...filteredMovieResults, ...filteredTVResults].sort(
    (a, b) => b.popularity - a.popularity
  );

  const getResultsToShow = () => {
    switch (filters.mediaType) {
      case 'movie':
        return {
          movies: filteredMovieResults,
          tv: [],
          combined: filteredMovieResults,
        };
      case 'tv':
        return {
          movies: [],
          tv: filteredTVResults,
          combined: filteredTVResults,
        };
      default:
        return {
          movies: filteredMovieResults,
          tv: filteredTVResults,
          combined: allResults,
        };
    }
  };

  const results = getResultsToShow();
  const hasResults = results.combined.length > 0;
  const totalResults =
    (movieResults?.total_results || 0) + (tvResults?.total_results || 0);

  // Show error state
  if (hasError && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-red-300 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-4">
          {movieError?.message ||
            tvError?.message ||
            'Failed to search. Please try again.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show no results state
  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.5-2.709"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No results found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search terms or filters to find what you&apos;re
          looking for.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results summary */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">
          Found {results.combined.length.toLocaleString()} result
          {results.combined.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          {totalResults > results.combined.length && (
            <span className="text-sm text-gray-500 ml-1">
              ({totalResults.toLocaleString()} total before filtering)
            </span>
          )}
        </p>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {results.combined.map(
          (item: TMDBMovieSearchResult | TMDBTVShowSearchResult) => {
            // Determine if it's a movie or TV show based on properties
            const isMovie = 'title' in item && 'release_date' in item;

            return isMovie ? (
              <MovieCard key={`movie-${item.id}`} movie={item} />
            ) : (
              <TVShowCard key={`tv-${item.id}`} tvShow={item} />
            );
          }
        )}
      </div>

      {/* Load more indicator - placeholder for future pagination */}
      {(movieResults?.total_pages || 0) > 1 ||
      (tvResults?.total_pages || 0) > 1 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Showing page 1 of results. Pagination coming soon!
          </p>
        </div>
      ) : null}
    </div>
  );
}
