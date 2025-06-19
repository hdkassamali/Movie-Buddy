import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const updateListSchema = z.object({
  name: z
    .string()
    .min(1, 'List name is required')
    .max(100, 'Name too long')
    .optional(),
  description: z
    .string()
    .max(500, 'Description too long')
    .optional()
    .nullable(),
  is_public: z.boolean().optional(),
});

// GET /api/lists/[id] - Get single list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the list (only if user owns it or it's public)
    const { data: list, error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      console.error('Error fetching list:', error);
      return NextResponse.json(
        { error: 'Failed to fetch list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ list });
  } catch (error) {
    console.error('Unexpected error in GET /api/lists/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/lists/[id] - Update list
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateListSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    // Update the list (only if user owns it)
    const { data: list, error } = await supabase
      .from('lists')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'List not found or access denied' },
          { status: 404 }
        );
      }
      console.error('Error updating list:', error);
      return NextResponse.json(
        { error: 'Failed to update list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ list });
  } catch (error) {
    console.error('Unexpected error in PUT /api/lists/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[id] - Delete list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // First, delete all list items
    const { error: itemsError } = await supabase
      .from('list_items')
      .delete()
      .eq('list_id', id);

    if (itemsError) {
      console.error('Error deleting list items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to delete list items' },
        { status: 500 }
      );
    }

    // Then delete the list (only if user owns it)
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting list:', error);
      return NextResponse.json(
        { error: 'Failed to delete list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/lists/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
