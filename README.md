# Movie Tracker 🎬

A full-stack web application for tracking your favorite movies and TV shows. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Live Demo

[**View Live App**](https://movie-buddy-sigma.vercel.app/)

## ✨ Features (Planned)

- **🔍 Search & Discovery**: Find movies and TV shows using The Movie Database (TMDB) API
- **📋 Personal Watchlists**: Create and manage custom lists of your favorite content
- **⭐ Rating & Reviews**: Rate movies and TV shows with a 5-star system and write reviews
- **📊 Watch Status**: Track what you're currently watching, want to watch, or have completed
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🔐 User Authentication**: Secure user accounts with Supabase Auth
- **⚡ Real-time Updates**: Live updates across all your devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL) - *Coming Soon*
- **Authentication**: Supabase Auth - *Coming Soon*
- **External API**: The Movie Database (TMDB) - *Coming Soon*
- **Deployment**: Vercel ✅
- **Development**: ESLint, Prettier ✅

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- TMDB API key

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

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🗄️ Database Schema (Planned)

The application will use a PostgreSQL database with the following main tables:

- **users**: User profiles and preferences
- **lists**: Custom watchlists created by users
- **list_items**: Items within each watchlist
- **ratings**: User ratings and reviews
- **watch_status**: Current watching status and progress

## 🚀 Deployment

This app is automatically deployed to Vercel with CI/CD:

1. **Push to main branch** triggers automatic deployment ✅
2. **Preview deployments** are created for pull requests ✅
3. **Environment variables** will be configured in Vercel dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for movie and TV show data
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.io/) for backend infrastructure
- [Vercel](https://vercel.com/) for deployment and hosting
