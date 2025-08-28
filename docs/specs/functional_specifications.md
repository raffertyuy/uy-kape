---
description: 'Detailed functional specifications for the Uy, Kape! coffee ordering system'
last-modified: 2025-08-28
---

# ☕ Uy, Kape! Functional Specifications

## Table of Contents

- [System Overview](#system-overview)
- [Guest Module Specifications](#guest-module-specifications)
- [Barista Admin Module Specifications](#barista-admin-module-specifications)
- [Technical Implementation](#technical-implementation)
- [User Experience Features](#user-experience-features)
- [Security and Access Control](#security-and-access-control)

## System Overview

Uy, Kape! is a dual-module coffee ordering system designed for home environments, providing a seamless experience for guests to place orders and administrators to manage the coffee menu and order queue.

### Core Architecture
- **Frontend**: React + TypeScript with Tailwind CSS
- **Backend**: Supabase (PostgreSQL database with real-time subscriptions)
- **Authentication**: Password-based access control
- **Theme**: Light theme only (no dark mode)
- **Responsive**: Mobile-first responsive design

## Guest Module Specifications

### [Access Control](#guest-access-control)

**Password Protection**
- Configurable password protection at `/order` entry point
- **Environment Variable Control**: `VITE_GUEST_BYPASS_PASSWORD`
  - When `true`: Password screen is bypassed for direct access
  - When `false` or undefined: Password protection is enforced (default behavior)
- Password-protected entry when bypass is disabled
- Session persistence using `sessionStorage`
- Automatic redirect to ordering interface upon successful authentication
- **Security Note**: Bypass feature intended for development, testing, and demo environments

### [Ordering Workflow](#guest-ordering-workflow)

The guest ordering process follows a 4-step wizard with progress indicator:

#### Step 1: Drink Selection (25% progress)
- **Category-based Navigation**: Tabbed interface with drink categories
  - All Drinks (default view)
  - Coffee (9 drinks)
  - Special Coffee (3 drinks) 
  - Tea (1 drink)
  - Kids Drinks (4 drinks)
- **Drink Cards**: Each drink displays:
  - Name and description
  - Category badge
  - Available customization options preview
  - "Tap to select" call-to-action
- **Total Menu**: 17 drinks across 4 categories
- **Selection**: Single drink selection required to proceed

#### Step 2: Drink Customization (50% progress)
- **Dynamic Options Form**: Based on selected drink's available options
- **Option Types**:
  - **Required Options**: Must be selected (e.g., Number of Shots, Milk Type)
  - **Optional Options**: Can be skipped (e.g., Temperature)
- **Option Formats**:
  - Radio button groups for single selection
  - Visual indicators for selected options
  - Help text for each option category
- **Common Options**:
  - Number of Shots: Single/Double
  - Milk Type: None/Low Fat Milk/Oatmilk (varies by drink)
  - Temperature: Hot/Cold
  - Ice Cream Flavor: None/Chocolate (for special drinks like Affogato)
  - Tea Type: Jasmine Green Tea/Other varieties (for tea beverages)

#### Step 3: Guest Information (75% progress)
- **Name Input**:
  - Auto-generates funny coffee-themed names by default
  - Examples: "Mega Mug Steamer", "Professor Mocha Burner", "The Cup Steamer"
  - Users can override by typing their own name
  - Character limit: 50 characters with counter
  - Required field with validation
- **Special Request**:
  - Optional text area for custom requests
  - Character limit: 500 characters with remaining counter
  - Placeholder text guides users on dietary requirements
  - Examples: "Extra hot please", "No foam"

#### Step 4: Order Review (100% progress)
- **Order Summary Display**:
  - Customer name with icon
  - Selected drink name and description
  - All customization choices clearly listed
  - Order status: "Ready to Submit"
- **Actions Available**:
  - Submit Order (primary action)
  - Previous (navigate back to modify)
  - Reset (start over completely)

### [Order Confirmation](#guest-order-confirmation)

**Confirmation Screen Features**:
- **Success Message**: Personalized thank you with customer name
- **Order Details**:
  - Unique Order ID (8-character hex: e.g., #1DEFF2F7)
  - Queue Number (position in line: e.g., "1")
  - Estimated Wait Time (calculated: e.g., "4 minutes")
- **Barista Motivation**: Random coffee-themed quotes from barista
  - Example: "Wonder Bean's secret power? Perfect patience - and really strong coffee."
- **Next Steps Instructions**:
  - Clear list of what happens next
- **Post-Order Actions**:
  - Cancel This Order (removes from queue)
  - Place Another Order (restart process)

### [User Experience Enhancements](#guest-ux-features)

**Funny Name Generation**
- Automatic generation of coffee-themed names
- Pattern: [Title] [Coffee-term] [Action/Object]
- Encourages engagement while maintaining anonymity option

**Progress Tracking**
- Visual progress bar (25%, 50%, 75%, 100%)
- Step indicators showing current position
- Clear navigation between steps

**Validation and Feedback**
- Real-time form validation
- Character count indicators
- Clear error messages
- Success confirmations

## Barista Admin Module Specifications

### [Access Control](#admin-access-control)

**Password Protection**
- Password-protected entry point at `/admin`
- Session persistence using `sessionStorage`
- Automatic redirect to admin dashboard upon successful authentication

### [Dashboard Overview](#admin-dashboard)

**Main Dashboard Features**:
- **System Status Indicators**:
  - Menu System: Active ✓
  - Order System: Active ✓
  - Real-time Updates: Active 🔄
- **Module Access Cards**:
  - Order Management (with availability status)
  - Menu Management (with availability status)
- **Navigation**: Persistent navigation bar with module switching

### [Order Management Module](#admin-order-management)

#### Real-time Order Dashboard
- **Connection Status**: Real-time connectivity indicator
- **Order Statistics**:
  - Pending orders count with ⏳ icon
  - Completed orders count with 🎉 icon  
  - Total orders count with 📊 icon
- **Live Updates**: Automatic refresh of order status changes

#### Order Display and Management
- **Order Cards**: Each order shows:
  - Customer name as heading
  - Unique order ID (8-character hex)
  - Order status with color coding and icons (⏳ Pending, 🎉 Completed, ❌ Cancelled)
  - Priority level with visual indicators:
    - Normal Priority (no icon)
    - High Priority ⚡
    - Urgent 🚨
  - Selected drink name and category
  - All customization options clearly listed
  - Special requests (when provided) with quotes
  - Queue position with 🏃‍♂️ icon
  - Order timestamp with elapsed time display (e.g., "51m ago")
  - Estimated completion time
- **Order Selection**: Checkbox selection for bulk operations

#### Order Actions
- **Individual Order Actions**:
  - Complete: Mark order as completed
  - Cancel: Cancel individual order
- **Bulk Actions**:
  - Selective Bulk Updates: Select 3 out of 5 pending orders to cancel
  - Clear All Pending: Remove all pending orders
  - Refresh: Manual refresh of order list
- **Order Selection**: Checkbox selection for bulk operations

#### Filtering and Search
- **Search**: Text search by guest name or order ID
- **Status Filter**: Dropdown filter (All Orders, Pending, Completed, Cancelled)
- **Show Completed Toggle**: Hide/show completed orders
- **Real-time Filtering**: Instant results as you type

#### Queue Management

- **Automatic Queue Positioning**: Orders automatically assigned queue numbers
- **Queue Position Display**: Clear indication of each order's position
- **Dynamic Wait Time Calculation**: Estimated wait times calculated based on preparation times of drinks in orders ahead in queue
  - **Individual Drink Preparation Times**: Each drink has specific preparation time (e.g., Espresso: 3min, Ice-Blended Coffee: 15min, Milo: 0min)
  - **Cumulative Wait Calculation**: Sum of preparation times for all orders ahead in queue
  - **Fallback Support**: Uses configured wait time per order for drinks without specific preparation times
  - **Real-time Updates**: Wait times automatically recalculate when orders are completed or cancelled

#### Dynamic Wait Time Examples

Consider a queue with the following orders ahead:

1. **Espresso** (3 minutes preparation) → Guest sees: "3 min"
2. **Ice-Blended Coffee** (15 minutes preparation) → Guest sees: "15 min"
3. **Milo** (0 minutes preparation) → Guest sees: "15 min" (no additional wait)
4. **Cappuccino** (no specific time) → Guest sees: "15 min + fallback time" (e.g., 20 min total)

### [Menu Management Module](#admin-menu-management)

#### Three-Tab Interface
1. **Drink Categories** (4 total)
2. **Drinks** (17 total)  
3. **Option Categories** (5 total)

#### Drink Categories Management
- **Category Display**: Shows all 4 categories:
  - Coffee: "Espresso-based and black coffee drinks"
  - Special Coffee: "Premium coffee drinks with unique ingredients"
  - Tea: "Hot and cold tea beverages"
  - Kids Drinks: "Drinks from my child's stash!"
- **Category Information**:
  - Name and description
  - Active/Inactive status
  - Display order number
  - Creation date
- **Actions**: Edit, Delete, Add New Category

#### Drinks Management

- **Comprehensive Drink List**: All 17 drinks with:
  - Name and description
  - Category assignment
  - Active/Inactive status
  - Display order within category
  - **Preparation Time**: Individual preparation times for dynamic wait calculation
    - Optional field (drinks default to no specific preparation time)
    - Displays as "Prep: Xmin" when set (e.g., "Prep: 3min", "Prep: 15min")
    - Uses fallback wait time when no specific preparation time is set
- **View Options**:
  - Grid view (default)
  - List view toggle
  - **Options Preview Toggle**: Shows customization options with default values on cards
    - Example: "Number of Shots: Single", "Milk Type: Low Fat Milk", "Temperature: Hot"
    - Displays drink-specific defaults like "Tea Type: Jasmine Green Tea", "Ice Cream Flavor: Chocolate"
- **Filtering and Search**:
  - Category filter dropdown
  - Text search by drink name
  - Real-time filtering
- **Actions Per Drink**:
  - Options: Manage drink-specific customization options
  - Edit: Modify drink details and preparation time
  - Delete: Remove drink from menu
- **Add New**: Create new drinks with category assignment and optional preparation time

#### Option Categories Management
- **Option Categories**: 5 categories managing customization:
  - **Number of Shots** (Required): "Espresso shot quantity"
  - **Milk Type** (Required): "Type of milk for coffee drinks"
  - **Tea Type** (Required): "Variety of tea"  
  - **Temperature** (Optional): "Hot or cold serving"
  - **Ice Cream Flavor** (Optional): "Ice cream flavor"
- **Option Information**:
  - Name and description
  - Required/Optional status
  - Display order
  - Creation date
- **Actions**:
  - Manage Values: Configure available options (e.g., Single/Double for shots)
  - Edit: Modify option category details
  - Delete: Remove option category
  - Add New: Create new option categories

#### URL Persistence and State Management

- **Tab Persistence**: Menu Management tabs (Drink Categories, Drinks, Option Categories) persist in URL parameters
  - Default tab (Drink Categories): `/admin?view=menu` (no tab parameter)
  - Drinks tab: `/admin?view=menu&tab=drinks`
  - Option Categories tab: `/admin?view=menu&tab=options`
  - Browser refresh maintains current tab selection
- **Filter Persistence**: Drinks tab filters persist across browser sessions
  - Category filter: `/admin?view=menu&tab=drinks&categoryId=3e89158e-0319-42bc-8d01-7193ffd649a0`
  - Active status filter: `/admin?view=menu&tab=drinks&isActive=true`
  - Sort preferences: `/admin?view=menu&tab=drinks&sortBy=name&sortOrder=asc`
- **Search Query Persistence**: Search queries persist in URL parameters
  - Search example: `/admin?view=menu&tab=drinks&search=coffee`
  - Search queries persist across tab switches and browser refresh
- **Parameter Cleanup**: Tab-specific parameters are automatically cleaned when switching tabs
  - Switching from Drinks tab removes category filter parameters
  - Invalid parameters gracefully default to safe values
- **Deep Linking**: Direct navigation to specific tab and filter combinations
  - Shareable URLs for specific menu management views
  - Bookmarkable states for frequently accessed filters
- **User Experience Benefits**:
  - No loss of navigation state on browser refresh
  - Improved workflow efficiency for baristas
  - Reduced frustration from losing applied filters
  - Enhanced multi-tab browsing support

## Technical Implementation

### [State Management](#technical-state)
- **Order Form State**: Multi-step form with persistent state
- **Real-time Subscriptions**: Supabase real-time for order updates
- **Session Management**: Browser sessionStorage for authentication persistence
- **URL State Persistence**: React Router useSearchParams for navigation state
  - Menu Management tab and filter state persisted in URL parameters
  - Deep linking support for specific admin module views
  - Automatic cleanup of tab-specific parameters during navigation

### [Data Flow](#technical-data-flow)
1. **Guest Order**: Form → Validation → Supabase Insert → Real-time Update
2. **Admin Updates**: Action → Supabase Update → Real-time Broadcast → UI Update
3. **Menu Changes**: Admin Form → Validation → Supabase Update → Menu Refresh

### [Database Schema](#technical-database)

- **drinks**: Menu items with options configuration and preparation times
  - **preparation_time_minutes**: Optional INTEGER field for individual drink preparation times
  - Enables dynamic wait time calculation based on actual preparation requirements
  - NULL values indicate drinks use fallback wait time
- **orders**: Order records with status tracking and queue positioning
- **drink_categories**: Category organization
- **option_categories**: Customization option definitions

## User Experience Features

### [Responsive Design](#ux-responsive)
- **Mobile-first**: Optimized for mobile devices
- **Progressive Enhancement**: Enhanced experience on larger screens
- **Touch-friendly**: Large tap targets and intuitive gestures

### [Accessibility](#ux-accessibility)
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles
- **High Contrast**: Clear visual hierarchy and contrast ratios
- **Focus Management**: Logical tab order and focus indicators

### [Performance](#ux-performance)
- **Fast Loading**: Optimized bundle sizes and lazy loading
- **Real-time Updates**: Minimal latency for order status changes
- **Offline Resilience**: Graceful handling of connection issues

## Security and Access Control

### [Authentication](#security-auth)
- **Password-based Access**: Separate passwords for guest and admin roles
- **Configurable Guest Access**: Guest password protection can be bypassed via environment variable
  - `VITE_GUEST_BYPASS_PASSWORD=true`: Bypasses guest password protection
  - `VITE_GUEST_BYPASS_PASSWORD=false` or undefined: Enforces password protection (default)
  - Admin password protection is always enforced regardless of bypass setting
- **Session Management**: Secure session handling with automatic expiry
- **Role Separation**: Clear separation between guest and admin capabilities

### [Data Protection](#security-data)
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: Sanitized user inputs
- **Rate Limiting**: Protection against spam and abuse

### [Configuration Security](#security-config)
- **Environment Variables**: Sensitive configuration via environment variables
- **Guest Password Bypass Configuration**:
  - `VITE_GUEST_BYPASS_PASSWORD` environment variable for development and testing
  - Default behavior maintains security (password protection enabled)
  - Bypass feature documented with security considerations
- **Default Fallbacks**: Secure defaults when environment variables not set
- **Password Requirements**: Encouragement of strong passwords in documentation

---

*This document reflects the current implementation as of August 28, 2025, updated to include Menu Management URL persistence functionality and configurable guest password bypass. All features documented have been verified as working in the live application. For the latest updates, refer to the application overview and technical documentation.*
