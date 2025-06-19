import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// DELETE /api/lists/[id]/items/[itemId] - Remove an item from a list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
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

    const { id, itemId } = await params;

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

    // Delete the item
    const { error: deleteError } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)
      .eq('list_id', id);

    if (deleteError) {
      console.error('Error deleting item from list:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete item from list' },
        { status: 500 }
      );
    }

    // Update the list's updated_at timestamp
    await supabase
      .from('lists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/lists/[id]/items/[itemId]:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
