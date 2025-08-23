# Development Environment Setup Guide

This guide provides comprehensive setup instructions for the Uy, Kape! coffee ordering system with troubleshooting for common issues.

## Prerequisites

- **Node.js 20.x** or higher
- **npm** package manager
- **Git** for version control
- **Supabase Account** for backend services

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/raffertyuy/uy-kape.git
cd uy-kape
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key

# Application Passwords (Required)
VITE_GUEST_PASSWORD=your-guest-password
VITE_ADMIN_PASSWORD=your-admin-password

# Optional Configuration
VITE_APP_NAME="Uy, Kape!"
VITE_APP_DESCRIPTION="Coffee Ordering System"
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New project"
4. Choose your organization and fill in project details
5. Wait for project initialization

### 2. Get Configuration Values

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 3. Configure Database Schema

Run the SQL migrations in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE IF EXISTS drink_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS option_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS drink_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;

-- Create basic policies (example - adjust for your needs)
CREATE POLICY "Allow all operations for authenticated users" ON drink_categories
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON drinks
    FOR ALL USING (true);

-- Repeat for other tables...
```

### 4. Enable Real-time

1. Go to **Database** → **Replication**
2. Enable real-time for your tables:
   - `drink_categories`
   - `drinks`
   - `option_categories`
   - `option_values`
   - `drink_options`
   - `orders`

## Password Configuration

The application uses simple password protection for different user roles:

- **Guest Password**: Allows customers to place orders
- **Admin Password**: Provides access to menu management and order dashboard

Choose strong passwords and update them regularly in production.

## Common Issues & Troubleshooting

### Issue: "TypeError: Failed to fetch"

**Symptoms:**
- Menu operations fail silently
- Network errors in browser console
- Connection status shows "Connection Issues"

**Solutions:**

1. **Check Supabase Configuration**
   ```bash
   # Verify your environment variables
   cat .env | grep SUPABASE
   ```
   - Ensure URL format: `https://xyz.supabase.co` (no trailing slash)
   - Verify anon key is the public key, not service role key

2. **Test Supabase Connection**
   ```bash
   # Open browser developer tools and test in console
   fetch('https://your-project.supabase.co/rest/v1/')
   ```

3. **Check Network/Firewall**
   - Disable VPN temporarily
   - Check corporate firewall settings
   - Try different network connection

4. **Verify Supabase Project Status**
   - Check Supabase dashboard for project health
   - Ensure project is not paused/suspended

### Issue: Real-time Features Not Working

**Symptoms:**
- Real-time indicator shows "Connection Error"
- Menu changes don't appear immediately
- WebSocket connection failures

**Solutions:**

1. **Enable Real-time in Supabase**
   - Go to Database → Replication
   - Enable real-time for all menu tables

2. **Check Browser WebSocket Support**
   ```javascript
   // Test in browser console
   new WebSocket('wss://echo.websocket.org')
   ```

3. **Network/Proxy Issues**
   - WebSocket connections may be blocked by proxies
   - Try different network or disable proxy

### Issue: Build Failures

**Symptoms:**
- `npm run build` fails with TypeScript errors
- Missing dependencies

**Solutions:**

1. **Clean Installation**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Node.js Version**
   ```bash
   node --version  # Should be 20.x or higher
   npm --version   # Should be compatible
   ```

3. **Clear Build Cache**
   ```bash
   rm -rf dist
   npm run build
   ```

### Issue: Environment Variables Not Loading

**Symptoms:**
- Configuration validation errors
- Environment variables undefined in application

**Solutions:**

1. **Check File Location**
   - `.env` file must be in project root
   - File name is exactly `.env` (not `.env.txt`)

2. **Restart Development Server**
   ```bash
   # Stop with Ctrl+C, then restart
   npm run dev
   ```

3. **Variable Naming**
   - All variables must start with `VITE_`
   - No spaces around `=` in `.env` file

### Issue: Database Migration Errors

**Symptoms:**
- SQL errors when setting up database
- Missing tables or columns

**Solutions:**

1. **Run Migrations in Order**
   - Execute SQL files in sequence
   - Check for errors after each migration

2. **Reset Database** (Development only)
   - Drop all tables in Supabase SQL editor
   - Re-run all migrations from scratch

## Development Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test:run

# Run tests with coverage
npm run test:coverage

# Linting
npm run lint

# End-to-end tests
npm run test:e2e
```

## Configuration Validation

The application includes built-in configuration validation:

1. **Admin Dashboard**: Shows configuration status
2. **Environment Validation**: Checks required variables at startup
3. **Health Checks**: Monitors Supabase connectivity

Access the admin module and check the configuration status panel for detailed diagnostics.

## Production Deployment

### Environment Variables

Set the following in your production environment:

```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_GUEST_PASSWORD=secure-guest-password
VITE_ADMIN_PASSWORD=secure-admin-password
```

### Build and Deploy

```bash
# Build for production
npm run build

# The dist/ folder contains the built application
# Deploy to your hosting provider (Vercel, Netlify, etc.)
```

### Security Considerations

1. **Strong Passwords**: Use complex passwords for guest/admin access
2. **Environment Security**: Keep `.env` files out of version control
3. **Supabase RLS**: Configure proper Row Level Security policies
4. **HTTPS**: Always use HTTPS in production

## Support and Resources

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **React Documentation**: [react.dev](https://react.dev)
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)

For project-specific issues, check the GitHub repository for existing issues or create a new one.

## Health Check Script

Use this script to verify your environment setup:

```bash
# Save as check-environment.js and run with: node check-environment.js
const https = require('https');
require('dotenv').config();

console.log('🔍 Environment Check\n');

// Check required variables
const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_GUEST_PASSWORD', 'VITE_ADMIN_PASSWORD'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.log('❌ Missing environment variables:');
  missing.forEach(key => console.log(`   - ${key}`));
  process.exit(1);
}

console.log('✅ All required environment variables present');

// Test Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
https.get(`${supabaseUrl}/rest/v1/`, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Supabase connection successful');
  } else {
    console.log(`❌ Supabase connection failed: ${res.statusCode}`);
  }
}).on('error', (err) => {
  console.log(`❌ Supabase connection error: ${err.message}`);
});
```

---

*Last updated: August 23, 2025*