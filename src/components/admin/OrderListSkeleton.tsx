export interface OrderListSkeletonProps {
  /**
   * Number of skeleton items to show
   */
  count?: number
  /**
   * Whether to show the skeleton in grid or list view
   */
  viewMode?: 'grid' | 'list'
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Skeleton loader component that matches the order card layout
 * Provides a smooth loading experience while order data is being fetched
 */
export default function OrderListSkeleton({
  count = 6,
  viewMode = 'grid',
  className = ''
}: OrderListSkeletonProps) {
  const skeletonItems = Array.from({ length: count }, (_, index) => index)
  
  if (viewMode === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {skeletonItems.map((index) => (
          <OrderSkeletonItem key={index} variant="list" />
        ))}
      </div>
    )
  }
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {skeletonItems.map((index) => (
        <OrderSkeletonItem key={index} variant="grid" />
      ))}
    </div>
  )
}

interface OrderSkeletonItemProps {
  variant: 'grid' | 'list'
}

/**
 * Individual skeleton item component
 */
function OrderSkeletonItem({ variant }: OrderSkeletonItemProps) {
  const baseClasses = "animate-pulse bg-white border border-gray-200 rounded-lg p-6"
  
  if (variant === 'list') {
    return (
      <div className={`${baseClasses} flex items-center space-x-6`}>
        {/* Order Number & Status */}
        <div className="flex-shrink-0">
          <div className="h-6 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        
        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
        
        {/* Customer Info */}
        <div className="flex-shrink-0 text-right">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        
        {/* Actions */}
        <div className="flex-shrink-0 space-y-2">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      </div>
    )
  }
  
  return (
    <div className={baseClasses}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-6 bg-gray-200 rounded w-16 mb-1" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      
      {/* Customer Info */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      
      {/* Order Items */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-36" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
        </div>
      </div>
      
      {/* Special Requests */}
      <div className="mb-6">
        <div className="h-3 bg-gray-200 rounded w-full mb-1" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for the order dashboard header
 */
export function OrderDashboardHeaderSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
        {/* Title */}
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-4">
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-200 rounded w-10" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for the order filters section
 */
export function OrderFiltersSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="h-10 bg-gray-200 rounded flex-1" />
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded w-20" />
          <div className="h-10 bg-gray-200 rounded w-20" />
          <div className="h-10 bg-gray-200 rounded w-20" />
        </div>
      </div>
      
      {/* Advanced Filters Toggle */}
      <div className="h-6 bg-gray-200 rounded w-32" />
    </div>
  )
}

/**
 * Skeleton for the order statistics section
 */
export function OrderStatsSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-6" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Complete skeleton for the entire order dashboard
 */
export function OrderDashboardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <OrderDashboardHeaderSkeleton />
      <OrderStatsSkeleton />
      <OrderFiltersSkeleton />
      <OrderListSkeleton count={6} viewMode="grid" />
    </div>
  )
}
