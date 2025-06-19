'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import CreateListModal from '@/components/CreateListModal/CreateListModal';
import EditListModal from '@/components/EditListModal/EditListModal';
import { List } from '@/types/supabase';
import { useLists } from '@/hooks/useLists';

export default function ListsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // Use the new useLists hook
  const {
    lists,
    isLoading: isListsLoading,
    error,
    createNewList,
    updateExistingList,
    removeList,
    clearError,
  } = useLists();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Show error messages if any
  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreateList = async (data: {
    name: string;
    description?: string;
    is_public: boolean;
  }) => {
    if (!user) return;

    setIsOperationLoading(true);
    try {
      await createNewList({
        name: data.name,
        description: data.description,
        is_public: data.is_public,
      });
    } catch (error) {
      console.error('Error creating list:', error);
      // Error is already handled by the hook
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleEditList = async (data: {
    name: string;
    description?: string;
    is_public: boolean;
  }) => {
    if (!selectedList) return;

    setIsOperationLoading(true);
    try {
      await updateExistingList(selectedList.id, {
        name: data.name,
        description: data.description,
        is_public: data.is_public,
      });
    } catch (error) {
      console.error('Error editing list:', error);
      // Error is already handled by the hook
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;

    setIsOperationLoading(true);
    try {
      await removeList(selectedList.id);
    } catch (error) {
      console.error('Error deleting list:', error);
      // Error is already handled by the hook
    } finally {
      setIsOperationLoading(false);
    }
  };

  const openEditModal = (list: List) => {
    setSelectedList(list);
    setIsEditModalOpen(true);
  };

  if (loading || isListsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Lists
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Organize your movies and TV shows into custom lists
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:cursor-pointer"
          >
            Create New List
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No lists yet
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create your first list to start organizing your movies and shows
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:cursor-pointer"
              >
                Create Your First List
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list: List) => (
              <div
                key={list.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/lists/${list.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {list.name}
                  </h3>
                  <div className="flex space-x-2">
                    {list.is_public && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Public
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(list);
                      }}
                      className="text-blue-400 hover:text-gray-600 dark:hover:text-gray-300 hover:cursor-pointer"
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {list.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {list.description}
                  </p>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>0 items</span> {/* TODO: Replace with actual count */}
                  <span>
                    Updated {new Date(list.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateList}
        isLoading={isOperationLoading}
      />

      <EditListModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditList}
        onDelete={handleDeleteList}
        list={selectedList}
        isLoading={isOperationLoading}
        isDeleting={isOperationLoading}
      />
    </div>
  );
}
