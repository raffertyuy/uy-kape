---
description: "Technical documentation for the guest special request feature"
created-date: 2025-08-21
last-modified: 2025-08-21
---

# Guest Special Request Feature

## Overview

The Guest Special Request feature allows customers to add optional custom instructions or preferences to their coffee orders. This feature enhances the ordering experience by enabling guests to communicate special dietary requirements, preparation preferences, or other customizations directly to the barista.

## Feature Details

### Purpose

- Enable guests to communicate special instructions for their orders
- Improve customer satisfaction by accommodating unique preferences
- Provide baristas with clear context for order preparation
- Support dietary restrictions and accessibility needs

### User Experience

1. **Guest Journey**: During the order process, guests can optionally enter special requests in a dedicated text area
2. **Validation**: The feature includes input validation with a 500-character limit
3. **Review**: Special requests are displayed in the order review section before submission
4. **Confirmation**: Confirmed special requests appear in the order success message
5. **Accessibility**: Full keyboard navigation and screen reader support

### Barista Experience

- Special requests are prominently displayed in the order management interface
- Visual highlighting ensures requests are noticed during order preparation
- Clear formatting distinguishes special requests from standard order details

## Technical Implementation

### Database Schema

**Table**: `orders`

- **Field**: `special_request` (TEXT, nullable)
- **Purpose**: Store optional guest instructions for order preparation

### API Integration

**Order Creation Endpoint**: Enhanced to accept `special_request` parameter
**Order Retrieval**: Special requests included in all order data responses

### Frontend Components

1. **GuestInfoForm**: Text area input with proper labeling and validation
2. **OrderSummary**: Conditional display of special requests in review section
3. **OrderSuccess**: Special request confirmation in success message
4. **OrderCard**: Barista-facing display with visual highlighting

### Data Flow

```typescript
interface CreateOrderRequest {
  guest_name: string
  drink_id: string
  special_request?: string  // Optional field
  selected_options: Record<string, string>
}
```

## Accessibility Features

- **Semantic HTML**: Proper `<label>` and `<textarea>` association
- **ARIA Attributes**: `aria-describedby` for help text
- **Keyboard Navigation**: Full tab order support
- **Screen Reader**: Descriptive labels and help text
- **Visual Contrast**: Meets WCAG 2.1 AA standards

## Validation Rules

- **Optional Field**: Special requests are not required
- **Character Limit**: Maximum 500 characters
- **Sanitization**: Input is trimmed and sanitized before storage
- **Empty Handling**: Empty strings are converted to null in database

## Example Use Cases

1. **Dietary Restrictions**: "Please use oat milk - I'm lactose intolerant"
2. **Temperature Preference**: "Extra hot please"
3. **Strength Preference**: "Make it extra strong"
4. **Preparation Note**: "Light foam on the cappuccino"
5. **Timing Request**: "I'll pick up in 20 minutes"

## Error Handling

- **Network Errors**: Graceful failure with retry options
- **Validation Errors**: Clear user feedback for invalid input
- **Character Limit**: Real-time character count display
- **Server Errors**: Fallback messaging to contact barista directly

## Performance Considerations

- **Minimal Impact**: Feature adds negligible overhead to order processing
- **Database Indexing**: No additional indexes required for optional text field
- **Caching**: Special requests included in standard order caching strategy

## Security Measures

- **Input Sanitization**: XSS prevention through proper escaping
- **Character Limits**: Prevent abuse through reasonable constraints
- **No PII Storage**: Feature guidance discourages personal information

## Testing Coverage

### Unit Tests

- Form input validation and state management
- Component rendering with and without special requests
- Order creation service with special request parameter

### Integration Tests

- Complete order flow with special requests
- Database storage and retrieval verification
- API endpoint testing

### End-to-End Tests

- Full guest ordering journey with special requests
- Barista interface display verification
- Accessibility testing with screen readers

## Monitoring and Analytics

- **Usage Metrics**: Track adoption rate of special request feature
- **Content Analysis**: Monitor common request types for menu insights
- **Error Tracking**: Alert on validation or submission failures

## Future Enhancements

- **Predefined Options**: Quick-select common special requests
- **Rich Text Support**: Basic formatting for complex instructions
- **Barista Feedback**: Two-way communication for clarifications
- **Translation Support**: Multi-language special request handling

## Maintenance Considerations

- **Content Moderation**: Periodic review of special request content
- **Character Limit**: Monitor for needs to adjust length restrictions
- **UI Iterations**: Continuous improvement based on user feedback