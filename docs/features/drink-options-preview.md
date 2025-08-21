# Drink Options Preview Feature

## Overview

The Drink Options Preview feature enhances the barista admin module's menu management interface by displaying enabled options and their default values directly on drink cards. This provides a quick overview of drink configurations without requiring navigation into detailed views.

## Features

- **Options Visibility**: Shows enabled options and their default values on drink cards
- **Toggle Control**: Easy on/off switch for options preview display
- **Responsive Design**: Adapts to both grid and list view layouts
- **Truncation Logic**: Displays most important options with "+X more" indicator
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Accessibility**: Full WCAG compliance with proper ARIA attributes

## Components

### DrinkOptionsPreview

A reusable component that displays drink options in a compact, readable format.

**Props:**

- `options`: Array of drink option configurations
- `variant`: Display variant ('grid' | 'list')
- `maxDisplay`: Maximum number of options to show before truncation (default: 3)
- `className`: Additional CSS classes

**Variants:**

- **Grid**: Vertical layout with option-value pairs aligned
- **List**: Horizontal layout with pill-style option badges

### ToggleSwitch

A reusable toggle component with accessibility features.

**Props:**

- `checked`: Current toggle state
- `onChange`: Change handler function
- `label`: Accessible label text
- `size`: Size variant ('sm' | 'md' | 'lg')
- `disabled`: Disabled state
- `id`: Unique identifier

## Usage Examples

### Basic Implementation

```tsx
import { DrinkOptionsPreview } from '@/components/menu/DrinkOptionsPreview'

// In your drink card component
<DrinkOptionsPreview 
  options={drink.options} 
  variant="grid"
  maxDisplay={3}
/>
```

### With Toggle Control

```tsx
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'

// In your management interface
const [showOptionsPreview, setShowOptionsPreview] = useState(false)

<ToggleSwitch
  checked={showOptionsPreview}
  onChange={setShowOptionsPreview}
  label="Show Options Preview"
  size="md"
/>
```

### Integration with Menu Management

```tsx
import { DrinkManagement } from '@/components/menu/DrinkManagement'

// Component handles options preview toggle internally
<DrinkManagement />
```

## Data Structure

### DrinkOptionPreview Interface

```typescript
interface DrinkOptionPreview {
  id: string
  option_category_name: string
  default_value_name: string | null
}
```

### DrinkWithOptionsPreview Interface

```typescript
interface DrinkWithOptionsPreview extends Drink {
  options: DrinkOptionPreview[]
}
```

## Database Integration

The feature utilizes enhanced data queries that join multiple tables:

- `drinks` - Base drink information
- `drink_options` - Drink-option relationships
- `option_categories` - Option category details  
- `option_values` - Option value details

### Service Methods

- `getAllWithOptionsPreview()` - Fetches all drinks with options
- `getByCategoryWithOptionsPreview(categoryId)` - Fetches category drinks with options

## Error Handling

The feature includes comprehensive error handling:

- **Loading States**: Skeleton components during data fetching
- **Error Messages**: User-friendly error display with retry options
- **Fallback Content**: Graceful degradation when options unavailable
- **Type Safety**: Full TypeScript coverage preventing runtime errors

## Performance Considerations

- **Memoization**: Components use React.memo for optimization
- **Selective Rendering**: Only renders options when toggle is enabled
- **Efficient Queries**: Database queries optimized with proper joins
- **Lazy Loading**: Data fetched only when needed

## Accessibility Features

### WCAG Compliance

- **Keyboard Navigation**: Full keyboard accessibility for all controls
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order and focus indicators
- **Color Independence**: Information conveyed beyond color alone

### ARIA Attributes

- `role="list"` and `role="listitem"` for options containers
- `aria-label` descriptors for option counts and states
- `aria-checked` for toggle switch states
- `aria-describedby` for additional context

## Testing

The feature includes comprehensive test coverage:

- **Unit Tests**: Component behavior and prop handling
- **Integration Tests**: Data flow and state management
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Error Scenarios**: Error states and boundary conditions

### Test Files

- `DrinkOptionsPreview.test.tsx` - Component unit tests
- `ToggleSwitch.test.tsx` - Toggle component tests
- `DrinkManagement.test.tsx` - Integration tests
- `menuService.test.ts` - Data service tests

## Browser Support

- Modern browsers with ES2020+ support
- React 19+ compatible
- CSS Grid and Flexbox support required
- Touch and pointer event support

## Configuration

### Environment Variables

No additional environment variables required.

### Feature Flags

Toggle functionality built into component - no external feature flags needed.

### Customization

Components accept className props for styling customization.

## Troubleshooting

### Common Issues

1. **Options not displaying**
   - Verify drink has associated options in database
   - Check toggle switch is enabled
   - Confirm proper data relationships

2. **Layout issues**
   - Ensure parent container has proper CSS display properties
   - Check for conflicting Tailwind classes
   - Verify responsive breakpoints

3. **Performance concerns**
   - Monitor database query performance with large datasets
   - Consider pagination for extensive option lists
   - Use React DevTools to identify re-render issues

### Debug Tools

- React DevTools for component state inspection
- Network tab for API request monitoring  
- Console logging available in development builds

## Migration Guide

### From Previous Version

No migration required - feature is additive and backward compatible.

### Database Requirements

Ensure proper foreign key relationships exist between:

- `drinks` → `drink_options`
- `drink_options` → `option_categories`  
- `drink_options` → `option_values`

## Future Enhancements

- **Bulk Operations**: Toggle options preview for multiple drinks
- **Custom Layouts**: Additional display variants beyond grid/list
- **Filtering**: Filter drinks by specific option configurations
- **Export**: Export drink configurations with options data
- **Analytics**: Track most common option combinations

## Support

For issues or questions regarding the Drink Options Preview feature:

1. Check this documentation first
2. Review test files for usage examples
3. Examine component source code in `/src/components/menu/`
4. Check integration in `/src/components/menu/DrinkManagement.tsx`

## Version History

- **v1.0.0** - Initial implementation with basic options preview
- **v1.1.0** - Added toggle control and error handling  
- **v1.2.0** - Enhanced styling and accessibility features

