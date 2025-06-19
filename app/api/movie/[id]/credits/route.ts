import { NextRequest, NextResponse } from 'next/server';
import { getMovieCredits } from '@/lib/tmdb';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const movieId = parseInt(id);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    const credits = await getMovieCredits(movieId);
    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error fetching movie credits:', error);

    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch movie credits' },
      { status: 500 }
    );
  }
}
