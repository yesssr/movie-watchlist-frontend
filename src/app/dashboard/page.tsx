"use client";

import { useState, useEffect } from "react";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopNavLayout from "@/components/TopNavLayout";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [addingMovie, setAddingMovie] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await movieApi.getMovies();
      if (response.success) {
        setMovies(response.data?.movies || []);
      }
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovieTitle.trim() || addingMovie) return;

    try {
      setAddingMovie(true);
      const response = await movieApi.createMovie({
        title: newMovieTitle.trim(),
        status: "want_to_watch",
      });

      if (response.success && response.data?.movie) {
        setMovies([response.data.movie, ...movies]);
        setNewMovieTitle("");
      }
    } catch (error) {
      console.error("Failed to add movie:", error);
    } finally {
      setAddingMovie(false);
    }
  };

  const groupedMovies = {
    watchlist: movies.filter((m) => m.status === "want_to_watch"),
    watching: movies.filter((m) => m.status === "watching"),
    watched: movies.filter((m) => m.status === "watched"),
  };

  const stats = {
    total: movies.length,
    watchlist: groupedMovies.watchlist.length,
    watching: groupedMovies.watching.length,
    watched: groupedMovies.watched.length,
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <TopNavLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
          </div>
        </TopNavLayout>
      </ProtectedRoute>
    );
  }

  const MovieCard = ({
    movie,
    accent = "indigo",
  }: {
    movie: Movie;
    accent?: "indigo" | "blue" | "green";
  }) => {
    const accentHover =
      accent === "blue"
        ? "group-hover/card:text-blue-300"
        : accent === "green"
          ? "group-hover/card:text-green-300"
          : "group-hover/card:text-indigo-300";

    const accentShadow =
      accent === "blue"
        ? "hover:shadow-blue-500/25"
        : accent === "green"
          ? "hover:shadow-green-500/25"
          : "hover:shadow-indigo-500/25";

    return (
      <Link
        key={movie.id}
        href={`/movies?movieId=${movie.id}`}
        className="group"
      >
        <div
          className={`relative rounded-2xl overflow-hidden shadow-xl ${accentShadow} transition-all duration-200 hover:-translate-y-1 group/card w-[190px]`}
        >
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={movie.title}
              width={190}
              height={285}
              className="w-full h-[285px] object-cover"
            />
          ) : (
            <div className="w-full h-[285px] bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
              <span className="text-6xl text-slate-400">🎬</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/65 to-transparent h-28" />

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
            <h3
              className={`text-sm font-semibold line-clamp-1 ${accentHover} transition-colors`}
            >
              {movie.title}
            </h3>
            {movie.genre && (
              <p className="text-[11px] text-slate-300 mt-1 opacity-80 line-clamp-1">
                {movie.genre}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <ProtectedRoute>
      <TopNavLayout>
        <div className="space-y-8">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-110 filter blur-xl brightness-30"
              style={{
                backgroundImage:
                  "url('https://image.tmdb.org/t/p/original/fqv8v6AycXKsivp1T5yKtLbGXce.jpg')",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, rgba(99,102,241,0.35), transparent 40%),
                  radial-gradient(circle at 80% 60%, rgba(16,185,129,0.25), transparent 40%),
                  radial-gradient(circle at 50% 100%, rgba(236,72,153,0.15), transparent 50%),
                  rgba(2,6,23,0.85)
                `,
              }}
            />

            <div className="relative z-10 px-8 py-12">
              <div className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                  Movie Watchlist
                </h1>
                <p className="text-slate-300 text-xl max-w-2xl mx-auto">
                  Track your cinematic journey • Discover amazing films
                </p>
              </div>

              <form
                onSubmit={handleQuickAdd}
                className="flex gap-4 max-w-md mx-auto"
              >
                <input
                  type="text"
                  placeholder="Add movie to watchlist..."
                  value={newMovieTitle}
                  onChange={(e) => setNewMovieTitle(e.target.value)}
                  className="flex-1 h-12 px-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder-white/60 transition-all duration-200"
                  disabled={addingMovie}
                />
                <button
                  type="submit"
                  disabled={!newMovieTitle.trim() || addingMovie}
                  className="px-8 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-600/30"
                >
                  {addingMovie ? "Adding..." : "Add"}
                </button>
              </form>

              {!newMovieTitle.trim() && !addingMovie && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  Enter a movie title to quickly add it to your watchlist.
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 text-slate-300">
              <span className="text-slate-100 font-semibold text-lg">
                {stats.total} movies
              </span>
              <span className="text-slate-500">•</span>
              <span className="bg-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {stats.watchlist} watchlist
              </span>
              <span className="bg-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {stats.watching} watching
              </span>
              <span className="bg-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {stats.watched} watched
              </span>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10 max-w-7xl mx-auto px-6">
            {/* Watchlist */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    WATCHLIST
                  </h2>
                  <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                    {groupedMovies.watchlist.length}
                  </span>
                </div>
                <Link
                  href="/movies?status=want_to_watch"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-indigo-300 border border-slate-700 hover:border-indigo-500 hover:text-indigo-200 transition-all"
                >
                  View all →
                </Link>
              </div>

              {groupedMovies.watchlist.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {groupedMovies.watchlist.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} accent="indigo" />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
                  <p className="text-slate-300 font-medium">
                    No movies in Watchlist yet
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Add a title above or go to full movies page.
                  </p>
                  <Link
                    href="/movies/add"
                    className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                  >
                    Add your first watchlist movie
                  </Link>
                </div>
              )}
            </div>

            {/* Watching */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    WATCHING
                  </h2>
                  <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                    {groupedMovies.watching.length}
                  </span>
                </div>
                <Link
                  href="/movies?status=watching"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-indigo-300 border border-slate-700 hover:border-indigo-500 hover:text-indigo-200 transition-all"
                >
                  View all →
                </Link>
              </div>

              {groupedMovies.watching.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {groupedMovies.watching.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} accent="blue" />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
                  <p className="text-slate-300 font-medium">
                    No movies being watched right now
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Move one from Watchlist when you start watching.
                  </p>
                </div>
              )}
            </div>

            {/* Watched */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    WATCHED
                  </h2>
                  <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                    {groupedMovies.watched.length}
                  </span>
                </div>
                <Link
                  href="/movies?status=watched"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-indigo-300 border border-slate-700 hover:border-indigo-500 hover:text-indigo-200 transition-all"
                >
                  View all →
                </Link>
              </div>

              {groupedMovies.watched.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {groupedMovies.watched.slice(0, 16).map((movie) => (
                    <MovieCard key={movie.id} movie={movie} accent="green" />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
                  <p className="text-slate-300 font-medium">
                    No watched movies yet
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Completed titles will appear here with your history.
                  </p>
                </div>
              )}

              {groupedMovies.watched.length > 16 && (
                <div className="mt-4 text-center">
                  <Link
                    href="/movies?status=watched"
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    View all {groupedMovies.watched.length} watched movies →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Whole dashboard empty */}
          {movies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">
                Tip: start with the quick add box above for fastest input.
              </p>
            </div>
          )}
        </div>
      </TopNavLayout>
    </ProtectedRoute>
  );
}
