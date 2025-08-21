import { useState, useCallback, useEffect, useMemo } from 'react'
import type { DrinkWithOptionsAndCategory } from '@/types/menu.types'
import type { GuestOrderForm } from '@/types/order.types'
import { useGuestInfo } from './useGuestInfo'
import { useOptionSelection } from './useOptionSelection'
import { useOrderSubmission } from './useOrderSubmission'

export type OrderFormStep = 'drink-selection' | 'customization' | 'guest-info' | 'review' | 'success'

interface UseOrderFormReturn {
  // Form state
  currentStep: OrderFormStep
  selectedDrink: DrinkWithOptionsAndCategory | null
  
  // Guest info hook
  guestInfo: ReturnType<typeof useGuestInfo>
  
  // Options hook
  optionSelection: ReturnType<typeof useOptionSelection>
  
  // Submission hook  
  orderSubmission: ReturnType<typeof useOrderSubmission>
  
  // Navigation
  goToStep: (_step: OrderFormStep) => void
  nextStep: () => void
  previousStep: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  
  // Actions
  selectDrink: (_drink: DrinkWithOptionsAndCategory) => void
  resetForm: () => void
  submitOrder: () => Promise<boolean>
  startNewOrder: () => void
  
  // Computed state
  isFormValid: boolean
  orderData: GuestOrderForm | null
  progress: number
}

export function useOrderForm(): UseOrderFormReturn {
  // Form state
  const [currentStep, setCurrentStep] = useState<OrderFormStep>('drink-selection')
  const [selectedDrink, setSelectedDrink] = useState<DrinkWithOptionsAndCategory | null>(null)
  
  // Hook instances
  const guestInfo = useGuestInfo()
  const optionSelection = useOptionSelection(selectedDrink)
  const orderSubmission = useOrderSubmission()

  // Memoize step order to prevent dependency issues
  const stepOrder: OrderFormStep[] = useMemo(() => 
    ['drink-selection', 'customization', 'guest-info', 'review', 'success'], 
    []
  )

  // Reset options when drink changes
  useEffect(() => {
    if (!selectedDrink) {
      setCurrentStep('drink-selection')
    }
  }, [selectedDrink])

  // Auto-advance to success step when order is submitted successfully
  useEffect(() => {
    if (orderSubmission.isSuccess) {
      setCurrentStep('success')
    }
  }, [orderSubmission.isSuccess])

  // Step validation
  const isStepValid = useCallback((step: OrderFormStep): boolean => {
    switch (step) {
      case 'drink-selection':
        return selectedDrink !== null
      
      case 'customization': {
        if (!selectedDrink) return false
        // If drink has no options, skip this step
        const hasOptions = selectedDrink.drink_options && selectedDrink.drink_options.length > 0
        if (!hasOptions) return true
        // Check required options are selected
        return optionSelection.hasRequiredSelections
      }
      
      case 'guest-info':
        return guestInfo.isValid && guestInfo.trimmedName.length >= 2
      
      case 'review':
        return isStepValid('drink-selection') && 
               isStepValid('customization') && 
               isStepValid('guest-info')
      
      case 'success':
        return orderSubmission.isSuccess
      
      default:
        return false
    }
  }, [selectedDrink, optionSelection, guestInfo, orderSubmission.isSuccess])

  const goToStep = useCallback((step: OrderFormStep) => {
    setCurrentStep(step)
  }, [])

  const nextStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      const nextStepIndex = currentIndex + 1
      const nextStepName = stepOrder[nextStepIndex]
      
      // Skip customization step if drink has no options
      const hasOptions = selectedDrink?.drink_options && selectedDrink.drink_options.length > 0
      if (nextStepName === 'customization' && selectedDrink && !hasOptions) {
        if (nextStepIndex + 1 < stepOrder.length) {
          setCurrentStep(stepOrder[nextStepIndex + 1])
        }
      } else {
        setCurrentStep(nextStepName)
      }
    }
  }, [currentStep, selectedDrink, stepOrder])

  const previousStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      const prevStepIndex = currentIndex - 1
      const prevStepName = stepOrder[prevStepIndex]
      
      // Skip customization step if drink has no options
      const hasOptions = selectedDrink?.drink_options && selectedDrink.drink_options.length > 0
      if (prevStepName === 'customization' && selectedDrink && !hasOptions) {
        if (prevStepIndex - 1 >= 0) {
          setCurrentStep(stepOrder[prevStepIndex - 1])
        }
      } else {
        setCurrentStep(prevStepName)
      }
    }
  }, [currentStep, selectedDrink, stepOrder])

  // Navigation state
  const canGoNext = isStepValid(currentStep) && currentStep !== 'success'
  const canGoPrevious = currentStep !== 'drink-selection' && currentStep !== 'success'

  // Actions
  const selectDrink = useCallback((drink: DrinkWithOptionsAndCategory) => {
    setSelectedDrink(drink)
    // Auto-advance to next step based on drink's options
    const hasOptions = drink.drink_options && drink.drink_options.length > 0
    if (hasOptions) {
      setCurrentStep('customization')
    } else {
      setCurrentStep('guest-info')
    }
  }, [])

  const resetForm = useCallback(() => {
    setCurrentStep('drink-selection')
    setSelectedDrink(null)
    guestInfo.setGuestName('')
    guestInfo.setSpecialRequest('')
    guestInfo.clearError()
    orderSubmission.resetSubmission()
  }, [guestInfo, orderSubmission])

  const submitOrder = useCallback(async (): Promise<boolean> => {
    if (!selectedDrink || !guestInfo.trimmedName) {
      return false
    }

    // Validate guest info
    if (!guestInfo.validateName()) {
      return false
    }

    // Validate options
    if (!(await optionSelection.validateSelection())) {
      return false
    }

    const orderData: GuestOrderForm = {
      guest_name: guestInfo.trimmedName,
      drink_id: selectedDrink.id,
      selected_options: optionSelection.selectedOptions,
    const trimmedRequest = guestInfo.specialRequest.trim();
    const orderData: GuestOrderForm = {
      guest_name: guestInfo.trimmedName,
      drink_id: selectedDrink.id,
      selected_options: optionSelection.selectedOptions,
      ...(trimmedRequest && { special_request: trimmedRequest })
    }

    return await orderSubmission.submitGuestOrder(orderData);
  }, [selectedDrink, guestInfo, optionSelection, orderSubmission]);

  const startNewOrder = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // Computed state
  const isFormValid = isStepValid('review');
  
  const orderData: GuestOrderForm | null = selectedDrink && guestInfo.trimmedName ? {
    guest_name: guestInfo.trimmedName,
    drink_id: selectedDrink.id,
    selected_options: optionSelection.selectedOptions,
    ...(guestInfo.specialRequest.trim() && { special_request: guestInfo.specialRequest.trim() })
  } : null;

  // Progress calculation (excluding success step)
  const progressSteps = stepOrder.slice(0, -1); // Remove 'success'
  const currentProgressIndex = progressSteps.indexOf(currentStep);
  const progress = currentProgressIndex >= 0 ? ((currentProgressIndex + 1) / progressSteps.length) * 100 : 0;

  return {
    // Form state
    currentStep,
    selectedDrink,
    
    // Hook instances
    guestInfo,
    optionSelection,
    orderSubmission,
    
    // Navigation
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    
    // Actions
    selectDrink,
    resetForm,
    submitOrder,
    startNewOrder,
    
    // Computed state
    isFormValid,
    orderData,
    progress
  }
}

export default useOrderForm