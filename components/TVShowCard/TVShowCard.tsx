import Image from 'next/image';
import Link from 'next/link';
import type { TMDBTVShowSearchResult } from '@/types/tmdb';
import { tmdbImageUrl } from '@/lib/tmdb';

interface TVShowCardProps {
  tvShow: TMDBTVShowSearchResult;
}

export default function TVShowCard({ tvShow }: TVShowCardProps) {
  const posterUrl = tvShow.poster_path
    ? tmdbImageUrl.poster(tvShow.poster_path, 'w342')
    : null;

  const firstAirYear = tvShow.first_air_date
    ? new Date(tvShow.first_air_date).getFullYear()
    : null;

  const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : 'N/A';

  return (
    <Link
      href={`/tv/${tvShow.id}`}
      className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Poster Image */}
      <div className="aspect-[2/3] relative bg-gray-100">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${tvShow.name} poster`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Rating badge */}
        {tvShow.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            ⭐ {rating}
          </div>
        )}

        {/* TV Show indicator */}
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
          TV
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors">
          {tvShow.name}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{firstAirYear || 'TBA'}</span>
          {tvShow.vote_count > 0 && (
            <span className="text-xs">
              {tvShow.vote_count.toLocaleString()} votes
            </span>
          )}
        </div>

        {/* Origin country */}
        {tvShow.origin_country && tvShow.origin_country.length > 0 && (
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500">
              {tvShow.origin_country.join(', ')}
            </span>
          </div>
        )}

        {/* Overview preview */}
        {tvShow.overview && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {tvShow.overview}
          </p>
        )}
      </div>
    </Link>
  );
}
