'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { getListById } from '@/lib/api/lists';
import { useListItems } from '@/hooks/useListItems';
import { List } from '@/types/supabase';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '@/components/SortableItem/SortableItem';

export default function ListDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;
  const [list, setList] = useState<List | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Use the custom hook for list items
  const { items, removeItem, reorderItems } = useListItems(listId);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Fetch list details
  useEffect(() => {
    const fetchList = async () => {
      if (!listId) return;

      try {
        setIsLoading(true);
        const listData = await getListById(listId);
        setList(listData);
        setIsOwner(user?.id === listData.user_id);
      } catch (error) {
        console.error('Error fetching list:', error);
        router.push('/lists');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchList();
    }
  }, [listId, user, router]);

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderItems(active.id as string, over.id as string);
    }
  };

  // Handle removing an item
  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-xl">
          List not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/lists"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to Lists
              </Link>
              <span className="text-gray-500 dark:text-gray-400">|</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {list.is_public ? 'Public' : 'Private'} List
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {list.name}
            </h1>
            {list.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {list.description}
              </p>
            )}
          </div>
          {isOwner && (
            <button
              onClick={() => router.push(`/lists`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:cursor-pointer"
            >
              Edit List
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                This list is empty
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Add movies or TV shows to this list to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      item={item}
                      isOwner={isOwner}
                      onRemove={() => handleRemoveItem(item.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
