import { NextRequest, NextResponse } from 'next/server';
import { searchTVShows } from '@/lib/tmdb';
import type { TVSearchOptions } from '@/types/tmdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const options: TVSearchOptions = {};

    // Extract optional parameters
    const page = searchParams.get('page');
    if (page) options.page = parseInt(page);

    const firstAirDateYear = searchParams.get('firstAirDateYear');
    if (firstAirDateYear) options.firstAirDateYear = parseInt(firstAirDateYear);

    const language = searchParams.get('language');
    if (language) options.language = language;

    const results = await searchTVShows(query, options);

    return NextResponse.json(results);
  } catch (error) {
    console.error('TV search error:', error);
    return NextResponse.json(
      { error: 'Failed to search TV shows' },
      { status: 500 }
    );
  }
}
