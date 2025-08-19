import React, { useState } from 'react'
import type { OptionCategory } from '@/types/menu.types'

interface OptionCategoryCardProps {
  category: OptionCategory
  onEdit: () => void
  onDelete: () => void
  onManageValues: () => void
}

export const OptionCategoryCard: React.FC<OptionCategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onManageValues
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
    <>
      <div className="bg-white border border-coffee-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          {/* Category Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-coffee-800 text-lg">{category.name}</h3>
                  {category.is_required && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      Required
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="text-coffee-600 text-sm mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
              
              {/* Metadata */}
              <div className="text-sm text-coffee-500 text-right">
                <div>Order: {category.display_order}</div>
                {category.created_at && (
                  <div>
                    Created: {new Date(category.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onManageValues}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md 
                       hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:ring-offset-2 transition-colors duration-200"
              aria-label={`Manage values for ${category.name}`}
            >
              Manage Values
            </button>
            <button
              onClick={onEdit}
              className="px-3 py-2 text-sm bg-coffee-100 text-coffee-700 rounded-md 
                       hover:bg-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500 
                       focus:ring-offset-2 transition-colors duration-200"
              aria-label={`Edit ${category.name} category`}
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md 
                       hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 
                       focus:ring-offset-2 transition-colors duration-200"
              aria-label={`Delete ${category.name} category`}
            >
              Delete
            </button>
          </div>
        </div>
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
                <h3 className="text-lg font-semibold text-gray-900">Delete Option Category</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the option category "{category.name}"? 
              This will also remove all associated option values and drink configurations.
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
    </>
  )
}