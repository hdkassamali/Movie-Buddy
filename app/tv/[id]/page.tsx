import { notFound } from 'next/navigation';
import { getTVShowDetails, getTVShowCredits, tmdbImageUrl } from '@/lib/tmdb';
import { Metadata } from 'next';
import HeroSection from '@/components/HeroSection/HeroSection';
import MetadataCard from '@/components/MetadataCard/MetadataCard';
import OverviewSection from '@/components/OverviewSection/OverviewSection';
import CastGrid from '@/components/CastGrid/CastGrid';
import CrewSection from '@/components/CrewSection/CrewSection';
import ProductionCompanies from '@/components/ProductionCompanies/ProductionCompanies';
import SeasonsSection from '@/components/SeasonsSection/SeasonsSection';
import { AddToListSection } from '@/components/AddToListSection/AddToListSection';

interface TVShowPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: TVShowPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const tvId = parseInt(resolvedParams.id);
    if (isNaN(tvId)) {
      return { title: 'TV Show Not Found' };
    }

    const show = await getTVShowDetails(tvId);

    return {
      title: `${show.name} (${new Date(show.first_air_date).getFullYear()})`,
      description: show.overview || `Details for ${show.name}`,
      openGraph: {
        title: show.name,
        description: show.overview || '',
        images: show.poster_path
          ? [tmdbImageUrl.poster(show.poster_path, 'w500') || '']
          : [],
      },
    };
  } catch {
    return { title: 'TV Show Not Found' };
  }
}

export default async function TVShowPage({ params }: TVShowPageProps) {
  const resolvedParams = await params;
  const tvId = parseInt(resolvedParams.id);

  if (isNaN(tvId)) {
    notFound();
  }

  try {
    const [show, credits] = await Promise.all([
      getTVShowDetails(tvId, { appendToResponse: ['videos', 'images'] }),
      getTVShowCredits(tvId),
    ]);

    const posterUrl = tmdbImageUrl.poster(show.poster_path, 'w500');
    const backdropUrl = tmdbImageUrl.backdrop(show.backdrop_path, 'w1280');

    // Prepare metadata for the MetadataCard
    const metadata: Array<{
      label: string;
      value: string | number;
      format?: 'currency' | 'date' | 'number';
    }> = [
      { label: 'Type', value: show.type || 'TV Show' },
      { label: 'Seasons', value: show.number_of_seasons },
      { label: 'Episodes', value: show.number_of_episodes },
    ];

    if (show.last_air_date) {
      metadata.push({
        label: 'Last Aired',
        value: show.last_air_date,
        format: 'date' as const,
      });
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection
          backdropPath={backdropUrl}
          title={show.name}
          subtitle={`${new Date(show.first_air_date).getFullYear()} • ${show.number_of_seasons} Season${show.number_of_seasons !== 1 ? 's' : ''}`}
          alt={show.name}
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AddToListSection tmdbId={tvId} mediaType="tv" />
              <MetadataCard
                posterUrl={posterUrl || undefined}
                title={show.name}
                rating={show.vote_average}
                voteCount={show.vote_count}
                genres={show.genres}
                releaseDate={show.first_air_date}
                status={show.status}
                metadata={metadata}
              />
            </div>

            <div className="lg:col-span-2 space-y-8">
              <OverviewSection overview={show.overview} />
              <SeasonsSection seasons={show.seasons} />
              <CastGrid cast={credits.cast} />
              <CrewSection
                crew={credits.crew}
                keyRoles={[
                  'Creator',
                  'Executive Producer',
                  'Producer',
                  'Director',
                  'Writer',
                ]}
              />
              <ProductionCompanies companies={show.production_companies} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
