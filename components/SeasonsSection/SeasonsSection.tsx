import Image from 'next/image';
import { tmdbImageUrl } from '@/lib/tmdb';

interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

interface SeasonsSectionProps {
  seasons: Season[];
}

export default function SeasonsSection({ seasons }: SeasonsSectionProps) {
  if (!seasons || seasons.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Seasons</h2>
      <div className="space-y-4">
        {seasons.map((season) => (
          <div
            key={season.id}
            className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
          >
            {season.poster_path ? (
              <Image
                src={tmdbImageUrl.poster(season.poster_path, 'w154') || ''}
                alt={season.name}
                width={60}
                height={90}
                className="w-15 h-22 object-cover rounded"
              />
            ) : (
              <div className="w-15 h-22 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {season.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {season.episode_count} episodes
                {season.air_date &&
                  ` • Aired ${new Date(season.air_date).getFullYear()}`}
              </p>
              {season.overview && (
                <p className="text-gray-500 text-sm line-clamp-2">
                  {season.overview}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
