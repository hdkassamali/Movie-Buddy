import { NextRequest, NextResponse } from 'next/server';
import { getGenres } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'movie' | 'tv';

    if (!type || (type !== 'movie' && type !== 'tv')) {
      return NextResponse.json(
        { error: 'Type parameter must be "movie" or "tv"' },
        { status: 400 }
      );
    }

    const language = searchParams.get('language') || 'en-US';

    const results = await getGenres(type, language);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Genres fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genres' },
      { status: 500 }
    );
  }
}
