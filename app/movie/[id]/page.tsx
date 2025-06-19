import { notFound } from 'next/navigation';
import { getMovieDetails, getMovieCredits, tmdbImageUrl } from '@/lib/tmdb';
import { Metadata } from 'next';
import HeroSection from '@/components/HeroSection/HeroSection';
import MetadataCard from '@/components/MetadataCard/MetadataCard';
import OverviewSection from '@/components/OverviewSection/OverviewSection';
import CastGrid from '@/components/CastGrid/CastGrid';
import CrewSection from '@/components/CrewSection/CrewSection';
import ProductionCompanies from '@/components/ProductionCompanies/ProductionCompanies';
import { AddToListSection } from '@/components/AddToListSection/AddToListSection';

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const movieId = parseInt(resolvedParams.id);
    if (isNaN(movieId)) {
      return { title: 'Movie Not Found' };
    }

    const movie = await getMovieDetails(movieId);

    return {
      title: `${movie.title} (${new Date(movie.release_date).getFullYear()})`,
      description: movie.overview || `Details for ${movie.title}`,
      openGraph: {
        title: movie.title,
        description: movie.overview || '',
        images: movie.poster_path
          ? [tmdbImageUrl.poster(movie.poster_path, 'w500') || '']
          : [],
      },
    };
  } catch {
    return { title: 'Movie Not Found' };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const resolvedParams = await params;
  const movieId = parseInt(resolvedParams.id);

  if (isNaN(movieId)) {
    notFound();
  }

  try {
    const [movie, credits] = await Promise.all([
      getMovieDetails(movieId, { appendToResponse: ['videos', 'images'] }),
      getMovieCredits(movieId),
    ]);

    const posterUrl = tmdbImageUrl.poster(movie.poster_path, 'w500');
    const backdropUrl = tmdbImageUrl.backdrop(movie.backdrop_path, 'w1280');

    // Prepare metadata for the MetadataCard
    const metadata = [];
    if (movie.budget > 0) {
      metadata.push({
        label: 'Budget',
        value: movie.budget,
        format: 'currency' as const,
      });
    }
    if (movie.revenue > 0) {
      metadata.push({
        label: 'Revenue',
        value: movie.revenue,
        format: 'currency' as const,
      });
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection
          backdropPath={backdropUrl}
          title={movie.title}
          subtitle={`${new Date(movie.release_date).getFullYear()} • ${movie.runtime} min`}
          alt={movie.title}
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AddToListSection tmdbId={movieId} mediaType="movie" />
              <MetadataCard
                posterUrl={posterUrl || undefined}
                title={movie.title}
                rating={movie.vote_average}
                voteCount={movie.vote_count}
                genres={movie.genres}
                releaseDate={movie.release_date}
                status={movie.status}
                metadata={metadata}
              />
            </div>

            <div className="lg:col-span-2 space-y-8">
              <OverviewSection overview={movie.overview} />
              <CastGrid cast={credits.cast} />
              <CrewSection crew={credits.crew} />
              <ProductionCompanies companies={movie.production_companies} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
