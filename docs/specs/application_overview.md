---
description: 'Overview of this application'
last-modified: 2025-08-24
---

# ☕ Uy, Kape! Coffee Ordering System

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Core Modules](#core-modules)
- [Technology Stack](#technology-stack)
- [User Experience](#user-experience)
- [Detailed Specifications](#detailed-specifications)

## Project Overview

Uy, Kape! is a free coffee ordering system designed for home environments where guests can easily place coffee orders and administrators can manage the menu and order queue in real-time. The application emphasizes simplicity, modern design, and seamless user experience across both guest and administrator workflows.

**Key Characteristics:**
- Dual-module system (Guest + Admin)
- Password-protected access for security
- Real-time order management and updates
- Mobile-responsive design
- Light theme only (no dark mode)
- Free coffee ordering (no payment processing)

## System Architecture

### Application Structure
The system consists of two main access points from a welcome landing page:

1. **"Order Here"** → [Guest Module](#guest-module)
2. **"Barista Administration"** → [Barista Admin Module](#barista-admin-module)

### Technical Foundation
- **Frontend**: React + TypeScript with Tailwind CSS
- **Backend**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Password-based role separation
- **Deployment**: Vercel hosting with CI/CD

See detailed [technology_stack](./technology_stack.md) for complete technical specifications.

## Core Modules

### Guest Module

**Purpose**: Enable guests to browse the menu, customize their drinks, and place orders

**Key Features:**
- Password-protected access
- 4-step ordering wizard with visual progress tracking (25%, 50%, 75%, 100%)
- 17 drinks across 4 categories (Coffee: 9, Special Coffee: 3, Tea: 1, Kids Drinks: 4)
- Category-based browsing with tabbed interface
- Dynamic drink customization with required and optional options
- Funny auto-generated names (e.g., "Mega Mug Steamer") with override capability
- Special request field for dietary requirements and preferences
- Comprehensive order confirmation with Order ID, queue position, estimated wait time, and barista quotes

**User Journey**: Authentication → Drink Selection → Customization → Guest Info → Review → Confirmation

### Barista Admin Module

**Purpose**: Manage menu items, track orders, and control the ordering system

**Key Features:**
- Password-protected access
- Real-time order dashboard with live statistics and connectivity status
- Order management with priority levels (Normal, High Priority ⚡, Urgent 🚨)
- Individual order actions (Complete, Cancel) and bulk operations (Clear All Pending)
- Order filtering (All, Pending, Completed, Cancelled) and search functionality
- Comprehensive menu management across 3 tabs (Categories, Drinks, Option Categories)
- Advanced view options (Grid/List view, Show Options Preview, Show Completed toggle)
- System status monitoring (Menu System ✓, Order System ✓, Real-time Updates 🔄)

**Administrative Areas:**
- **Order Management**: Real-time order tracking with detailed order cards and statistics
- **Menu Management**: Complete control over drinks, categories, and customization options with enhanced filtering

## Technology Stack

**Core Technologies:**
- React 18 with TypeScript for type-safe development
- Tailwind CSS for responsive design system
- Supabase for backend services and real-time functionality
- Vite for fast development and optimized builds

**Key Libraries:**
- React Router for navigation
- Lucide React for consistent iconography
- Vitest for comprehensive testing
- Playwright for end-to-end testing

**Development Features:**
- ESLint for code quality
- TypeScript for type safety
- Real-time database subscriptions
- Mobile-first responsive design

## User Experience

### Design Principles
- **Simplicity**: Clean, intuitive interfaces for both guests and administrators
- **Speed**: Fast loading and responsive interactions
- **Clarity**: Clear visual hierarchy and obvious next actions
- **Accessibility**: Keyboard navigation, screen reader support, and high contrast

### Guest Experience Highlights
- Auto-generated funny coffee names for engagement
- Visual progress tracking through the ordering process
- Real-time validation and helpful error messages
- Clear order confirmation with actionable next steps

### Admin Experience Highlights
- Real-time order updates without manual refresh
- Comprehensive filtering and search capabilities
- Bulk operations for efficient order management
- Intuitive menu management with drag-and-drop organization

## Detailed Specifications

For comprehensive technical details, user workflows, and implementation specifications, see:

📋 **[Functional Specifications](./functional_specifications.md)**

This document includes:
- Complete user workflows and UI specifications
- Technical implementation details
- Database schema and API interactions
- Security and access control measures
- User experience enhancements and accessibility features

---

*Last updated: August 24, 2025 - This overview provides a high-level view of the Uy, Kape! system updated following comprehensive application exploration via Playwright MCP. All features documented have been verified as working. For detailed functional specifications, implementation guides, and user workflows, refer to the linked functional specifications document.*