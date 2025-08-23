# Uy, Kape! - Local Development Setup

This document explains how to set up and work with the local Supabase development environment for the Uy, Kape! coffee ordering system.

## Prerequisites

- ✅ Docker Desktop (installed and running)
- ✅ Node.js and npm
- ✅ Supabase CLI (installed as dev dependency - use `npx supabase`)

## Local Development Setup

### 1. Environment Configuration

Configure your `.env` file based on `.env.example`:

```bash
# Local Supabase Configuration (for local development)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Remote Supabase Configuration (for production)
# VITE_SUPABASE_URL=your_remote_supabase_url
# VITE_SUPABASE_ANON_KEY=your_remote_anon_key

# Application Configuration - SET SECURE PASSWORDS!
VITE_GUEST_PASSWORD=your_secure_guest_password
VITE_ADMIN_PASSWORD=your_secure_admin_password
VITE_WAIT_TIME_PER_ORDER=4
VITE_ERROR_HANDLING_PANEL=false
```

**⚠️ Security Note**: Always use strong, unique passwords and never commit actual credentials to version control.

### 2. Starting Local Development

#### Start Supabase Services
```bash
npx supabase start
```

This will:
- Pull necessary Docker images
- Start PostgreSQL database
- Apply database migrations
- Seed the database with initial data
- Start all Supabase services (API, Auth, Storage, Studio, etc.)

#### Start the Application
```bash
npm run dev
```

### 3. Available Services

Once everything is running, you'll have access to:

- **Application**: http://localhost:5174/ (or next available port)
- **Supabase Studio**: http://127.0.0.1:54323 (Database admin interface)
- **API URL**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Inbucket (Email testing)**: http://127.0.0.1:54324

### 4. Database Schema

The database includes these main tables:
- `drink_categories` - Coffee categories (Coffee, Tea, etc.)
- `drinks` - Individual drinks with descriptions
- `option_categories` - Customization options (milk type, shots, etc.)
- `option_values` - Available values for each option
- `drink_options` - Links drinks to their available options
- `orders` - Customer orders
- `order_options` - Selected options for each order

### 5. Useful Commands

#### Check Status
```bash
npx supabase status
```

#### Stop Services
```bash
npx supabase stop
```

#### Reset Database (clear all data)
```bash
npx supabase db reset
```

#### Check Migration Status
```bash
npx supabase migration list
```

#### Create New Migration
```bash
npx supabase migration new <migration_name>
```

## Working with Remote Supabase

### Pushing Changes to Remote

When you're ready to deploy your local changes to the remote Supabase:

1. **Push database migrations**:
   ```bash
   npx supabase db push
   ```

2. **Switch to remote environment**:
   - Update your `.env` file to use remote URLs
   - Comment out the local configuration and uncomment the remote configuration
   - Restart your development server

3. **Deploy functions** (if you have any):
   ```bash
   npx supabase functions deploy
   ```

### Pulling Changes from Remote

To sync changes from your remote database:

```bash
npx supabase db pull
```

## Security Best Practices

### Environment Files
- **Never commit `.env` with real credentials to version control**
- Use `.env.local.example` and `.env.remote.example` as templates
- Set strong, unique passwords for `VITE_GUEST_PASSWORD` and `VITE_ADMIN_PASSWORD`
- Keep production credentials secure and separate from development

### Switching Environments
To switch between local and remote environments:

1. **For Local Development**:
   ```bash
   cp .env.local.example .env
   # Edit .env with your secure passwords
   npm run dev
   ```

2. **For Remote/Production**:
   ```bash
   cp .env.remote.example .env
   # Edit .env with your remote URLs and secure passwords
   npm run dev
   ```

## Database Structure

### Core Tables
- **drink_categories**: Categories like "Coffee", "Tea", "Special Coffee"
- **drinks**: Individual beverages (Espresso, Latte, etc.)
- **option_categories**: Types of customizations (Number of Shots, Milk Type)
- **option_values**: Specific options (Single, Double, Oat Milk, etc.)
- **orders**: Customer orders with status tracking
- **order_options**: Selected customizations for each order

### Key Features
- ✅ UUID primary keys
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamps
- ✅ Proper foreign key relationships
- ✅ Database views for easier querying
- ✅ Indexes for performance

## Troubleshooting

### Docker Issues
- Ensure Docker Desktop is running
- Try restarting Docker Desktop if connection fails

### Port Conflicts
- If ports are in use, stop other services or modify `supabase/config.toml`

### Database Issues
- Use `npx supabase db reset` to completely reset the database
- Check `npx supabase status` to ensure all services are running

### Migration Issues
- Check migration files in `supabase/migrations/`
- Use `npx supabase migration list` to see sync status

## Next Steps

1. **Test the application** at http://localhost:5174/
2. **Explore the database** using Supabase Studio at http://127.0.0.1:54323
3. **Make changes locally** and test thoroughly
4. **Push to remote** when ready for production

Your local development environment is now fully configured and ready to use! 🎉