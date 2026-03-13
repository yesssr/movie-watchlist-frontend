"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navigation */}
      <nav className="bg-slate-800/95 backdrop-blur shadow-xl border-b border-slate-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Movie Watchlist
            </h1>

            {/* Aligned actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-slate-300 hover:text-slate-100 rounded-lg hover:bg-slate-700 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-10 px-4 sm:px-5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_60%)]">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 mb-5">
              Personal Movie Tracker
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Keep your
              <span className="text-indigo-400"> movie life </span>
              organized.
            </h2>
            <p className="mt-6 text-lg text-slate-400 max-w-xl">
              Save movies to watch later.
              <br />
              Track what you're watching now.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium px-6 py-3 transition-all duration-200"
              >
                I already have an account
              </Link>
            </div>
          </div>

          {/* Hero preview */}
          <div className="bg-slate-800 border border-slate-700 rounded-[14px] p-5 sm:p-6 shadow-2xl transition-transform duration-200 hover:-translate-y-[3px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-200">
                Your Weekly Board
              </h3>
              <span className="text-xs text-slate-400">Updated just now</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[13px] text-slate-300/80">
                    Want to Watch
                  </p>
                  <span className="text-indigo-400 text-[22px] font-bold leading-none">
                    12
                  </span>
                </div>
                <p className="text-[13px] text-slate-400/70 mt-1">
                  Titles waiting in your queue
                </p>
              </div>

              <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[13px] text-slate-300/80">
                    Currently Watching
                  </p>
                  <span className="text-indigo-400 text-[22px] font-bold leading-none">
                    3
                  </span>
                </div>
                <p className="text-[13px] text-slate-400/70 mt-1">
                  Movies in your current rotation
                </p>
              </div>

              <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[13px] text-slate-300/80">
                    Watched
                  </p>
                  <span className="text-indigo-400 text-[22px] font-bold leading-none">
                    48
                  </span>
                </div>
                <p className="text-[13px] text-slate-400/70 mt-1">
                  Completed titles with notes and ratings
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 transition-all duration-200 hover:-translate-y-1.5 hover:bg-[#273449]">
            <div className="text-[28px] mb-3">📝</div>
            <h3 className="text-lg font-semibold mb-2">Plan What’s Next</h3>
            <p className="text-slate-400">
              Build a queue so you always know what to watch next.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 transition-all duration-200 hover:-translate-y-1.5 hover:bg-[#273449]">
            <div className="text-[28px] mb-3">🍿</div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-slate-400">
              Keep tabs on in-progress movies and never forget where you left
              off.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 transition-all duration-200 hover:-translate-y-1.5 hover:bg-[#273449]">
            <div className="text-[28px] mb-3">⭐</div>
            <h3 className="text-lg font-semibold mb-2">Review Your History</h3>
            <p className="text-slate-400">
              Rate finished movies and look back on your favorites.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            How it works
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-indigo-400 font-bold mb-2">01</p>
              <h4 className="font-semibold mb-2">Add movies quickly</h4>
              <p className="text-sm text-slate-400">
                Save titles in seconds and put them into the right list.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-indigo-400 font-bold mb-2">02</p>
              <h4 className="font-semibold mb-2">Update status as you watch</h4>
              <p className="text-sm text-slate-400">
                Move titles from planned to watching to watched with ease.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-indigo-400 font-bold mb-2">03</p>
              <h4 className="font-semibold mb-2">Get insight from your data</h4>
              <p className="text-sm text-slate-400">
                See your habits and trends from your personal dashboard.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Start Building Your Watchlist
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500 text-sm">
            &copy; 2026 Yassure Movie Watchlist.
          </p>
        </div>
      </footer>
    </div>
  );
}
