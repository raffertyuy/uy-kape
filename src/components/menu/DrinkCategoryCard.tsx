import React, { useState } from 'react'
import type { DrinkCategory } from '@/types/menu.types'

interface DrinkCategoryCardProps {
  category: DrinkCategory
  onEdit: () => void
  onDelete: () => void
}

export const DrinkCategoryCard: React.FC<DrinkCategoryCardProps> = ({
  category,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  return (
    <div className="bg-white border border-coffee-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      {/* Category Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-coffee-800 text-lg">{category.name}</h3>
          {category.description && (
            <p className="text-coffee-600 text-sm mt-1 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-2">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {category.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Category Metadata */}
      <div className="flex justify-between items-center text-sm text-coffee-500 mb-4">
        <span>Order: {category.display_order}</span>
        {category.created_at && (
          <span>
            Created: {new Date(category.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 text-sm bg-coffee-100 text-coffee-700 rounded-md 
                   hover:bg-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500 
                   focus:ring-offset-2 transition-colors duration-200"
          aria-label={`Edit ${category.name} category`}
        >
          Edit
        </button>
        <button
          onClick={handleDeleteClick}
          className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md 
                   hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 
                   focus:ring-offset-2 transition-colors duration-200"
          aria-label={`Delete ${category.name} category`}
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
                <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the category "{category.name}"? 
              This will also affect any drinks in this category.
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
      )}
    </div>
  )
}