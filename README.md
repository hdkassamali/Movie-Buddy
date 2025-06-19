# Movie Tracker 🎬

A full-stack web application for tracking your favorite movies and TV shows. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Live Demo

[**View Live App**](https://movie-buddy-sigma.vercel.app/)

## ✨ Features

- **🔍 Search & Discovery**: Find movies and TV shows using The Movie Database (TMDB) API ✅
- **🔐 User Authentication**: Secure user accounts with Supabase Auth ✅
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices ✅
- **📋 Personal Watchlists**: Create and manage custom lists of your favorite content - *Coming Soon*
- **⭐ Rating & Reviews**: Rate movies and TV shows with a 5-star system and write reviews - *Coming Soon*
- **📊 Watch Status**: Track what you're currently watching, want to watch, or have completed - *Coming Soon*
- **⚡ Real-time Updates**: Live updates across all your devices - *Coming Soon*

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL) ✅
- **Authentication**: Supabase Auth ✅
- **External API**: The Movie Database (TMDB) ✅
- **State Management**: React Query (TanStack Query) ✅
- **Deployment**: Vercel ✅
- **Development**: ESLint, Prettier ✅

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Movie-Buddy.git
   cd Movie-Buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Then edit `.env.local` and add your credentials:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # TMDB API Configuration
   TMDB_API_KEY=your_tmdb_api_key
   ```

4. **Set up database schema**
   - Follow the instructions in [`migrations/README.md`](./migrations/README.md)
   - Execute the SQL migration in your Supabase SQL Editor

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following main tables:

- **users**: User profiles and preferences
- **lists**: Custom watchlists created by users
- **list_items**: Items within each watchlist
- **ratings**: User ratings and reviews
- **watch_status**: Current watching status and progress

### Database Setup

Database migrations and schema are available in the [`migrations/`](./migrations/) directory:

- **[`migrations/001_initial_schema.sql`](./migrations/001_initial_schema.sql)**: Complete database schema with tables, indexes, and Row Level Security policies
- **[`migrations/README.md`](./migrations/README.md)**: Detailed setup instructions and migration guide

To set up the database:
1. Follow the instructions in [`migrations/README.md`](./migrations/README.md)
2. Execute the SQL migration in your Supabase SQL Editor
3. Verify the schema was created correctly using the provided test queries

## 🚀 Deployment

This app is automatically deployed to Vercel with CI/CD:

1. **Push to main branch** triggers automatic deployment ✅
2. **Preview deployments** are created for pull requests ✅
3. **Environment variables** configured in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - `TMDB_API_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. 

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE.md)

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for movie and TV show data
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.io/) for backend infrastructure
- [Vercel](https://vercel.com/) for deployment and hosting
