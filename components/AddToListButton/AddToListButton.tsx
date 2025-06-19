'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserLists } from '@/lib/api/lists';
import { addListItem } from '@/lib/api/listItems';
import { List } from '@/types/supabase';

interface AddToListButtonProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}

export function AddToListButton({ tmdbId, mediaType }: AddToListButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserLists();
    }
  }, [isOpen, user]);

  const fetchUserLists = async () => {
    try {
      setIsLoading(true);
      const userLists = await getUserLists();
      setLists(userLists);

      // Auto-select the first list if available
      if (userLists.length > 0) {
        setSelectedListId(userLists[0].id);
      }
    } catch (error) {
      console.error('Error fetching user lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedListId) {
      setMessage({ type: 'error', text: 'Please select a list' });
      return;
    }

    try {
      setIsLoading(true);
      await addListItem(selectedListId, {
        tmdb_id: tmdbId,
        media_type: mediaType,
        notes: notes.trim() || null,
      });

      setMessage({ type: 'success', text: 'Added to list successfully!' });
      setNotes('');

      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        setMessage(null);
      }, 1500);
    } catch (error) {
      console.error('Error adding to list:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to add to list',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = () => {
    // Close this modal and navigate to lists page
    setIsOpen(false);
    window.location.href = '/lists';
  };

  if (!user) {
    return (
      <button
        onClick={() => (window.location.href = '/login')}
        className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Login to add to list</span>
      </button>
    );
  }

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors hover:cursor-pointer"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Add to list</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Add to list
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {message && (
              <div
                className={`p-2 mb-4 text-sm rounded ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {isLoading && lists.length === 0 ? (
              <div className="py-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : lists.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You don&apos;t have any lists yet.
                </p>
                <button
                  onClick={handleCreateList}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create a list
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="list"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Select list
                  </label>
                  <select
                    id="list"
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isLoading}
                  >
                    {lists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add a note about this title..."
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleCreateList}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    Create new list
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !selectedListId}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
