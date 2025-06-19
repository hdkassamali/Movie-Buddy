import { NextRequest, NextResponse } from 'next/server';
import { searchMovies } from '@/lib/tmdb';
import type { MovieSearchOptions } from '@/types/tmdb';

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

    const options: MovieSearchOptions = {};

    // Extract optional parameters
    const page = searchParams.get('page');
    if (page) options.page = parseInt(page);

    const year = searchParams.get('year');
    if (year) options.year = parseInt(year);

    const language = searchParams.get('language');
    if (language) options.language = language;

    const results = await searchMovies(query, options);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Movie search error:', error);
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    );
  }
}
