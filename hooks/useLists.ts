import { useState, useEffect, useCallback } from 'react';
import { List } from '@/types/supabase';
import {
  getUserLists,
  createList,
  updateList,
  deleteList,
  CreateListRequest,
  UpdateListRequest,
} from '@/lib/api/lists';

interface UseListsState {
  lists: List[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface UseListsActions {
  refetch: () => Promise<void>;
  createNewList: (data: CreateListRequest) => Promise<List>;
  updateExistingList: (id: string, data: UpdateListRequest) => Promise<List>;
  removeList: (id: string) => Promise<void>;
  clearError: () => void;
}

interface UseListsReturn extends UseListsState, UseListsActions {}

export function useLists(): UseListsReturn {
  const [state, setState] = useState<UseListsState>({
    lists: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
  });

  // Fetch lists from the server
  const fetchLists = useCallback(async (isRefresh = false) => {
    try {
      setState((prev) => ({
        ...prev,
        isLoading: !isRefresh,
        isRefreshing: isRefresh,
        error: null,
      }));

      const lists = await getUserLists();

      setState((prev) => ({
        ...prev,
        lists,
        isLoading: false,
        isRefreshing: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Failed to fetch lists',
      }));
    }
  }, []);

  // Initialize lists on mount
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Refetch lists (for manual refresh)
  const refetch = useCallback(() => fetchLists(true), [fetchLists]);

  // Create new list with optimistic update
  const createNewList = useCallback(
    async (data: CreateListRequest): Promise<List> => {
      try {
        setState((prev) => ({ ...prev, error: null }));

        // Optimistic update: create temporary list
        const tempId = `temp-${Date.now()}`;
        const optimisticList: List = {
          id: tempId,
          name: data.name,
          description: data.description || null,
          is_public: data.is_public,
          user_id: '', // Will be set by server
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          lists: [optimisticList, ...prev.lists],
        }));

        // Make actual API call
        const newList = await createList(data);

        // Replace optimistic list with real one
        setState((prev) => ({
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === tempId ? newList : list
          ),
        }));

        return newList;
      } catch (error) {
        // Remove optimistic list on error
        setState((prev) => ({
          ...prev,
          lists: prev.lists.filter((list) => !list.id.startsWith('temp-')),
          error:
            error instanceof Error ? error.message : 'Failed to create list',
        }));
        throw error;
      }
    },
    []
  );

  // Update existing list with optimistic update
  const updateExistingList = useCallback(
    async (id: string, data: UpdateListRequest): Promise<List> => {
      try {
        setState((prev) => ({ ...prev, error: null }));

        // Store original list for rollback
        const originalList = state.lists.find((list) => list.id === id);
        if (!originalList) {
          throw new Error('List not found');
        }

        // Optimistic update
        const optimisticList: List = {
          ...originalList,
          ...data,
          updated_at: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === id ? optimisticList : list
          ),
        }));

        // Make actual API call
        const updatedList = await updateList(id, data);

        // Replace optimistic update with real data
        setState((prev) => ({
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === id ? updatedList : list
          ),
        }));

        return updatedList;
      } catch (error) {
        // Rollback on error
        setState((prev) => ({
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === id ? state.lists.find((l) => l.id === id) || list : list
          ),
          error:
            error instanceof Error ? error.message : 'Failed to update list',
        }));
        throw error;
      }
    },
    [state.lists]
  );

  // Delete list with optimistic update
  const removeList = useCallback(
    async (id: string): Promise<void> => {
      // Store original list for rollback
      const originalList = state.lists.find((list) => list.id === id);
      if (!originalList) {
        throw new Error('List not found');
      }

      try {
        setState((prev) => ({ ...prev, error: null }));

        // Optimistic update: remove from UI
        setState((prev) => ({
          ...prev,
          lists: prev.lists.filter((list) => list.id !== id),
        }));

        // Make actual API call
        await deleteList(id);
      } catch (error) {
        // Rollback on error
        setState((prev) => ({
          ...prev,
          lists: [...prev.lists, originalList].sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          ),
          error:
            error instanceof Error ? error.message : 'Failed to delete list',
        }));
        throw error;
      }
    },
    [state.lists]
  );

  // Clear error state
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    lists: state.lists,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    refetch,
    createNewList,
    updateExistingList,
    removeList,
    clearError,
  };
}
