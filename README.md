# Uy, Kape! ☕

![CI](https://github.com/raffertyuy/uy-kape/workflows/CI/badge.svg)
![Security Scan](https://github.com/raffertyuy/uy-kape/workflows/Security%20Scan/badge.svg)
![Line Endings](https://github.com/raffertyuy/uy-kape/workflows/Check%20Line%20Endings/badge.svg)

**Uy, Kape!** is a coffee-ordering system for _coffee prosumers_ who want to give **visitors** to their **home** a fancy online ordering system with professional branding. All menu items are free, the intent is to give the coffee barista a way to track guest orders based on what is available at home for the day.

## Vibe Coding

This app is **100% vibe coded!** using [GitHub Copilot](https://copilot.github.com). We do this mostly by following the [plan-implement-run pattern](https://raffertyuy.com/raztype/vibe-coding-plan-implement-run/).

This starts with writing a task objective in [scratch.md](/scratch.md) and then running `/1-plan #file:scratch.md` in GitHub Copilot Chat.

For more details, read the [VIBE CODING GUIDE](./VIBE_CODING_GUIDE.md).

## Features

### Professional Branding & UI/UX
- **Logo Integration**: Official "Uy, Kape!" logo throughout the application
- **Responsive Design**: Logo adapts seamlessly across desktop, tablet, and mobile devices
- **Brand Consistency**: Cohesive visual identity with logo + text combinations
- **Coffee-Themed Styling**: Enhanced color palette matching the brand logo

### Guest Ordering System
- **Welcome Page**: Coffee-themed interface for visitors
- **Menu Display**: Browse available beverages and customizations
- **Order Placement**: Simple and intuitive ordering process
- **Real-time Updates**: Live menu availability and status

### Barista Admin Module
- **Menu Management**: Complete control over coffee shop menu
  - Drink categories (Coffee, Tea, Specialty, etc.)
  - Individual beverages with pricing and descriptions
  - Customization options (Size, Milk type, Add-ons)
  - Real-time synchronization across all admin interfaces
- **Order Management**: Track and fulfill customer orders
- **Administrative Tools**: User management and system configuration

### Technical Features
- **Real-time Synchronization**: Live updates across all connected devices
- **Password Protection**: Secure access to admin features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: Full keyboard navigation and screen reader support
- **Offline Support**: Basic functionality when internet is unavailable

## Technology Stack

**Uy, Kape!** is built with modern web technologies optimized for performance and real-time collaboration:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time subscriptions)  
- **Testing**: Vitest + React Testing Library
- **Hosting**: Vercel with Node.js 20.x runtime

📋 **[View Complete Technology Stack Documentation →](docs/specs/technology_stack.md)**

_For detailed version information, architectural decisions, and configuration details, see the comprehensive technology stack documentation._

## Running Locally

### Prerequisites

- **Node.js** (version 20 or higher)
- **npm** (comes with Node.js)

### Installation and Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd uy-kape
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**

   - Create an `.env` file in the root directory
   - Copy and fill the values from `.env.example`

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:5173` (or the port shown in the terminal)

### Accessing Features

**Guest Interface:**

- Default landing page provides the guest ordering experience
- No authentication required for browsing and ordering

**Barista Admin Interface:**

1. Navigate to `/barista` or click "Barista Login" from the welcome page
2. Enter the admin password (configurable in environment variables)
3. Access the menu management system and order tracking tools

**Menu Management:**

- From the Barista Module, click "Menu Management"
- Manage drink categories, beverages, and customization options
- Changes sync in real-time across all connected devices

### Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality