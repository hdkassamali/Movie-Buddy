import Image from 'next/image';
import Link from 'next/link';
import type { TMDBMovieSearchResult } from '@/types/tmdb';
import { tmdbImageUrl } from '@/lib/tmdb';

interface MovieCardProps {
  movie: TMDBMovieSearchResult;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? tmdbImageUrl.poster(movie.poster_path, 'w342')
    : null;

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Poster Image */}
      <div className="aspect-[2/3] relative bg-gray-100">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${movie.title} poster`}
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
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v12a1 1 0 01-1 1h-2m-8 0H5a1 1 0 01-1-1V4a1 1 0 011-1h2m0 0V2"
              />
            </svg>
          </div>
        )}

        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            ⭐ {rating}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {movie.title}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{releaseYear || 'TBA'}</span>
          {movie.vote_count > 0 && (
            <span className="text-xs">
              {movie.vote_count.toLocaleString()} votes
            </span>
          )}
        </div>

        {/* Overview preview */}
        {movie.overview && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {movie.overview}
          </p>
        )}
      </div>
    </Link>
  );
}
