# Enhanced Error Handling System

This document describes the improved error handling system implemented to provide better user experience when errors occur in the application.

## Overview

The enhanced error handling system provides:
- **Visible Error Notifications**: Toast notifications and persistent banners for user feedback
- **Automatic Retry Mechanisms**: Built-in retry logic with exponential backoff
- **User-Friendly Error Messages**: Contextual, actionable error messages
- **Global Error Tracking**: Centralized error management across the application
- **Recovery Options**: Clear paths for users to recover from errors

## Components

### 1. ErrorContext & ErrorContextProvider
**Location**: `src/contexts/ErrorContext.tsx`

Provides global error state management across the application.

**Features**:
- Tracks multiple errors with unique IDs
- Auto-clears non-critical errors after 10 seconds
- Identifies global/critical errors that affect the entire app
- Provides methods to add, clear, and retrieve errors

### 2. useErrorToast Hook
**Location**: `src/hooks/useErrorToast.ts`

Automatically displays toast notifications for errors added to the ErrorContext.

**Features**:
- Converts technical error messages to user-friendly language
- Provides retry buttons for recoverable errors
- Auto-categorizes errors (network, server, validation, etc.)
- Handles error dismissal and cleanup

### 3. GlobalErrorNotification Component
**Location**: `src/components/ui/GlobalErrorNotification.tsx`

Shows persistent error banners for critical system errors.

**Features**:
- Only displays for critical errors (server issues, offline status)
- Provides refresh/retry options
- Can be dismissed by users
- Styled differently based on error type

### 4. useNetworkErrorHandler Hook
**Location**: `src/hooks/useNetworkErrorHandler.ts`

Provides comprehensive network operation error handling with automatic retries.

**Features**:
- Automatic retry with exponential backoff
- User feedback during retry attempts
- Specialized handlers for forms, data fetching, and general operations
- Customizable error messages and retry logic

### 5. Enhanced Error Boundary
**Location**: `src/components/ui/ErrorBoundary.tsx`

Catches React component errors and provides recovery options.

**Features**:
- Automatic retry for network-related errors
- User-friendly error pages with recovery options
- Developer information in development mode
- Integration with global error handling

## Usage Examples

### Basic Error Handling with Toast Notifications

```typescript
import { useEnhancedErrorHandling } from '../hooks/useEnhancedErrorHandling'

const MyComponent = () => {
  const { setErrorWithToast } = useEnhancedErrorHandling()

  const handleAction = async () => {
    try {
      await someAsyncOperation()
    } catch (error) {
      // This will show a toast notification and add to global error context
      setErrorWithToast(error, 'user_action')
    }
  }

  return <button onClick={handleAction}>Perform Action</button>
}
```

### Network Operations with Automatic Retry

```typescript
import { useNetworkErrorHandler } from '../hooks/useNetworkErrorHandler'

const NetworkComponent = () => {
  const { handleNetworkOperation } = useNetworkErrorHandler()

  const fetchData = async () => {
    const result = await handleNetworkOperation(
      async () => {
        const response = await fetch('/api/data')
        if (!response.ok) throw new Error('Failed to fetch data')
        return response.json()
      },
      {
        operationName: 'Loading menu data',
        maxRetries: 3,
        showSuccessToast: true,
        successMessage: 'Menu loaded successfully!'
      }
    )
    
    if (result) {
      // Handle successful result
      console.log('Data loaded:', result)
    }
    // Errors are automatically handled with user feedback
  }

  return <button onClick={fetchData}>Load Data</button>
}
```

### Form Submission with Error Handling

```typescript
import { useNetworkErrorHandler } from '../hooks/useNetworkErrorHandler'

const FormComponent = () => {
  const { handleFormSubmission } = useNetworkErrorHandler()

  const submitForm = async (formData: any) => {
    const result = await handleFormSubmission(
      async () => {
        const response = await fetch('/api/submit', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        if (!response.ok) throw new Error('Submission failed')
        return response.json()
      },
      'Order Form'
    )
    
    if (result) {
      // Form submitted successfully
      // Success toast is automatically shown
    }
    // Errors are automatically handled
  }

  return <form onSubmit={submitForm}>...</form>
}
```

## Error Types and Handling

### Network Errors
- **Detection**: Errors containing "network", "fetch", "connection"
- **Handling**: Automatic retry with exponential backoff
- **User Feedback**: "Connection Problem" with retry option
- **Recovery**: Retry button, connection status check

### Server Errors
- **Detection**: Errors containing "server", "500", "internal"
- **Handling**: Limited retries, persistent notification
- **User Feedback**: "Server Error" with explanation
- **Recovery**: Refresh page option, contact support info

### Validation Errors
- **Detection**: Errors containing "validation", "invalid", "400"
- **Handling**: No automatic retry
- **User Feedback**: "Invalid Data" with specific guidance
- **Recovery**: Form correction hints

### Permission Errors
- **Detection**: Errors containing "permission", "unauthorized", "403"
- **Handling**: No automatic retry
- **User Feedback**: "Access Denied" with explanation
- **Recovery**: Login prompt or contact admin

## Configuration

### Error Context Settings
```typescript
<ErrorContextProvider maxErrors={5}>
  <App />
</ErrorContextProvider>
```

### Toast Provider Settings
```typescript
<ToastProvider maxToasts={5}>
  <App />
</ToastProvider>
```

### Network Handler Options
```typescript
const options = {
  operationName: 'Custom Operation',
  maxRetries: 3,
  showSuccessToast: true,
  successMessage: 'Operation completed!',
  customErrorHandler: (error) => {
    // Return custom error message or null for default
    return 'Custom error message'
  }
}
```

## Development Tools

### Error Handling Demo Component
**Location**: `src/components/dev/ErrorHandlingDemo.tsx`

A development-only component that provides buttons to test different error scenarios:
- Network errors
- Server errors  
- Form validation errors
- Data fetch errors
- Global context errors
- Critical system errors

This component is only visible in development mode and helps test the error handling system.

## Best Practices

### 1. Use Appropriate Error Handlers
- Use `useNetworkErrorHandler` for API calls and network operations
- Use `useEnhancedErrorHandling` for general error scenarios
- Use `ErrorBoundary` to wrap components that might throw errors

### 2. Provide Context
Always provide meaningful operation names and context when handling errors:
```typescript
handleNetworkOperation(operation, {
  operationName: 'Submitting coffee order', // Specific and user-friendly
  maxRetries: 2
})
```

### 3. Customize Error Messages
Provide custom error handlers for domain-specific errors:
```typescript
customErrorHandler: (error) => {
  if (error.message.includes('COFFEE_OUT_OF_STOCK')) {
    return 'Sorry, this coffee is currently out of stock. Please try another option.'
  }
  return null // Use default handling
}
```

### 4. Consider User Context
- Show different messages for different user types (guest vs. admin)
- Provide appropriate recovery options based on user capabilities
- Consider offline scenarios and provide offline-friendly messages

### 5. Test Error Scenarios
- Use the ErrorHandlingDemo component in development
- Test network failures, server errors, and edge cases
- Verify that error messages are helpful and actionable

## Integration with Existing Code

The enhanced error handling system is designed to integrate seamlessly with existing code:

1. **Existing Error Boundaries**: Continue to work and now integrate with global error context
2. **Existing Hooks**: Can be gradually migrated to use enhanced error handling
3. **Existing Components**: No breaking changes, enhanced features are opt-in

## Future Enhancements

Planned improvements include:
- Error analytics and reporting
- User-customizable error preferences
- Offline error queue and sync
- Error recovery suggestions based on user behavior
- Integration with external error monitoring services

## Troubleshooting

### Common Issues

1. **Toast notifications not appearing**
   - Ensure `ToastProvider` wraps your components
   - Check that `useErrorToast` hook is being used in the component tree

2. **Global notifications not showing**
   - Verify `ErrorContextProvider` is at the top level
   - Check that errors are being added to the context

3. **Retries not working**
   - Confirm network errors are being properly categorized
   - Check that the operation is actually retryable

For additional support, check the component documentation and console logs in development mode.