"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopNavLayout from "@/components/TopNavLayout";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
    if (message) setMessage("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim()) {
      setError("Username is required");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      setError("Password confirmation does not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await authApi.updateProfile({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password || undefined,
      });

      setMessage("Profile updated successfully");
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <TopNavLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="text-slate-300 mt-1">Update your account info</p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <div className="error-message">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {message && (
                <div className="success-message">
                  <p className="text-sm text-green-300">{message}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Username
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  className="input-field"
                  placeholder="Your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              <div className="pt-2 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-3">
                  Change password (optional)
                </p>
                <div className="space-y-4">
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={onChange}
                    className="input-field"
                    placeholder="New password"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={onChange}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </TopNavLayout>
    </ProtectedRoute>
  );
}
