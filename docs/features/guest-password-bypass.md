# Guest Password Bypass Feature

## Overview

The Guest Password Bypass feature allows developers and testers to temporarily disable the guest password authentication requirement for the `/order` route. This feature is particularly useful during development, testing, and demonstration scenarios.

## Configuration

### Environment Variable

The bypass functionality is controlled by the `VITE_GUEST_BYPASS_PASSWORD` environment variable:

```bash
# Disable password protection for guest ordering (default: false)
VITE_GUEST_BYPASS_PASSWORD=true
```

### Supported Values

- `true` or `"true"`: Bypasses guest password authentication
- `false`, `"false"`, or unset: Requires guest password authentication (default)

## Behavior

### When Bypass is Enabled (`VITE_GUEST_BYPASS_PASSWORD=true`)

1. **Direct Access**: Users can navigate to `/order` and immediately access the ordering interface
2. **No Password Prompt**: The password input component is not rendered
3. **Automatic Authentication**: The system automatically treats the user as authenticated
4. **Development Convenience**: Streamlines the development and testing workflow

### When Bypass is Disabled (`VITE_GUEST_BYPASS_PASSWORD=false` or unset)

1. **Password Protection**: Users must enter the guest password to access the ordering interface
2. **Security Enforcement**: Standard authentication flow is enforced
3. **Production Behavior**: Maintains secure access control for production environments

## Implementation Details

### Components Affected

1. **ConditionalPasswordProtection Component**:
   - Conditionally renders the PasswordProtection wrapper
   - Passes through children directly when bypass is enabled

2. **GuestModule Component**:
   - Uses ConditionalPasswordProtection instead of direct PasswordProtection
   - Maintains all existing functionality

3. **App Configuration**:
   - Reads environment variable during build time
   - Provides configuration to components via app context

### Technical Implementation

```typescript
// Configuration reading
const bypassGuestPassword = import.meta.env.VITE_GUEST_BYPASS_PASSWORD === "true";

// Conditional rendering
return bypassPassword ? (
  children
) : (
  <PasswordProtection>
    {children}
  </PasswordProtection>
);
```

## Testing

### Unit Tests

The feature includes comprehensive unit tests covering:

- Environment variable parsing
- Conditional component rendering
- Both bypass enabled and disabled scenarios
- Props passing and component integration

### E2E Tests

Playwright E2E tests automatically adapt to the current bypass configuration:

- Tests skip password-related assertions when bypass is enabled
- Dynamic test descriptions indicate the current configuration
- Separate test suites specifically validate bypass functionality

### Test Utilities

The `password-test-utils.ts` module provides:

- Configuration detection functions
- Adaptive authentication helpers
- Test skipping logic based on configuration

## Security Considerations

### Safe Usage

1. **Development Only**: Intended for development and testing environments
2. **Environment Isolation**: Should not be enabled in production environments
3. **Admin Protection**: Admin authentication is never bypassed regardless of this setting

### Best Practices

1. **Default Secure**: Defaults to `false` (password required) when unset
2. **Explicit Configuration**: Requires explicit `true` value to enable bypass
3. **Documentation**: Clear documentation of security implications
4. **Build-time Configuration**: Uses build-time environment variables for immutability

## Usage Examples

### Development Workflow

```bash
# Enable bypass for rapid development
echo "VITE_GUEST_BYPASS_PASSWORD=true" >> .env

# Start development server
npm run dev

# Now /order is immediately accessible without password
```

### Testing Scenarios

```bash
# Test with bypass enabled
VITE_GUEST_BYPASS_PASSWORD=true npm test

# Test with bypass disabled (production behavior)
VITE_GUEST_BYPASS_PASSWORD=false npm test
```

### Production Deployment

```bash
# Ensure bypass is disabled (or omit entirely)
VITE_GUEST_BYPASS_PASSWORD=false
```

## Troubleshooting

### Common Issues

1. **Environment Variable Not Loading**
   - Verify `.env` file exists and contains the variable
   - Restart development server after changing environment variables
   - Check that variable name is exactly `VITE_GUEST_BYPASS_PASSWORD`

2. **Bypass Not Working**
   - Verify value is exactly `"true"` (case-sensitive)
   - Clear browser cache and hard refresh
   - Check browser developer tools for any JavaScript errors

3. **Tests Failing**
   - Ensure test environment matches expected configuration
   - Use `password-test-utils` for adaptive test behavior
   - Check that E2E tests are using the correct environment

### Debugging

To debug the current configuration:

```typescript
// Check configuration in browser console
console.log('Bypass enabled:', import.meta.env.VITE_GUEST_BYPASS_PASSWORD === "true");

// Check in test environment
import { getPasswordTestConfig } from "./tests/config/password-test-utils";
console.log('Test config:', getPasswordTestConfig());
```

## Migration and Rollback

### Enabling Bypass

1. Add `VITE_GUEST_BYPASS_PASSWORD=true` to `.env`
2. Restart development server
3. Verify functionality on `/order` route

### Disabling Bypass

1. Set `VITE_GUEST_BYPASS_PASSWORD=false` or remove from `.env`
2. Restart development server
3. Verify password protection is restored

### No Breaking Changes

This feature is designed to be:

- **Backward Compatible**: Existing installations continue to work without changes
- **Additive**: New functionality added without modifying existing behavior
- **Safe Default**: Secure password protection remains the default behavior
