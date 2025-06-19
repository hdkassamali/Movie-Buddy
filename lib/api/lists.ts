import { List } from '@/types/supabase';

// Types for API requests/responses
export interface CreateListRequest {
  name: string;
  description?: string;
  is_public: boolean;
}

export interface UpdateListRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface ListsResponse {
  lists: List[];
}

export interface ListResponse {
  list: List;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// Client-side API service functions
export class ListsApi {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Get all user's lists
  static async getUserLists(): Promise<List[]> {
    const response = await fetch('/api/lists', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await this.handleResponse<ListsResponse>(response);
    return data.lists;
  }

  // Get single list by ID
  static async getListById(id: string): Promise<List> {
    const response = await fetch(`/api/lists/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await this.handleResponse<ListResponse>(response);
    return data.list;
  }

  // Create new list
  static async createList(listData: CreateListRequest): Promise<List> {
    const response = await fetch('/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(listData),
    });

    const data = await this.handleResponse<ListResponse>(response);
    return data.list;
  }

  // Update existing list
  static async updateList(
    id: string,
    listData: UpdateListRequest
  ): Promise<List> {
    const response = await fetch(`/api/lists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(listData),
    });

    const data = await this.handleResponse<ListResponse>(response);
    return data.list;
  }

  // Delete list
  static async deleteList(id: string): Promise<void> {
    const response = await fetch(`/api/lists/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    await this.handleResponse<{ message: string }>(response);
  }
}

// Convenience functions that match the old API
export const getUserLists = () => ListsApi.getUserLists();
export const getListById = (id: string) => ListsApi.getListById(id);
export const createList = (data: CreateListRequest) =>
  ListsApi.createList(data);
export const updateList = (id: string, data: UpdateListRequest) =>
  ListsApi.updateList(id, data);
export const deleteList = (id: string) => ListsApi.deleteList(id);
