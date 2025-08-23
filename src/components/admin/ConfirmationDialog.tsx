import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
  loading?: boolean
  className?: string | undefined
}

/**
 * Reusable confirmation dialog component
 * Provides accessible modal dialog with customizable styling and actions
 */
export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  className
}: ConfirmationDialogProps) => {
  const dialogRef = useRef<globalThis.HTMLDivElement>(null)
  const confirmButtonRef = useRef<globalThis.HTMLButtonElement>(null)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the confirm button when dialog opens
      setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 100)

      // Trap focus within dialog
      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }

        if (e.key === 'Tab') {
          const dialog = dialogRef.current
          if (!dialog) return

          const focusableElements = dialog.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
          
          const firstElement = focusableElements[0] as globalThis.HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as globalThis.HTMLElement

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement?.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement?.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onClose])

  // Don't render if not open
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
          icon: '⚠️',
          iconColor: 'text-red-600'
        }
      case 'warning':
        return {
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white',
          icon: '⚠️',
          iconColor: 'text-yellow-600'
        }
      case 'success':
        return {
          confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
          icon: '✅',
          iconColor: 'text-green-600'
        }
      default:
        return {
          confirmButton: 'bg-coffee-600 hover:bg-coffee-700 focus:ring-coffee-500 text-white',
          icon: 'ℹ️',
          iconColor: 'text-coffee-600'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="dialog-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Dialog positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Dialog panel */}
        <div
          ref={dialogRef}
          className={cn(
            'inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all',
            'sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6',
            '',
            className
          )}
        >
          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div className={cn(
              'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10',
              variant === 'danger' ? 'bg-red-100 ' :
              variant === 'warning' ? 'bg-yellow-100 ' :
              variant === 'success' ? 'bg-green-100 ' :
              'bg-coffee-100 '
            )}>
              <span className={cn('text-xl', styles.iconColor)} aria-hidden="true">
                {styles.icon}
              </span>
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 
                className="text-lg leading-6 font-medium text-gray-900 " 
                id="dialog-title"
              >
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 ">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                styles.confirmButton
              )}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed "
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized confirmation dialogs for common use cases

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  loading?: boolean
}

export const DeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading = false
}: DeleteConfirmationProps) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Item"
      message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      loading={loading}
    />
  )
}

interface StatusChangeConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  orderName: string
  newStatus: string
  loading?: boolean
}

export const StatusChangeConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  orderName,
  newStatus,
  loading = false
}: StatusChangeConfirmationProps) => {
  const getVariant = () => {
    if (newStatus === 'cancelled') return 'danger'
    if (newStatus === 'completed') return 'success'
    return 'default'
  }

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Change Order Status"
      message={`Are you sure you want to mark order "${orderName}" as ${newStatus}?`}
      confirmText={`Mark ${newStatus}`}
      cancelText="Cancel"
      variant={getVariant()}
      loading={loading}
    />
  )
}

interface BulkOperationConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  operation: string
  itemCount: number
  loading?: boolean
}

export const BulkOperationConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  operation,
  itemCount,
  loading = false
}: BulkOperationConfirmationProps) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Bulk Operation"
      message={`Are you sure you want to ${operation} ${itemCount} item${itemCount !== 1 ? 's' : ''}?`}
      confirmText={`${operation} ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      cancelText="Cancel"
      variant={operation.toLowerCase().includes('delete') || operation.toLowerCase().includes('cancel') ? 'danger' : 'default'}
      loading={loading}
    />
  )
}
