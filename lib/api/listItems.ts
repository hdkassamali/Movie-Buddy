import { ListItem } from '@/types/supabase';

// Types for API requests/responses
export interface AddListItemRequest {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  notes?: string | null;
}

export interface ReorderListItemsRequest {
  items: {
    id: string;
    sort_order: number;
  }[];
}

export interface ListItemsResponse {
  items: ListItem[];
}

export interface ListItemResponse {
  item: ListItem;
}

// Client-side API service functions
export class ListItemsApi {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Get all items in a list
  static async getListItems(listId: string): Promise<ListItem[]> {
    const response = await fetch(`/api/lists/${listId}/items`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await this.handleResponse<ListItemsResponse>(response);
    return data.items;
  }

  // Add item to a list
  static async addListItem(
    listId: string,
    itemData: AddListItemRequest
  ): Promise<ListItem> {
    const response = await fetch(`/api/lists/${listId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(itemData),
    });

    const data = await this.handleResponse<ListItemResponse>(response);
    return data.item;
  }

  // Reorder items in a list
  static async reorderListItems(
    listId: string,
    reorderData: ReorderListItemsRequest
  ): Promise<void> {
    const response = await fetch(`/api/lists/${listId}/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(reorderData),
    });

    await this.handleResponse<{ success: true }>(response);
  }

  // Remove item from a list
  static async removeListItem(listId: string, itemId: string): Promise<void> {
    const response = await fetch(`/api/lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    await this.handleResponse<{ success: true }>(response);
  }
}

// Convenience functions that match the class methods
export const getListItems = (listId: string) =>
  ListItemsApi.getListItems(listId);
export const addListItem = (listId: string, data: AddListItemRequest) =>
  ListItemsApi.addListItem(listId, data);
export const reorderListItems = (
  listId: string,
  data: ReorderListItemsRequest
) => ListItemsApi.reorderListItems(listId, data);
export const removeListItem = (listId: string, itemId: string) =>
  ListItemsApi.removeListItem(listId, itemId);
