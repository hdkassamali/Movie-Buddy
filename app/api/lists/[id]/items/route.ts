import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Validation schema for adding an item to a list
const addItemSchema = z.object({
  tmdb_id: z.number().int().positive('TMDB ID must be a positive integer'),
  media_type: z.enum(['movie', 'tv'], {
    required_error: 'Media type must be either "movie" or "tv"',
  }),
  notes: z.string().max(500, 'Notes too long').optional().nullable(),
});

// Validation schema for reordering items
const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid('Invalid item ID'),
      sort_order: z
        .number()
        .int()
        .nonnegative('Sort order must be a non-negative integer'),
    })
  ),
});

// GET /api/lists/[id]/items - Get all items in a list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { id } = await params;

    // First check if the list exists and if the user has access to it
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();

    if (listError) {
      if (listError.code === 'PGRST116') {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to fetch list' },
        { status: 500 }
      );
    }

    // Check if the user has access to this list
    if (!list.is_public && (!user || list.user_id !== user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch list items
    const { data: items, error: itemsError } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', id)
      .order('sort_order', { ascending: true });

    if (itemsError) {
      console.error('Error fetching list items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch list items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Unexpected error in GET /api/lists/[id]/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/lists/[id]/items - Add an item to a list
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if the list exists and belongs to the user
    const { error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (listError) {
      if (listError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'List not found or access denied' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch list' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = addItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Check if item already exists in the list
    const { data: existingItem } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', id)
      .eq('tmdb_id', validationResult.data.tmdb_id)
      .eq('media_type', validationResult.data.media_type)
      .single();

    if (existingItem) {
      return NextResponse.json(
        { error: 'Item already exists in this list' },
        { status: 409 }
      );
    }

    // Get the highest sort_order in the list
    const { data: maxOrderItem } = await supabase
      .from('list_items')
      .select('sort_order')
      .eq('list_id', id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxOrderItem ? maxOrderItem.sort_order + 1 : 0;

    // Add the item to the list
    const { data: item, error: insertError } = await supabase
      .from('list_items')
      .insert({
        list_id: id,
        tmdb_id: validationResult.data.tmdb_id,
        media_type: validationResult.data.media_type,
        notes: validationResult.data.notes,
        sort_order: nextSortOrder,
        added_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding item to list:', insertError);
      return NextResponse.json(
        { error: 'Failed to add item to list' },
        { status: 500 }
      );
    }

    // Update the list's updated_at timestamp
    await supabase
      .from('lists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/lists/[id]/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/lists/[id]/items - Reorder items in a list
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if the list exists and belongs to the user
    const { error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (listError) {
      if (listError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'List not found or access denied' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch list' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = reorderItemsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { items } = validationResult.data;

    // Update each item's sort_order
    for (const item of items) {
      const { error: updateError } = await supabase
        .from('list_items')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
        .eq('list_id', id);

      if (updateError) {
        console.error('Error updating item sort order:', updateError);
        return NextResponse.json(
          { error: 'Failed to update item sort order' },
          { status: 500 }
        );
      }
    }

    // Update the list's updated_at timestamp
    await supabase
      .from('lists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    // Return the updated items
    const { data: updatedItems, error: fetchError } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', id)
      .order('sort_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching updated items:', fetchError);
      return NextResponse.json(
        { error: 'Items reordered but failed to fetch updated list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: updatedItems });
  } catch (error) {
    console.error('Unexpected error in PUT /api/lists/[id]/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
