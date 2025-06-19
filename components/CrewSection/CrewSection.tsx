import Image from 'next/image';
import { tmdbImageUrl } from '@/lib/tmdb';
import type { TMDBCrewMember } from '@/types/tmdb';

interface CrewSectionProps {
  crew: TMDBCrewMember[];
  maxItems?: number;
  keyRoles?: string[];
}

export default function CrewSection({
  crew,
  maxItems = 9,
  keyRoles = [
    'Director',
    'Producer',
    'Executive Producer',
    'Screenplay',
    'Writer',
  ],
}: CrewSectionProps) {
  const filteredCrew = crew
    .filter((person) => keyRoles.includes(person.job))
    .slice(0, maxItems);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Crew</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrew.map((person, index) => (
          <div
            key={`${person.id}-${index}`}
            className="flex items-center space-x-3"
          >
            {person.profile_path ? (
              <Image
                src={tmdbImageUrl.profile(person.profile_path, 'w185') || ''}
                alt={person.name}
                width={40}
                height={60}
                className="w-10 h-10 object-cover rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs">?</span>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 text-sm">
                {person.name}
              </h3>
              <p className="text-gray-500 text-xs">{person.job}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
