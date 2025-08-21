---
description: "Updated guest module specifications including special request feature"
created-date: 2025-08-21
last-modified: 2025-08-21
---

# Guest Module Updated Specifications

## Overview

The Guest Module provides a password-protected, mobile-responsive ordering interface for coffee shop guests. This updated specification includes the newly added special request feature, allowing guests to add custom instructions to their orders.

## Core Functionality

### Authentication

- **Password Protection**: Secured with configurable guest password from application config
- **Access Control**: Only authenticated guests can access the ordering interface
- **Session Management**: Password validation handled locally for security

### Ordering Workflow

The module implements a guided 5-step ordering process:

1. **Drink Selection** - Browse categories and select desired drink
2. **Customization** - Configure drink options (shots, milk, temperature, etc.)
3. **Guest Information** - Enter name and optional special requests
4. **Order Review** - Confirm all details before submission
5. **Confirmation** - Display success message with queue information

## New Feature: Special Requests

### Purpose

Enable guests to communicate custom instructions or preferences not covered by standard drink customization options.

### Implementation Details

**Form Field Specifications:**
- **Field Type**: Textarea (multi-line text input)
- **Label**: "Special Request (Optional)"
- **Placeholder**: "Any special instructions for your order..."
- **Character Limit**: 500 characters maximum
- **Validation**: Optional field, trimmed before submission
- **Accessibility**: Proper ARIA labeling and keyboard navigation

**User Experience:**
- Located in Step 3 (Guest Information) alongside name input
- Real-time character count (when approaching limit)
- Clear help text explaining purpose and examples
- Responsive design for mobile and desktop

**Data Handling:**
- Empty strings converted to null for database storage
- Input sanitized to prevent XSS attacks
- Included in order review and confirmation displays
- Visible to baristas in order management interface

### Use Cases

**Dietary Restrictions:**
- "Please use oat milk - I'm lactose intolerant"
- "No sugar substitutes please - diabetic"
- "Allergy to nuts - please ensure clean equipment"

**Preparation Preferences:**
- "Extra hot please"
- "Light foam on the cappuccino"
- "Make it extra strong"
- "Decaf only - pregnant"

**Timing and Service:**
- "I'll pick up in 20 minutes"
- "Please hold - I'm running late"
- "For here, not takeaway"

**Accessibility Needs:**
- "Please call my name loudly - hearing impaired"
- "Large cup handle needed - limited mobility"

## Technical Architecture

### Components

**Primary Components:**
- `GuestModule.tsx` - Main ordering page with step navigation
- `GuestInfoForm.tsx` - Name and special request input form
- `OrderSummary.tsx` - Review page showing all order details
- `OrderSuccess.tsx` - Confirmation page with queue information

**Supporting Components:**
- `DrinkCategoryTabs.tsx` - Category navigation
- `DrinkGrid.tsx` - Drink selection interface
- `DrinkOptionsForm.tsx` - Customization options
- `OrderActions.tsx` - Submit and cancel buttons

### State Management

**useOrderForm Hook:**
- Manages multi-step form progression
- Handles drink selection and customization
- Stores guest information including special requests
- Orchestrates order submission process
- Provides validation and error handling

**Form State Structure:**
```typescript
interface OrderFormState {
  selectedDrink: DrinkWithOptionsAndCategory | null
  optionSelection: {
    selectedOptions: Record<string, string>
    validationErrors: string[]
  }
  guestInfo: {
    guestName: string
    specialRequest: string  // New field
    isValid: boolean
  }
  currentStep: OrderStep
  orderSubmission: {
    isSubmitting: boolean
    result: OrderResult | null
    error: Error | null
  }
}
```

### Data Integration

**Database Schema:**
- `orders.special_request` field (TEXT, nullable)
- Included in `orders_with_details` view
- No additional indexing required

**API Integration:**
- Order creation endpoint enhanced with special_request parameter
- Order retrieval includes special request data
- Barista dashboard displays special requests prominently

## User Interface Specifications

### Design System

**Visual Hierarchy:**
- Special request field integrated naturally into guest info step
- Consistent styling with existing form elements
- Proper spacing and typography alignment

**Color Scheme:**
- Primary: Coffee-inspired brown tones (#8B4513, #D2B48C)
- Secondary: Warm accent colors
- Success: Green for confirmations
- Warning: Amber for special requests display
- Error: Red for validation issues

**Responsive Breakpoints:**
- Mobile: 320px - 768px
- Tablet: 769px - 1024px
- Desktop: 1025px+

### Accessibility Compliance

**WCAG 2.1 AA Standards:**
- Semantic HTML structure with proper headings
- Keyboard navigation support throughout
- Screen reader compatibility with ARIA labels
- Color contrast ratios meet accessibility standards
- Focus indicators clearly visible

**Form Accessibility:**
- Labels associated with form controls
- Required fields properly marked
- Error messages announced by screen readers
- Tab order follows logical progression

## Validation and Error Handling

### Input Validation

**Name Field:**
- Required field validation
- Minimum 2 characters
- Maximum 50 characters
- Alphanumeric and common punctuation allowed

**Special Request Field:**
- Optional field (no required validation)
- Maximum 500 characters
- HTML injection prevention
- Profanity filtering (if implemented)

### Error Scenarios

**Network Errors:**
- Connection timeout handling
- Graceful degradation with retry options
- Clear user messaging for network issues

**Validation Errors:**
- Real-time validation feedback
- Clear, actionable error messages
- Prevention of form submission until resolved

**Server Errors:**
- Database connection failures
- Order creation failures
- Fallback to manual barista ordering

## Performance Specifications

### Loading Performance

**Initial Load:**
- Page renders under 2 seconds on 3G connection
- Progressive enhancement for slow connections
- Critical CSS inlined for faster rendering

**Form Interactions:**
- Real-time validation with minimal lag
- Smooth transitions between steps
- Optimistic UI updates where possible

### Data Efficiency

**API Calls:**
- Minimal requests for order submission
- Efficient caching of menu data
- Debounced validation requests

## Security Considerations

### Input Security

**XSS Prevention:**
- Special request content properly escaped
- HTML sanitization on both client and server
- Content Security Policy headers

**Data Privacy:**
- Minimal personal information collection
- Special requests stored only for order fulfillment
- No persistent tracking or analytics

### Authentication Security

**Password Handling:**
- Passwords validated locally without transmission
- No password storage in browser
- Session timeout for security

## Testing Requirements

### Unit Testing

**Component Tests:**
- Guest info form with special request input
- Order summary display of special requests
- Form validation logic
- State management functions

**Integration Tests:**
- Complete ordering workflow
- Database integration
- API endpoint testing

### Accessibility Testing

**Automated Testing:**
- Axe-core accessibility tests
- Lighthouse accessibility scoring
- Color contrast validation

**Manual Testing:**
- Screen reader navigation testing
- Keyboard-only interaction testing
- Voice control compatibility

### End-to-End Testing

**User Journey Tests:**
- Complete order with special request
- Order without special request
- Form validation and error handling
- Mobile device compatibility

## Deployment and Monitoring

### Performance Monitoring

**Key Metrics:**
- Order completion rate
- Special request usage rate
- Form abandonment points
- Error occurrence frequency

**User Experience Metrics:**
- Time to complete order
- Mobile vs desktop usage patterns
- Accessibility feature usage

### Error Monitoring

**Client-Side Errors:**
- JavaScript errors and stack traces
- Form validation failures
- Network connectivity issues

**Server-Side Monitoring:**
- Order creation success rate
- Database performance metrics
- API response times

## Future Enhancements

### Short-Term Improvements

**Usability Enhancements:**
- Autosave draft orders
- Quick-select common special requests
- Order history for repeat customers

**Technical Improvements:**
- Progressive Web App capabilities
- Offline order queuing
- Enhanced error recovery

### Long-Term Features

**Advanced Functionality:**
- Rich text formatting for special requests
- Photo attachments for complex requests
- Two-way communication with baristas
- Predictive text for common requests

**Integration Opportunities:**
- Integration with loyalty programs
- Payment processing capabilities
- Inventory-based menu updates
- Multi-language support

## Maintenance Guidelines

### Content Management

**Regular Reviews:**
- Monitor special request content for trends
- Update help text and examples based on usage
- Review and update validation rules as needed

**User Feedback Integration:**
- Regular usability testing sessions
- Feedback collection and analysis
- Iterative improvements based on user behavior

### Technical Maintenance

**Code Quality:**
- Regular code reviews and refactoring
- Performance optimization reviews
- Security vulnerability assessments
- Dependency updates and maintenance

**Documentation Updates:**
- Keep user guides current with feature changes
- Update technical documentation for new team members
- Maintain API documentation accuracy