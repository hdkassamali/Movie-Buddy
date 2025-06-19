import { useState } from 'react';
import type { TMDBGenre } from '@/types/tmdb';
import type {
  MediaType,
  SearchFilters as SearchFiltersType,
} from '@/app/search/page';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  movieGenres: TMDBGenre[];
  tvGenres: TMDBGenre[];
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  movieGenres,
  tvGenres,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get available genres based on media type
  const availableGenres = () => {
    if (filters.mediaType === 'movie') return movieGenres;
    if (filters.mediaType === 'tv') return tvGenres;
    // For 'all', combine both lists and remove duplicates
    const combined = [...movieGenres, ...tvGenres];
    const unique = combined.filter(
      (genre, index, self) => self.findIndex((g) => g.id === genre.id) === index
    );
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleMediaTypeChange = (mediaType: MediaType) => {
    onFiltersChange({
      ...filters,
      mediaType,
      // Reset genre selection when media type changes
      genreIds: undefined,
    });
  };

  const handleYearChange = (year: string) => {
    const numYear = year ? parseInt(year) : undefined;
    onFiltersChange({
      ...filters,
      releaseYear: numYear,
    });
  };

  const handleGenreToggle = (genreId: number) => {
    const currentGenres = filters.genreIds || [];
    const newGenres = currentGenres.includes(genreId)
      ? currentGenres.filter((id) => id !== genreId)
      : [...currentGenres, genreId];

    onFiltersChange({
      ...filters,
      genreIds: newGenres.length > 0 ? newGenres : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      mediaType: 'all',
      releaseYear: undefined,
      genreIds: undefined,
    });
  };

  const hasActiveFilters =
    filters.mediaType !== 'all' ||
    filters.releaseYear ||
    (filters.genreIds && filters.genreIds.length > 0);

  // Generate year options (current year back to 1900)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1899 },
    (_, i) => currentYear - i
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 hover:cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 hover:cursor-pointer"
            >
              <span>{isExpanded ? 'Hide' : 'Show'} filters</span>
              <svg
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick filters - always visible */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['all', 'movie', 'tv'] as MediaType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleMediaTypeChange(type)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors hover:cursor-pointer ${
                  filters.mediaType === type
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {type === 'all'
                  ? 'All'
                  : type === 'movie'
                    ? 'Movies'
                    : 'TV Shows'}
              </button>
            ))}
          </div>

          {/* Active filter badges */}
          {filters.releaseYear && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filters.releaseYear}
              <button
                onClick={() => handleYearChange('')}
                className="ml-1 hover:text-blue-600 hover:cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {filters.genreIds && filters.genreIds.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {filters.genreIds.length} genre
              {filters.genreIds.length !== 1 ? 's' : ''}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, genreIds: undefined })
                }
                className="ml-1 hover:text-green-600 hover:cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <div className="mt-6 space-y-6">
            {/* Release Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Release Year
              </label>
              <select
                value={filters.releaseYear || ''}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:cursor-pointer"
              >
                <option value="">Any year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGenres().map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors hover:cursor-pointer ${
                      filters.genreIds?.includes(genre.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
