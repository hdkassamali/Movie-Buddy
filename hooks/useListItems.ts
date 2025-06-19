import { useState, useEffect, useCallback } from 'react';
import { ListItem } from '@/types/supabase';
import {
  getListItems,
  addListItem,
  removeListItem,
  reorderListItems,
  AddListItemRequest,
  ReorderListItemsRequest,
} from '@/lib/api/listItems';
import { arrayMove } from '@dnd-kit/sortable';

interface UseListItemsState {
  items: ListItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface UseListItemsActions {
  refetch: () => Promise<void>;
  addItem: (data: AddListItemRequest) => Promise<ListItem>;
  removeItem: (itemId: string) => Promise<void>;
  reorderItems: (activeId: string, overId: string) => Promise<void>;
}

interface UseListItemsReturn extends UseListItemsState, UseListItemsActions {}

export function useListItems(listId: string): UseListItemsReturn {
  const [state, setState] = useState<UseListItemsState>({
    items: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
  });

  // Fetch list items from the server
  const fetchItems = useCallback(
    async (isRefresh = false) => {
      if (!listId) return;

      try {
        setState((prev) => ({
          ...prev,
          isLoading: !isRefresh,
          isRefreshing: isRefresh,
          error: null,
        }));

        const items = await getListItems(listId);

        setState((prev) => ({
          ...prev,
          items,
          isLoading: false,
          isRefreshing: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch list items',
        }));
      }
    },
    [listId]
  );

  // Initialize items on mount and when listId changes
  useEffect(() => {
    if (listId) {
      fetchItems();
    }
  }, [listId, fetchItems]);

  // Refetch items (for manual refresh)
  const refetch = useCallback(() => fetchItems(true), [fetchItems]);

  // Add item with optimistic update
  const addItem = useCallback(
    async (data: AddListItemRequest): Promise<ListItem> => {
      try {
        setState((prev) => ({ ...prev, error: null }));

        // Optimistic update: create temporary item
        const tempId = `temp-${Date.now()}`;
        const optimisticItem: ListItem = {
          id: tempId,
          list_id: listId,
          tmdb_id: data.tmdb_id,
          media_type: data.media_type,
          notes: data.notes || null,
          sort_order: state.items.length,
          added_at: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          items: [...prev.items, optimisticItem],
        }));

        // Make actual API call
        const newItem = await addListItem(listId, data);

        // Replace optimistic item with real one
        setState((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === tempId ? newItem : item
          ),
        }));

        return newItem;
      } catch (error) {
        // Remove optimistic item on error
        setState((prev) => ({
          ...prev,
          items: prev.items.filter((item) => !item.id.startsWith('temp-')),
          error: error instanceof Error ? error.message : 'Failed to add item',
        }));
        throw error;
      }
    },
    [listId, state.items]
  );

  // Remove item with optimistic update
  const removeItem = useCallback(
    async (itemId: string): Promise<void> => {
      // Store original item for rollback
      const originalItem = state.items.find((item) => item.id === itemId);
      if (!originalItem) {
        throw new Error('Item not found');
      }

      try {
        setState((prev) => ({ ...prev, error: null }));

        // Optimistic update: remove from UI
        setState((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
        }));

        // Make actual API call
        await removeListItem(listId, itemId);
      } catch (error) {
        // Rollback on error
        setState((prev) => ({
          ...prev,
          items: [...prev.items, originalItem].sort(
            (a, b) => a.sort_order - b.sort_order
          ),
          error:
            error instanceof Error ? error.message : 'Failed to remove item',
        }));
        throw error;
      }
    },
    [listId, state.items]
  );

  // Reorder items with optimistic update
  const reorderItems = useCallback(
    async (activeId: string, overId: string): Promise<void> => {
      // Find the items and their indices
      const oldIndex = state.items.findIndex((item) => item.id === activeId);
      const newIndex = state.items.findIndex((item) => item.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        throw new Error('Items not found');
      }

      // Store original items for rollback
      const originalItems = [...state.items];

      try {
        setState((prev) => ({ ...prev, error: null }));

        // Optimistic update: reorder in UI
        const newItems = arrayMove(state.items, oldIndex, newIndex);

        // Update sort_order values
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          sort_order: index,
        }));

        setState((prev) => ({
          ...prev,
          items: updatedItems,
        }));

        // Prepare data for API call
        const reorderData: ReorderListItemsRequest = {
          items: updatedItems.map((item) => ({
            id: item.id,
            sort_order: item.sort_order,
          })),
        };

        // Make actual API call
        await reorderListItems(listId, reorderData);
      } catch (error) {
        // Rollback on error
        setState((prev) => ({
          ...prev,
          items: originalItems,
          error:
            error instanceof Error ? error.message : 'Failed to reorder items',
        }));
        throw error;
      }
    },
    [listId, state.items]
  );

  return {
    items: state.items,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    refetch,
    addItem,
    removeItem,
    reorderItems,
  };
}
