'use client';

import { AddToListButton } from '@/components/AddToListButton/AddToListButton';

interface AddToListSectionProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}

export function AddToListSection({ tmdbId, mediaType }: AddToListSectionProps) {
  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <AddToListButton tmdbId={tmdbId} mediaType={mediaType} />
      </div>
    </div>
  );
}
