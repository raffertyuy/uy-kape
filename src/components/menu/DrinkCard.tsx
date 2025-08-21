import React, { useState } from 'react'
import type { Drink, DrinkWithOptionsPreview } from '@/types/menu.types'
import { DrinkOptionsPreview } from './DrinkOptionsPreview'

interface DrinkCardProps {
  drink: (Drink & { category?: { name: string } | null }) | DrinkWithOptionsPreview
  viewMode: 'grid' | 'list'
  showOptionsPreview?: boolean
  onEdit: () => void
  onDelete: () => void
  onManageOptions: () => void
}

export const DrinkCard = React.memo<DrinkCardProps>(({
  drink,
  viewMode,
  showOptionsPreview = false,
  onEdit,
  onDelete,
  onManageOptions
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Helper function to check if drink has options preview data
  const isDrinkWithOptionsPreview = (d: typeof drink): d is DrinkWithOptionsPreview => {
    return 'options_preview' in d && Array.isArray(d.options_preview)
  }

  // Get options for preview if available
  const drinkOptions = showOptionsPreview && isDrinkWithOptionsPreview(drink) ? drink.options_preview : undefined

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Drink</h3>
            <p className="text-gray-600">This action cannot be undone.</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete "{drink.name}"? 
          This will also remove any associated drink options.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={handleCancelDelete}
            className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md 
                     hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 
                     focus:ring-offset-2 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md 
                     hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
                     focus:ring-offset-2 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white border border-coffee-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            {/* Drink Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-coffee-800 text-lg">{drink.name}</h3>
                  {drink.description && (
                    <p className="text-coffee-600 text-sm mt-1 line-clamp-2">
                      {drink.description}
                    </p>
                  )}
                  {/* Options Preview for List View */}
                  {drinkOptions && (
                    <div className="mt-2">
                      <DrinkOptionsPreview 
                        options={drinkOptions}
                        variant="list"
                        maxDisplayOptions={3}
                      />
                    </div>
                  )}
                </div>
                
                {/* Metadata */}
                <div className="text-sm text-coffee-500 text-right">
                  <div>Category: {drink.category?.name || 'Unknown'}</div>
                  <div>Order: {drink.display_order}</div>
                </div>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center gap-4 ml-4">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  drink.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {drink.is_active ? 'Active' : 'Inactive'}
              </span>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={onManageOptions}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md 
                           hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:ring-offset-2 transition-colors duration-200"
                  aria-label={`Manage options for ${drink.name}`}
                >
                  Options
                </button>
                <button
                  onClick={onEdit}
                  className="px-3 py-2 text-sm bg-coffee-100 text-coffee-700 rounded-md 
                           hover:bg-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500 
                           focus:ring-offset-2 transition-colors duration-200"
                  aria-label={`Edit ${drink.name}`}
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md 
                           hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 
                           focus:ring-offset-2 transition-colors duration-200"
                  aria-label={`Delete ${drink.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        {showDeleteConfirm && <DeleteConfirmModal />}
      </>
    )
  }

  // Grid view

  return (
    <>
      <div className="bg-white border border-coffee-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
        {/* Drink Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-coffee-800 text-lg">{drink.name}</h3>
            {drink.description && (
              <p className="text-coffee-600 text-sm mt-1 line-clamp-3">
                {drink.description}
              </p>
            )}
            {/* Options Preview for Grid View */}
            {drinkOptions && (
              <div className="mt-2">
                <DrinkOptionsPreview 
                  options={drinkOptions}
                  variant="grid"
                  maxDisplayOptions={4}
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-2">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                drink.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {drink.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Drink Metadata */}
        <div className="flex justify-between items-center text-sm text-coffee-500 mb-4">
          <span>Category: {drink.category?.name || 'Unknown'}</span>
          <span>Order: {drink.display_order}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onManageOptions}
            className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md 
                     hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:ring-offset-2 transition-colors duration-200"
            aria-label={`Manage options for ${drink.name}`}
          >
            Options
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 text-sm bg-coffee-100 text-coffee-700 rounded-md 
                     hover:bg-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500 
                     focus:ring-offset-2 transition-colors duration-200"
            aria-label={`Edit ${drink.name}`}
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md 
                     hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 
                     focus:ring-offset-2 transition-colors duration-200"
            aria-label={`Delete ${drink.name}`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && <DeleteConfirmModal />}
    </>
  )
})

DrinkCard.displayName = 'DrinkCard'