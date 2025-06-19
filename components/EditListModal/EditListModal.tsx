'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { List } from '@/types/supabase';

const editListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  is_public: z.boolean(),
});

type EditListFormData = z.infer<typeof editListSchema>;

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditListFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  list: List | null;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export default function EditListModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  list,
  isLoading = false,
  isDeleting = false,
}: EditListModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditListFormData>({
    resolver: zodResolver(editListSchema),
  });

  // Populate form with existing list data when list changes
  useEffect(() => {
    if (list) {
      setValue('name', list.name);
      setValue('description', list.description || '');
      setValue('is_public', list.is_public);
    }
  }, [list, setValue]);

  const handleFormSubmit = async (data: EditListFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this list? This action cannot be undone.'
      )
    ) {
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !list) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit List
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:cursor-pointer"
          >
            <svg
              className="w-6 h-6"
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                List Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter list name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe your list"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register('is_public')}
                type="checkbox"
                id="is_public"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded hover:cursor-pointer"
              />
              <label
                htmlFor="is_public"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Make this list public
              </label>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 hover:cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete List'}
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
