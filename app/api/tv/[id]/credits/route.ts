import { NextRequest, NextResponse } from 'next/server';
import { getTVShowCredits } from '@/lib/tmdb';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const tvId = parseInt(id);

    if (isNaN(tvId)) {
      return NextResponse.json(
        { error: 'Invalid TV show ID' },
        { status: 400 }
      );
    }

    const credits = await getTVShowCredits(tvId);
    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error fetching TV show credits:', error);

    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch TV show credits' },
      { status: 500 }
    );
  }
}
