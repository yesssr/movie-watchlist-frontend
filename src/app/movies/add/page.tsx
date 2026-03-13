"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { movieApi } from "@/lib/api";
import { MovieFormData } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopNavLayout from "@/components/TopNavLayout";
import Link from "next/link";

export default function AddMoviePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<MovieFormData>({
    title: "",
    genre: "",
    status: "want_to_watch",
    rating: undefined,
    review: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "rating" ? (value ? parseInt(value) : undefined) : value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!formData.title.trim()) {
      setError("Movie title is required");
      setLoading(false);
      return;
    }

    // Validate rating if provided
    if (formData.rating && (formData.rating < 1 || formData.rating > 10)) {
      setError("Rating must be between 1 and 10");
      setLoading(false);
      return;
    }

    try {
      const response = await movieApi.createMovie({
        ...formData,
        title: formData.title.trim(),
        genre: formData.genre?.trim() || undefined,
        review: formData.review?.trim() || undefined,
      });

      if (response.success) {
        router.push("/movies");
      } else {
        setError(response.message || "Failed to add movie");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add movie");
    } finally {
      setLoading(false);
    }
  };

  const commonGenres = [
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
  ];

  return (
    <ProtectedRoute>
      <TopNavLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <Link
                href="/movies"
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Add New Movie</h1>
                <p className="text-slate-300">Add a movie to your watchlist</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <div className="flex">
                    <div className="text-red-400">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Movie Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="input-field"
                  placeholder="Enter movie title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-slate-400">
                  The poster will be automatically fetched from TMDB if
                  available
                </p>
              </div>

              {/* Genre */}
              <div>
                <label
                  htmlFor="genre"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Genre
                </label>
                <div className="space-y-2">
                  <select
                    id="genre"
                    name="genre"
                    className="input-field"
                    value={formData.genre}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select a genre</option>
                    {commonGenres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                    <option value="other">
                      Other (type custom genre below)
                    </option>
                  </select>

                  {(formData.genre === "other" ||
                    (formData.genre &&
                      !commonGenres.includes(formData.genre))) && (
                    <input
                      type="text"
                      name="genre"
                      className="input-field"
                      placeholder="Enter custom genre"
                      value={formData.genre === "other" ? "" : formData.genre}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="input-field"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="want_to_watch">Want to Watch</option>
                  <option value="watching">Currently Watching</option>
                  <option value="watched">Watched</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="1"
                  max="10"
                  className="input-field"
                  placeholder="Rate this movie (optional)"
                  value={formData.rating || ""}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-slate-400">
                  Give it a score from 1 to 10 (optional)
                </p>
              </div>

              {/* Review */}
              <div>
                <label
                  htmlFor="review"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Review / Notes
                </label>
                <textarea
                  id="review"
                  name="review"
                  rows={4}
                  className="input-field"
                  placeholder="Write your thoughts about this movie (optional)"
                  value={formData.review}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Movie...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🎬</span>
                      Add Movie
                    </>
                  )}
                </button>

                <Link
                  href="/movies"
                  className="btn-secondary text-center flex items-center justify-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Tips */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-medium text-slate-200 mb-2">💡 Tips</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>
                • Movie posters are automatically fetched from TMDB database
              </li>
              <li>• You can always edit the movie details later</li>
              <li>
                • Use the status to track your progress: Want to Watch →
                Watching → Watched
              </li>
              <li>
                • Ratings and reviews help you remember what you thought of the
                movie
              </li>
            </ul>
          </div>
        </div>
      </TopNavLayout>
    </ProtectedRoute>
  );
}
