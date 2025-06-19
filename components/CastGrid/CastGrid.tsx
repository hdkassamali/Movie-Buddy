import Image from 'next/image';
import { tmdbImageUrl } from '@/lib/tmdb';
import type { TMDBCastMember } from '@/types/tmdb';

interface CastGridProps {
  cast: TMDBCastMember[];
  maxItems?: number;
}

export default function CastGrid({ cast, maxItems = 12 }: CastGridProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cast.slice(0, maxItems).map((actor) => (
          <div key={actor.id} className="text-center">
            {actor.profile_path ? (
              <Image
                src={tmdbImageUrl.profile(actor.profile_path, 'w185') || ''}
                alt={actor.name}
                width={185}
                height={278}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
            <h3 className="font-medium text-gray-900 text-sm mb-1">
              {actor.name}
            </h3>
            <p className="text-gray-500 text-xs">{actor.character}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
