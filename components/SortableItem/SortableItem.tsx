import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListItem } from '@/types/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useMovieDetails, useTVShowDetails } from '@/hooks/useTMDB';

interface SortableItemProps {
  id: string;
  item: ListItem;
  isOwner: boolean;
  onRemove: () => void;
}

export function SortableItem({
  id,
  item,
  isOwner,
  onRemove,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Use proper React Query hooks for caching
  const movieQuery = useMovieDetails(item.tmdb_id, {
    enabled: item.media_type === 'movie',
  });

  const tvQuery = useTVShowDetails(item.tmdb_id, {
    enabled: item.media_type === 'tv',
  });

  const isLoading =
    item.media_type === 'movie' ? movieQuery.isLoading : tvQuery.isLoading;
  const error = item.media_type === 'movie' ? movieQuery.error : tvQuery.error;

  // Get the appropriate data based on media type
  const media =
    item.media_type === 'movie'
      ? movieQuery.data
        ? {
            id: movieQuery.data.id,
            title: movieQuery.data.title,
            poster_path: movieQuery.data.poster_path,
            release_date: movieQuery.data.release_date,
          }
        : null
      : tvQuery.data
        ? {
            id: tvQuery.data.id,
            title: tvQuery.data.name,
            poster_path: tvQuery.data.poster_path,
            first_air_date: tvQuery.data.first_air_date,
          }
        : null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const getYear = () => {
    if (!media) return '';
    const date =
      'release_date' in media ? media.release_date : media.first_air_date;
    return date ? new Date(date).getFullYear() : '';
  };

  const getImageUrl = () => {
    if (!media?.poster_path) return '/no-image.png';
    return `https://image.tmdb.org/t/p/w92${media.poster_path}`;
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center space-x-4 animate-pulse">
        <div className="w-16 h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="p-4 flex items-center space-x-4">
        <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            No image
          </span>
        </div>
        <div className="flex-1">
          <p className="text-gray-900 dark:text-white">
            {error ? 'Error loading' : 'Item not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 flex items-center space-x-4 ${
        isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      {isOwner && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2"
        >
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      )}

      <Link
        href={`/${item.media_type}/${media.id}`}
        className="flex items-center flex-1 space-x-4"
      >
        <div className="w-16 h-24 relative flex-shrink-0 overflow-hidden rounded">
          <Image
            src={getImageUrl()}
            alt={media.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {media.title}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getYear()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              • {item.media_type}
            </span>
          </div>
          {item.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
              &quot;{item.notes}&quot;
            </p>
          )}
        </div>
      </Link>

      {isOwner && (
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 focus:outline-none"
          aria-label="Remove from list"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
