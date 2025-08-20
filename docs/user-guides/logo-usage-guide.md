# Logo Usage Guide

This guide provides comprehensive documentation for using the "Uy, Kape!" logo throughout the application.

## Overview

The logo integration follows a hybrid approach that combines the official logo with text for optimal brand recognition while maintaining readability and professional appearance across all screen sizes and contexts.

## Logo Component API

### Basic Usage

```typescript
import { Logo } from '@/components/ui/Logo'

// Basic logo with default settings
<Logo size="md" />

// Logo with custom alt text and styling
<Logo 
  size="lg" 
  alt="Uy, Kape! Coffee Shop" 
  className="mx-auto opacity-80"
/>

// Clickable logo
<Logo 
  size="md" 
  onClick={() => navigate('/')}
  clickable
/>
```

### Size Variants

The Logo component supports six size variants optimized for different contexts:

| Size | Dimensions | Best Used For | Responsive Classes |
|------|------------|---------------|-------------------|
| `xs` | 24px | Navigation icons, small UI elements | `w-5 h-5 sm:w-6 sm:h-6` |
| `sm` | 32px | Mobile navigation, compact headers | `w-6 h-6 sm:w-8 sm:h-8` |
| `md` | 48px | Card headers, form headers | `w-10 h-10 sm:w-12 sm:h-12` |
| `lg` | 64px | Page headers, section titles | `w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16` |
| `xl` | 96px | Welcome sections, main headers | `w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24` |
| `hero` | 256px | Landing pages, promotional areas | `w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48` |

### Props Interface

```typescript
interface LogoProps {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  variant?: 'default' | 'white' | 'dark' // Future enhancement
  className?: string
  alt?: string
  onClick?: () => void
  clickable?: boolean
}
```

## Usage Patterns

### Logo + Text Combinations

For maximum brand recognition, use logo + text combinations in key areas:

#### Welcome Page Header
```typescript
<div className="flex items-center justify-center mb-6">
  <Logo 
    size="xl" 
    className="mr-3" 
    alt="Uy, Kape! Logo"
  />
  <h1 className="text-4xl font-bold text-coffee-800">
    Uy, Kape! ☕
  </h1>
</div>
```

#### Navigation Header
```typescript
<Link to="/" className="flex items-center">
  <Logo size="sm" className="mr-2" alt="Uy, Kape! Logo" />
  <h1 className="text-xl font-bold">Uy, Kape! ☕</h1>
</Link>
```

#### Page Headers
```typescript
<div className="flex items-center mb-6">
  <Logo size="md" className="mr-3" />
  <h2 className="text-2xl font-bold text-coffee-800">
    Menu Management
  </h2>
</div>
```

### Logo-Only Usage

Use logo-only in space-constrained contexts or decorative elements:

#### Loading States
```typescript
<div className="flex flex-col items-center justify-center">
  <Logo 
    size="md" 
    className="animate-pulse opacity-60" 
    alt=""  // Empty alt for decorative use
  />
  <p className="text-coffee-600 text-sm font-medium animate-pulse">
    Loading...
  </p>
</div>
```

#### Empty States
```typescript
<div className="text-center py-12">
  <Logo 
    size="lg" 
    className="mx-auto opacity-60 mb-4" 
    alt=""  // Decorative logo
  />
  <h3 className="text-lg font-semibold text-coffee-800">
    No items yet
  </h3>
</div>
```

## Asset Management

### Logo Files Structure

```
src/assets/logos/
├── logo-24.png    # xs size (24px)
├── logo-32.png    # sm size (32px)
├── logo-48.png    # md size (48px)
├── logo-64.png    # lg size (64px)
├── logo-96.png    # xl size (96px)
└── logo-256.png   # hero size (256px)

public/
├── favicon.ico           # Browser favicon
├── favicon-16x16.png    # 16px favicon
├── favicon-32x32.png    # 32px favicon
├── apple-touch-icon.png # 180px iOS icon
├── logo-192.png         # 192px PWA icon
└── logo-512.png         # 512px PWA icon
```

### Asset Optimization

All logo assets are optimized for:
- **Performance**: Appropriate file sizes for each use case
- **Quality**: Sharp rendering at all sizes
- **Accessibility**: Proper contrast and visibility
- **Caching**: Efficient browser caching strategies

## Accessibility Guidelines

### Alt Text Standards

1. **Functional Logos** (navigation, links): Use descriptive alt text
   ```typescript
   <Logo size="sm" alt="Uy, Kape! - Return to homepage" />
   ```

2. **Decorative Logos** (loading, empty states): Use empty alt text
   ```typescript
   <Logo size="md" alt="" />
   ```

3. **Contextual Logos** (page headers): Include context
   ```typescript
   <Logo size="lg" alt="Uy, Kape! Coffee Shop" />
   ```

### Keyboard Navigation

Clickable logos support keyboard navigation:

```typescript
<Logo 
  size="md" 
  clickable 
  onClick={() => navigate('/')}
  // Automatically includes:
  // - tabIndex={0}
  // - role="button"
  // - onKeyDown handler for Enter/Space
/>
```

## Responsive Design Guidelines

### Breakpoint Considerations

1. **Mobile (< 640px)**: Use smaller sizes (xs, sm) in navigation
2. **Tablet (640px - 1024px)**: Balanced sizing (sm, md, lg)
3. **Desktop (> 1024px)**: Full-size presentation (lg, xl, hero)

### Layout Adaptations

#### Responsive Header Example
```typescript
<div className="flex flex-col sm:flex-row items-center justify-center">
  <Logo 
    size="xl" 
    className="mb-2 sm:mb-0 sm:mr-3" 
  />
  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left">
    Uy, Kape! ☕
  </h1>
</div>
```

## Performance Best Practices

### Preloading Strategy

Critical logos are automatically preloaded:

```typescript
// Most commonly used sizes are preloaded
const criticalAssets = [logo32, logo64, logo96]
```

### Lazy Loading

Non-critical logos use lazy loading attributes:

```typescript
<img 
  loading="lazy"
  decoding="async"
  fetchPriority="auto"
  // ... other attributes
/>
```

### Caching Optimization

- **Browser Caching**: Long-term caching for logo assets
- **CDN Distribution**: Optimized delivery from edge locations
- **Image Compression**: Balanced quality and file size

## Brand Guidelines

### Visual Consistency

1. **Spacing**: Maintain consistent spacing around logos
2. **Alignment**: Proper vertical and horizontal alignment
3. **Proportions**: Respect aspect ratios across all sizes
4. **Context**: Appropriate size selection for each use case

### Color Integration

The logo integrates with the application's coffee-themed color palette:

```css
/* Brand colors extracted from logo */
coffee-50: #f9f7f4   /* Light backgrounds */
coffee-100: #f0ebe3  /* Cream tones */
coffee-600: #8b5a3c  /* Medium brown for text */
coffee-800: #4a2c1a  /* Dark brown for headers */
coffee-900: #2d1810  /* Deepest brown for emphasis */
```

## Troubleshooting

### Common Issues

1. **Logo not displaying**: Check asset path and size configuration
2. **Blurry appearance**: Ensure appropriate size variant for context
3. **Accessibility warnings**: Verify alt text appropriateness
4. **Performance issues**: Review preloading and lazy loading settings

### Debug Tips

```typescript
// Enable logo debugging in development
const isDebugMode = import.meta.env.DEV
console.log('Logo config:', { size, src, className })
```

## Testing Guidelines

### Visual Testing Checklist

- [ ] Logo displays clearly at all breakpoints
- [ ] Proper spacing and alignment maintained
- [ ] Text + logo combinations are readable
- [ ] Loading states function properly
- [ ] Accessibility features work correctly

### Automated Testing

```typescript
// Example test patterns
describe('Logo Component', () => {
  it('renders with correct size classes', () => {
    render(<Logo size="lg" />)
    expect(screen.getByRole('img')).toHaveClass('w-12', 'h-12')
  })
  
  it('supports accessibility features', () => {
    render(<Logo size="md" alt="Company logo" />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Company logo')
  })
})
```

---

## Version History

- **v1.0** (2025-08-20): Initial logo integration with hybrid approach
- **Future**: Planned dark/light mode variants and animated versions