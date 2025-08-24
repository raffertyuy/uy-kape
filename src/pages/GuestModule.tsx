import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import PasswordProtection from '@/components/PasswordProtection'
import { appConfig } from '@/config/app.config'
import { Logo } from '@/components/ui/Logo'
import { useOrderForm } from '@/hooks/useOrderForm'
import { useDrinksWithOptionsPreview } from '@/hooks/useMenuData'
import type { DrinkWithOptionsAndCategory } from '@/types/menu.types'
import type { OrderSubmissionResult } from '@/types/order.types'
import { useEffect } from 'react'

// Step components
import { DrinkCategoryTabs } from '@/components/guest/DrinkCategoryTabs'
import { DrinkGrid } from '@/components/guest/DrinkGrid'
import { DrinkOptionsForm } from '@/components/guest/DrinkOptionsForm'
import { GuestInfoForm } from '@/components/guest/GuestInfoForm'
import { OrderSummary } from '@/components/guest/OrderSummary'
import { OrderActions } from '@/components/guest/OrderActions'
import { OrderSuccess } from '@/components/guest/OrderSuccess'

function GuestModulePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get URL parameters
  const orderIdParam = searchParams.get('orderId')
  
  // Initialize order form with URL parameter support
  const orderForm = useOrderForm(orderIdParam)
  
  // Get all drinks data (for drink lookup in handleDrinkSelect)
  const { data: allDrinks = [] } = useDrinksWithOptionsPreview()

  // Handle order submission success - set URL parameter
  const handleOrderSuccess = useCallback((result: OrderSubmissionResult) => {
    if (result?.order_id) {
      setSearchParams({ orderId: result.order_id }, { replace: true });
    }
  }, [setSearchParams])

  // Handle starting new order - clear URL parameters
  const handleNewOrder = useCallback(() => {
    setSearchParams({})
    orderForm.startNewOrder()
  }, [setSearchParams, orderForm])

  // Set up the order success callback
  useEffect(() => {
    orderForm.setOrderSuccessCallback(handleOrderSuccess)
  }, [orderForm, handleOrderSuccess])

  // Generate funny name when guest-info step is reached for the first time
  useEffect(() => {
    if (orderForm.currentStep === 'guest-info' && 
        !orderForm.guestInfo.guestName && 
        !orderForm.guestInfo.isGeneratedName &&
        !orderForm.guestInfo.userHasClearedName) {
      orderForm.guestInfo.generateNewFunnyName()
    }
  }, [orderForm.currentStep, orderForm.guestInfo])

  // Handle category selection
  const handleCategorySelect = (categoryId: string | undefined) => {
    setSelectedCategoryId(categoryId || '')
  }

  // Handle drink selection - convert from DrinkWithOptionsPreview to DrinkWithOptionsAndCategory
  const handleDrinkSelect = (drinkId: string) => {
    const selectedDrink = allDrinks.find(drink => drink.id === drinkId)
    
    if (selectedDrink) {
      // Convert DrinkWithOptionsPreview to DrinkWithOptionsAndCategory
      const drinkWithOptions: DrinkWithOptionsAndCategory = {
        ...selectedDrink,
        category: selectedDrink.category || {
          id: 'default',
          name: 'Coffee',
          description: null,
          is_active: true,
          display_order: 0,
          created_at: null,
          updated_at: null
        },
        drink_options: selectedDrink.options_preview.map(preview => ({
          id: preview.id,
          drink_id: selectedDrink.id,
          option_category_id: preview.id,
          default_option_value_id: null,
          created_at: null,
          option_category: {
            id: preview.id,
            name: preview.option_category_name,
            description: null,
            is_required: preview.is_required || false,
            is_active: true,
            display_order: 0,
            created_at: null,
            updated_at: null
          },
          default_value: null
        }))
      }
      
      orderForm.selectDrink(drinkWithOptions)
    }
  }

  // Step rendering functions
  const renderDrinkSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-coffee-800 mb-2">
          Choose Your Drink
        </h3>
        <p className="text-coffee-600">
          Select from our delicious coffee menu
        </p>
      </div>
      
      <DrinkCategoryTabs
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={handleCategorySelect}
      />
      
      <DrinkGrid
        selectedCategoryId={selectedCategoryId}
        selectedDrinkId={orderForm.selectedDrink?.id || ''}
        onDrinkSelect={handleDrinkSelect}
      />
    </div>
  )

  const renderCustomization = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-coffee-800 mb-2">
          Customize Your Order
        </h3>
        <p className="text-coffee-600">
          Make it just the way you like it
        </p>
      </div>
      
      {orderForm.selectedDrink && (
        <DrinkOptionsForm
          drink={orderForm.selectedDrink}
          selectedOptions={orderForm.optionSelection.selectedOptions}
          onOptionChange={orderForm.optionSelection.selectOption}
          optionCategories={orderForm.optionSelection.optionCategories}
          isLoading={orderForm.optionSelection.isLoading}
          error={orderForm.optionSelection.error?.message || null}
        />
      )}
    </div>
  )

  const renderGuestInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-coffee-800 mb-2">
          Your Information
        </h3>
        <p className="text-coffee-600">
          We need your name to call when your order is ready
        </p>
      </div>
      
      <GuestInfoForm
        guestName={orderForm.guestInfo.guestName}
        onGuestNameChange={orderForm.guestInfo.setGuestName}
        specialRequest={orderForm.guestInfo.specialRequest}
        onSpecialRequestChange={orderForm.guestInfo.setSpecialRequest}
        isValid={orderForm.guestInfo.isValid}
        isGeneratedName={orderForm.guestInfo.isGeneratedName}
        onClearGeneratedName={orderForm.guestInfo.clearGeneratedName}
        onBlur={orderForm.guestInfo.handleBlur}
        {...(orderForm.guestInfo.error && { error: orderForm.guestInfo.error })}
      />
    </div>
  )

  const renderReview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-coffee-800 mb-2">
          Review Your Order
        </h3>
        <p className="text-coffee-600">
          Double-check everything looks good before submitting
        </p>
      </div>
      
      {orderForm.selectedDrink && (
        <OrderSummary
          drink={orderForm.selectedDrink}
          selectedOptions={orderForm.optionSelection.selectedOptions}
          optionCategories={orderForm.optionSelection.optionCategories}
          guestName={orderForm.guestInfo.trimmedName}
          specialRequest={orderForm.guestInfo.specialRequest}
        />
      )}
      
      {/* Validation errors */}
      {orderForm.optionSelection.validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Please fix these issues:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {orderForm.optionSelection.validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submission errors */}
      {orderForm.orderSubmission.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Submission Error:</h4>
          <p className="text-red-700 text-sm">{orderForm.orderSubmission.error.message}</p>
        </div>
      )}
    </div>
  )

  const renderSuccess = () => (
    <div className="space-y-6">
      <OrderSuccess
        {...(orderForm.orderSubmission.result && { result: orderForm.orderSubmission.result })}
        {...(orderForm.guestInfo.trimmedName && { guestName: orderForm.guestInfo.trimmedName })}
        {...(orderForm.guestInfo.specialRequest && { specialRequest: orderForm.guestInfo.specialRequest })}
        onCreateNewOrder={handleNewOrder}
      />
    </div>
  )

  // Progress indicator
  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-coffee-600 mb-2">
        <span>Progress</span>
        <span>{Math.round(orderForm.progress)}%</span>
      </div>
      <div className="w-full bg-coffee-200 rounded-full h-2">
        <div 
          className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${orderForm.progress}%` }}
        />
      </div>
    </div>
  )

  // Navigation and actions
  const renderNavigation = () => {
    if (orderForm.currentStep === 'success') {
      return null
    }

    return (
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-coffee-200">
        {/* Previous button */}
        {orderForm.canGoPrevious && (
          <button
            type="button"
            onClick={orderForm.previousStep}
            className="
              px-4 py-2 border border-coffee-300 text-coffee-700 
              bg-white hover:bg-coffee-50 rounded-lg font-medium
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:ring-offset-2
            "
          >
            ← Previous
          </button>
        )}

        <div className="flex-1" />

        {/* Next/Submit button */}
        {orderForm.currentStep === 'review' ? (
          <OrderActions
            onSubmit={orderForm.submitOrder}
            onReset={orderForm.resetForm}
            isSubmitting={orderForm.orderSubmission.isSubmitting}
            isValid={orderForm.isFormValid}
            hasChanges={!!orderForm.selectedDrink}
            className="sm:flex-shrink-0"
          />
        ) : orderForm.canGoNext ? (
          <button
            type="button"
            onClick={orderForm.nextStep}
            className="
              px-6 py-2 bg-coffee-600 hover:bg-coffee-700 
              text-white font-medium rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            disabled={!orderForm.canGoNext}
          >
            Continue →
          </button>
        ) : null}
      </div>
    )
  }

  // Main content based on current step
  const renderCurrentStep = () => {
    switch (orderForm.currentStep) {
      case 'drink-selection':
        return renderDrinkSelection()
      case 'customization':
        return renderCustomization()
      case 'guest-info':
        return renderGuestInfo()
      case 'review':
        return renderReview()
      case 'success':
        return renderSuccess()
      default:
        return renderDrinkSelection()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8 space-y-2 sm:space-y-0 sm:space-x-3">
          <Logo size="md" className="flex-shrink-0" alt="Uy, Kape!" />
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-coffee-800">
              Order Your Coffee
            </h2>
            <p className="text-coffee-600 text-sm mt-1">
              Fresh brewed, made to order
            </p>
          </div>
        </div>

        {/* Progress indicator (hidden on success) */}
        {orderForm.currentStep !== 'success' && renderProgress()}

        {/* Main content */}
        <div className="min-h-[400px]">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {renderNavigation()}
      </div>
    </div>
  )
}

// Export for testing
export { GuestModulePage }

function ProtectedGuestModule() {
  return (
    <PasswordProtection
      requiredPassword={appConfig.guestPassword}
      title="Guest Access"
      description="Enter the guest password to place your coffee order"
      role="guest" // eslint-disable-line jsx-a11y/aria-role
    >
      <GuestModulePage />
    </PasswordProtection>
  )
}

export default ProtectedGuestModule