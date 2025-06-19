import { getTVShowDetails } from '@/lib/tmdb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid TV show ID' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language') || 'en-US';
    const appendToResponse =
      searchParams.get('append_to_response') || undefined;

    const tvDetails = await getTVShowDetails(id, {
      language,
      appendToResponse: appendToResponse?.split(','),
    });

    return NextResponse.json(tvDetails);
  } catch (error) {
    console.error('TV show details error:', error);

    // Check if error has statusCode property
    let statusCode = 500;
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const errorObj = error as { statusCode: unknown };
      if (typeof errorObj.statusCode === 'number') {
        statusCode = errorObj.statusCode;
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch TV show details';

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
