import Image from 'next/image';
import type { TMDBGenre } from '@/types/tmdb';

interface MetadataItem {
  label: string;
  value: string | number;
  format?: 'currency' | 'date' | 'number';
}

interface MetadataCardProps {
  posterUrl?: string;
  title: string;
  rating: number;
  voteCount: number;
  genres: TMDBGenre[];
  releaseDate?: string;
  status?: string;
  metadata?: MetadataItem[];
}

export default function MetadataCard({
  posterUrl,
  title,
  rating,
  voteCount,
  genres,
  releaseDate,
  status,
  metadata = [],
}: MetadataCardProps) {
  const formatValue = (value: string | number, format?: string) => {
    if (format === 'currency') {
      return `$${Number(value).toLocaleString()}`;
    }
    if (format === 'date') {
      return new Date(value.toString()).toLocaleDateString();
    }
    if (format === 'number') {
      return Number(value).toLocaleString();
    }
    return value;
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {posterUrl && (
          <Image
            src={posterUrl}
            alt={title}
            width={342}
            height={513}
            className="w-full rounded-lg shadow-md mb-6"
          />
        )}

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Rating</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-yellow-500">
                ⭐ {rating.toFixed(1)}
              </span>
              <span className="text-gray-500 ml-2">
                ({voteCount.toLocaleString()} votes)
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          {releaseDate && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Release Date</h3>
              <p className="text-gray-700">
                {new Date(releaseDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {status && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
              <p className="text-gray-700">{status}</p>
            </div>
          )}

          {metadata.map((item, index) => (
            <div key={index}>
              <h3 className="font-semibold text-gray-900 mb-2">{item.label}</h3>
              <p className="text-gray-700">
                {formatValue(item.value, item.format)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
