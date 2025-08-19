# Uy, Kape!
**Uy, Kape!** is a coffee-ordering system for _coffee prosumers_ who want to give **visitors** to their **home** a fancy online ordering system. All menu items are free, the intent is to give the coffee barista a way to track guest orders based on what is available at home for the day.

## Technology Stack
- **Frontend:** React.js with TypeScript
- **Build Tool:** Vite (for a fast development experience)
- **Styling:** Utility-first CSS (e.g., Tailwind CSS)
- **Database:** Supabase (for a completely free, real-time, NoSQL-like database)
- **Hosting:** Vercel (for free and easy front-end hosting)

## Running Locally

### Prerequisites

- **Node.js** (version 18 or higher)
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
   - Create a `.env.local` file in the root directory
   - Add your Supabase configuration:

     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:5173` (or the port shown in the terminal)

### Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

### VS Code Development

Press **F5** to start debugging in VS Code, which will:

- Start the development server
- Open the application in your default browser
- Enable debugging capabilities