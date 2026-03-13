"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { movieApi } from "@/lib/api";
import { Movie, MovieFormData } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopNavLayout from "@/components/TopNavLayout";
import Link from "next/link";
import Image from "next/image";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    genre: "",
    search: "",
  });

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMovieId, setEditMovieId] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editFormData, setEditFormData] = useState<MovieFormData>({
    title: "",
    genre: "",
    status: "want_to_watch",
    rating: undefined,
    review: "",
  });

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDeleteMovie, setPendingDeleteMovie] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hasHandledMovieIdQuery, setHasHandledMovieIdQuery] = useState(false);

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.genre, filters.search]);

  useEffect(() => {
    const hasAnyModalOpen =
      isDetailModalOpen || isEditModalOpen || isDeleteConfirmOpen;
    if (hasAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isDetailModalOpen, isEditModalOpen, isDeleteConfirmOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      if (isDeleteConfirmOpen && !deleteLoading) {
        closeDeleteConfirm();
        return;
      }

      if (isEditModalOpen && !editLoading) {
        closeEditModal();
        return;
      }

      if (isDetailModalOpen) {
        closeDetailModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDetailModalOpen,
    isEditModalOpen,
    isDeleteConfirmOpen,
    editLoading,
    deleteLoading,
  ]);

  const pushToast = (message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await movieApi.getMovies({
        status: filters.status || undefined,
        genre: filters.genre || undefined,
        search: filters.search || undefined,
      });

      if (response.success) {
        setMovies(response.data?.movies || []);
      } else {
        setError(response.message || "Failed to fetch movies");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    const movieIdFromQuery = searchParams.get("movieId");

    if (!movieIdFromQuery || loading || hasHandledMovieIdQuery) return;

    const targetMovie = movies.find((movie) => movie.id === movieIdFromQuery);

    if (targetMovie) {
      openDetailModal(targetMovie);
    }

    setHasHandledMovieIdQuery(true);
  }, [searchParams, movies, loading, hasHandledMovieIdQuery]);

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMovie(null);
  };

  const openEditModal = (movie: Movie) => {
    setEditMovieId(movie.id);
    setEditFormData({
      title: movie.title || "",
      genre: movie.genre || "",
      status: movie.status || "want_to_watch",
      rating: movie.rating ?? undefined,
      review: movie.review || "",
    });
    setEditError("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (editLoading) return;
    setIsEditModalOpen(false);
    setEditError("");
    setEditMovieId("");
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? (value ? parseInt(value) : undefined) : value,
    }));
    if (editError) setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editMovieId) return;

    if (!editFormData.title.trim()) {
      setEditError("Movie title is required");
      return;
    }

    if (
      editFormData.rating !== undefined &&
      (editFormData.rating < 1 || editFormData.rating > 10)
    ) {
      setEditError("Rating must be between 1 and 10");
      return;
    }

    try {
      setEditLoading(true);
      setEditError("");

      const payload: Partial<MovieFormData> = {
        title: editFormData.title.trim(),
        genre: editFormData.genre?.trim() || undefined,
        status: editFormData.status,
        rating: editFormData.rating,
        review: editFormData.review?.trim() || undefined,
      };

      const response = await movieApi.updateMovie(editMovieId, payload);

      if (response.success && response.data?.movie) {
        const updatedMovie = response.data.movie;

        setMovies((prev) =>
          prev.map((movie) =>
            movie.id === editMovieId ? updatedMovie : movie,
          ),
        );

        if (selectedMovie?.id === editMovieId) {
          setSelectedMovie(updatedMovie);
        }

        setIsEditModalOpen(false);
        pushToast(`"${updatedMovie.title}" updated successfully`, "success");
      } else {
        const msg = response.message || "Failed to update movie";
        setEditError(msg);
        pushToast(msg, "error");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to update movie";
      setEditError(msg);
      pushToast(msg, "error");
    } finally {
      setEditLoading(false);
    }
  };

  const requestDeleteMovie = (movieId: string, movieTitle: string) => {
    setPendingDeleteMovie({ id: movieId, title: movieTitle });
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (deleteLoading) return;
    setIsDeleteConfirmOpen(false);
    setPendingDeleteMovie(null);
  };

  const confirmDeleteMovie = async () => {
    if (!pendingDeleteMovie) return;

    try {
      setDeleteLoading(true);

      const response = await movieApi.deleteMovie(pendingDeleteMovie.id);

      if (response.success) {
        const deletedId = pendingDeleteMovie.id;
        const deletedTitle = pendingDeleteMovie.title;

        setMovies((prev) => prev.filter((movie) => movie.id !== deletedId));

        if (selectedMovie?.id === deletedId) {
          closeDetailModal();
        }

        if (editMovieId === deletedId) {
          closeEditModal();
        }

        closeDeleteConfirm();
        pushToast(`"${deletedTitle}" deleted`, "success");
      } else {
        pushToast(response.message || "Failed to delete movie", "error");
      }
    } catch (err: any) {
      pushToast(err.message || "Failed to delete movie", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusConfig = (status: Movie["status"]) => {
    switch (status) {
      case "want_to_watch":
        return {
          label: "Want to Watch",
          dot: "bg-amber-400",
        };
      case "watching":
        return {
          label: "Watching",
          dot: "bg-blue-400",
        };
      case "watched":
        return {
          label: "Watched",
          dot: "bg-green-400",
        };
      default:
        return {
          label: "Unknown",
          dot: "bg-slate-400",
        };
    }
  };

  const uniqueGenres = useMemo(
    () =>
      Array.from(new Set(movies.map((movie) => movie.genre).filter(Boolean))),
    [movies],
  );

  const watchedCount = movies.filter((m) => m.status === "watched").length;
  const watchingCount = movies.filter((m) => m.status === "watching").length;
  const plannedCount = movies.filter(
    (m) => m.status === "want_to_watch",
  ).length;

  const hasActiveFilters = !!(
    filters.status ||
    filters.genre ||
    filters.search
  );

  return (
    <ProtectedRoute>
      <TopNavLayout>
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-700 bg-slate-800/70 backdrop-blur p-6 sm:p-7 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Collection
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  My Movies
                </h1>
                <p className="text-slate-300 mt-2">
                  Discover, track, and manage your movie collection in one
                  place.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-700 text-slate-200">
                  {movies.length} total
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {plannedCount} planned
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {watchingCount} watching
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                  {watchedCount} watched
                </span>
                <Link
                  href="/movies/add"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg ml-0 sm:ml-2"
                >
                  + Add Movie
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">🔍 Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={() =>
                    setFilters({ status: "", genre: "", search: "" })
                  }
                  className="text-xs sm:text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-6">
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by movie title..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="lg:col-span-3">
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                >
                  <option value="">All Status</option>
                  <option value="want_to_watch">Want to Watch</option>
                  <option value="watching">Watching</option>
                  <option value="watched">Watched</option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Genre
                </label>
                <select
                  value={filters.genre}
                  onChange={(e) =>
                    setFilters({ ...filters, genre: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                >
                  <option value="">All Genres</option>
                  {uniqueGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-300 text-lg">⚠️</span>
                <div>
                  <p className="text-red-200 font-medium">{error}</p>
                  <button
                    onClick={fetchMovies}
                    className="mt-1 text-red-300 hover:text-red-200 text-sm underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent mx-auto mb-4" />
              <p className="text-slate-300">Loading your movies...</p>
            </div>
          )}

          {!loading && movies.length === 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-10 text-center">
              <div className="text-6xl mb-3">🎭</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No movies found
              </h3>
              <p className="text-slate-400 max-w-lg mx-auto mb-6">
                {hasActiveFilters
                  ? "No results match your current filter. Try clearing filters or changing the search keyword."
                  : "Your collection is still empty. Start by adding your first movie."}
              </p>
              <Link
                href="/movies/add"
                className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
              >
                🎬 Add Your First Movie
              </Link>
            </div>
          )}

          {!loading && movies.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-slate-300">
                  Showing{" "}
                  <span className="font-semibold text-slate-100">
                    {movies.length}
                  </span>{" "}
                  movie{movies.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  {watchedCount} watched • {watchingCount} watching •{" "}
                  {plannedCount} planned
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                {movies.map((movie) => {
                  const status = getStatusConfig(movie.status);

                  return (
                    <article
                      key={movie.id}
                      className="group rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shadow-lg hover:border-indigo-500/60 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => openDetailModal(movie)}
                        className="block w-full text-left"
                        aria-label={`Show details for ${movie.title}`}
                      >
                        <div className="relative">
                          {movie.poster_url ? (
                            <Image
                              src={movie.poster_url}
                              alt={movie.title}
                              width={400}
                              height={550}
                              className="w-full h-[300px] object-cover"
                            />
                          ) : (
                            <div className="w-full h-[300px] bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                              <span className="text-6xl text-slate-400">
                                🎬
                              </span>
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white border border-white/10 backdrop-blur-sm">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                              />
                              {status.label}
                            </span>
                          </div>

                          {movie.rating && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-black/75 text-yellow-300 border border-white/10 backdrop-blur-sm">
                                ⭐ {movie.rating}/10
                              </span>
                            </div>
                          )}

                          <div className="absolute bottom-0 inset-x-0 p-3">
                            <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                              {movie.title}
                            </h3>
                            {movie.genre && (
                              <span className="inline-flex mt-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-200 border border-slate-600">
                                {movie.genre}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => openEditModal(movie)}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold text-slate-100 bg-slate-700 hover:bg-slate-600 transition-all"
                          >
                            ✏️ <span>Edit</span>
                          </button>

                          <button
                            onClick={() =>
                              requestDeleteMovie(movie.id, movie.title)
                            }
                            title="Delete movie"
                            aria-label={`Delete ${movie.title}`}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md text-red-300 border border-red-800/70 bg-transparent hover:bg-red-900/30 transition-all"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {isDetailModalOpen && selectedMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              onClick={closeDetailModal}
              aria-label="Close detail modal"
            />
            <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
              <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-700">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedMovie.title}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Movie Details</p>
                </div>
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="h-9 w-9 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="bg-slate-800/60">
                  {selectedMovie.poster_url ? (
                    <Image
                      src={selectedMovie.poster_url}
                      alt={selectedMovie.title}
                      width={600}
                      height={900}
                      className="w-full h-full max-h-[480px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[320px] md:h-full max-h-[480px] bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                      <span className="text-7xl text-slate-400">🎬</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-100">
                      {getStatusConfig(selectedMovie.status).label}
                    </span>
                    {selectedMovie.genre && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {selectedMovie.genre}
                      </span>
                    )}
                    {selectedMovie.rating !== undefined &&
                      selectedMovie.rating !== null && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          ⭐ {selectedMovie.rating}/10
                        </span>
                      )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-1">
                      Review / Notes
                    </h3>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedMovie.review?.trim()
                        ? selectedMovie.review
                        : "No review or notes yet."}
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                    <p>
                      Added:{" "}
                      {selectedMovie.created_at
                        ? new Date(selectedMovie.created_at).toLocaleString()
                        : "-"}
                    </p>
                    <p className="mt-1">
                      Last updated:{" "}
                      {selectedMovie.updated_at
                        ? new Date(selectedMovie.updated_at).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(selectedMovie)}
                      className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        requestDeleteMovie(
                          selectedMovie.id,
                          selectedMovie.title,
                        )
                      }
                      className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-red-900/40 hover:bg-red-900/60 border border-red-700 text-red-200 text-sm font-semibold"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              onClick={closeEditModal}
              aria-label="Close edit modal"
            />
            <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Edit Movie</h2>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="h-9 w-9 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
                  aria-label="Close edit modal"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleEditSubmit}
                className="p-4 sm:p-5 space-y-4"
              >
                {editError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3">
                    <p className="text-sm text-red-200">{editError}</p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="edit-title"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Movie Title *
                  </label>
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={handleEditChange}
                    disabled={editLoading}
                    className="w-full h-11 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                    placeholder="Enter movie title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-genre"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Genre
                  </label>
                  <div className="space-y-2">
                    <select
                      id="edit-genre"
                      name="genre"
                      className="w-full h-11 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                      value={editFormData.genre}
                      onChange={handleEditChange}
                      disabled={editLoading}
                    >
                      <option value="">Select a genre</option>
                      {[
                        "Action",
                        "Adventure",
                        "Animation",
                        "Comedy",
                        "Crime",
                        "Documentary",
                        "Drama",
                        "Family",
                        "Fantasy",
                        "Horror",
                        "Music",
                        "Mystery",
                        "Romance",
                        "Sci-Fi",
                        "Thriller",
                        "War",
                        "Western",
                      ].map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                      <option value="other">
                        Other (type custom genre below)
                      </option>
                    </select>

                    {(editFormData.genre === "other" ||
                      (editFormData.genre &&
                        ![
                          "Action",
                          "Adventure",
                          "Animation",
                          "Comedy",
                          "Crime",
                          "Documentary",
                          "Drama",
                          "Family",
                          "Fantasy",
                          "Horror",
                          "Music",
                          "Mystery",
                          "Romance",
                          "Sci-Fi",
                          "Thriller",
                          "War",
                          "Western",
                        ].includes(editFormData.genre))) && (
                      <input
                        type="text"
                        name="genre"
                        className="w-full h-11 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                        placeholder="Enter custom genre"
                        value={
                          editFormData.genre === "other"
                            ? ""
                            : editFormData.genre
                        }
                        onChange={handleEditChange}
                        disabled={editLoading}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-status"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Status *
                  </label>
                  <select
                    id="edit-status"
                    name="status"
                    required
                    value={editFormData.status}
                    onChange={handleEditChange}
                    disabled={editLoading}
                    className="w-full h-11 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                  >
                    <option value="want_to_watch">Want to Watch</option>
                    <option value="watching">Watching</option>
                    <option value="watched">Watched</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-rating"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Rating (1-10)
                  </label>
                  <input
                    id="edit-rating"
                    name="rating"
                    type="number"
                    min={1}
                    max={10}
                    value={editFormData.rating ?? ""}
                    onChange={handleEditChange}
                    disabled={editLoading}
                    className="w-full h-11 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-review"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Review / Notes
                  </label>
                  <textarea
                    id="edit-review"
                    name="review"
                    rows={4}
                    value={editFormData.review || ""}
                    onChange={handleEditChange}
                    disabled={editLoading}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition-all"
                    placeholder="Write your thoughts..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={editLoading}
                    className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-semibold disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteConfirmOpen && pendingDeleteMovie && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              onClick={closeDeleteConfirm}
              aria-label="Close delete confirmation"
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Delete Movie?
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-100">
                      "{pendingDeleteMovie.title}"
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  disabled={deleteLoading}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-semibold disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteMovie}
                  disabled={deleteLoading}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="fixed top-4 right-4 z-[100] space-y-2 w-[min(90vw,360px)]">
          {toasts.map((toast) => {
            const tone =
              toast.type === "success"
                ? "border-green-500/40 bg-green-900/30 text-green-100"
                : toast.type === "error"
                  ? "border-red-500/40 bg-red-900/30 text-red-100"
                  : "border-indigo-500/40 bg-indigo-900/30 text-indigo-100";

            const icon =
              toast.type === "success"
                ? "✅"
                : toast.type === "error"
                  ? "❌"
                  : "ℹ️";

            return (
              <div
                key={toast.id}
                className={`rounded-xl border px-3 py-2 shadow-lg backdrop-blur ${tone}`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">{icon}</span>
                  <p className="text-sm leading-relaxed flex-1">
                    {toast.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="text-xs opacity-80 hover:opacity-100"
                    aria-label="Close toast"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </TopNavLayout>
    </ProtectedRoute>
  );
}
