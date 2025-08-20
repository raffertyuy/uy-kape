import { Logo } from './Logo'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  showLogo?: boolean
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  showLogo = true,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="max-w-md mx-auto">
        {showLogo && (
          <div className="mb-6">
            <Logo 
              size="lg"
              alt=""
              className="mx-auto opacity-60"
            />
          </div>
        )}
        
        {icon && (
          <div className="mb-4 text-coffee-400">
            {icon}
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-coffee-800 mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-coffee-600 mb-6">
            {description}
          </p>
        )}
        
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

interface EmptyMenuStateProps {
  onAddItem?: () => void
}

export function EmptyMenuState({ onAddItem }: EmptyMenuStateProps) {
  return (
    <EmptyState
      title="No items in your menu yet"
      description="Start building your coffee menu by adding your first drink category or beverage."
      icon={
        <div className="text-6xl">☕</div>
      }
      action={
        onAddItem && (
          <button
            onClick={onAddItem}
            className="coffee-button-primary"
          >
            Add Your First Item
          </button>
        )
      }
    />
  )
}

interface EmptyOrdersStateProps {
  onRefresh?: () => void
}

export function EmptyOrdersState({ onRefresh }: EmptyOrdersStateProps) {
  return (
    <EmptyState
      title="No orders yet"
      description="Orders will appear here when customers start placing them."
      icon={
        <div className="text-6xl">📋</div>
      }
      action={
        onRefresh && (
          <button
            onClick={onRefresh}
            className="coffee-button-secondary"
          >
            Refresh Orders
          </button>
        )
      }
    />
  )
}

interface EmptySearchStateProps {
  searchTerm: string
  onClearSearch?: () => void
}

export function EmptySearchState({ searchTerm, onClearSearch }: EmptySearchStateProps) {
  return (
    <EmptyState
      title={`No results for "${searchTerm}"`}
      description="Try adjusting your search terms or browse all available items."
      icon={
        <div className="text-6xl">🔍</div>
      }
      action={
        onClearSearch && (
          <button
            onClick={onClearSearch}
            className="coffee-button-secondary"
          >
            Clear Search
          </button>
        )
      }
      showLogo={false}
    />
  )
}