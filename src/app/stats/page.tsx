"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopNavLayout from "@/components/TopNavLayout";
import { movieApi } from "@/lib/api";
import { Movie, MovieStats } from "@/types";

export default function StatsPage() {
  const [stats, setStats] = useState<MovieStats>({
    want_to_watch: 0,
    watching: 0,
    watched: 0,
    total: 0,
  });

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsRes, moviesRes] = await Promise.all([
          movieApi.getStats(),
          movieApi.getMovies(),
        ]);

        if (statsRes.success && statsRes.data?.stats) {
          setStats(statsRes.data.stats);
        } else {
          setError(statsRes.message ?? "Failed to load statistics");
        }

        if (moviesRes.success) {
          setMovies(moviesRes.data?.movies ?? []);
        }
      } catch (err: any) {
        setError(err?.message ?? "Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const completionRate = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.watched / stats.total) * 100);
  }, [stats.total, stats.watched]);

  const avgRating = useMemo(() => {
    const ratings = movies
      .map((m) => m.rating)
      .filter((r): r is number => typeof r === "number" && r >= 1 && r <= 10);

    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((a, b) => a + b, 0);
    return Number((sum / ratings.length).toFixed(1));
  }, [movies]);

  const mostCommonGenre = useMemo(() => {
    const counter = new Map<string, number>();

    movies.forEach((m) => {
      if (!m.genre) return;
      const genre = m.genre.trim().toLowerCase();
      counter.set(genre, (counter.get(genre) ?? 0) + 1);
    });

    let top = "-";
    let max = 0;

    counter.forEach((count, genre) => {
      if (count > max) {
        max = count;
        top = genre;
      }
    });

    return top === "-" ? "-" : top.charAt(0).toUpperCase() + top.slice(1);
  }, [movies]);

  if (loading) {
    return (
      <ProtectedRoute>
        <TopNavLayout>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent mx-auto mb-4" />
            <p className="text-slate-300">Loading statistics...</p>
          </div>
        </TopNavLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <TopNavLayout>
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-700 bg-slate-800/70 backdrop-blur p-6 sm:p-7 shadow-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
              Analytics
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Movie Statistics
            </h1>

            <p className="text-slate-300 mt-2">
              Track your watch progress and collection insights.
            </p>
          </section>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-4">
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Movies"
              value={stats.total}
              tone="slate"
              icon="🎬"
            />

            <StatCard
              title="Want to Watch"
              value={stats.want_to_watch}
              tone="amber"
              icon="📝"
            />

            <StatCard
              title="Watching"
              value={stats.watching}
              tone="blue"
              icon="👀"
            />

            <StatCard
              title="Watched"
              value={stats.watched}
              tone="green"
              icon="✅"
            />
          </section>

          {stats.total > 0 && (
            <>
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <InsightCard
                  label="Completion Rate"
                  value={`${completionRate}%`}
                  helper="Watched / Total movies"
                />

                <InsightCard
                  label="Average Rating"
                  value={avgRating ? `${avgRating}/10` : "-"}
                  helper="From rated movies only"
                />

                <InsightCard
                  label="Top Genre"
                  value={mostCommonGenre}
                  helper="Most frequent in collection"
                />
              </section>

              <section className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg">
                <h2 className="text-white font-semibold mb-4">
                  Progress Breakdown
                </h2>

                <div className="space-y-4">
                  <ProgressRow
                    label="Want to Watch"
                    value={stats.want_to_watch}
                    total={stats.total}
                    barClass="bg-amber-400"
                  />

                  <ProgressRow
                    label="Watching"
                    value={stats.watching}
                    total={stats.total}
                    barClass="bg-blue-400"
                  />

                  <ProgressRow
                    label="Watched"
                    value={stats.watched}
                    total={stats.total}
                    barClass="bg-green-400"
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </TopNavLayout>
    </ProtectedRoute>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: string;
  tone: "slate" | "amber" | "blue" | "green";
}) {
  const toneMap: Record<"slate" | "amber" | "blue" | "green", string> = {
    slate: "border-slate-600 bg-slate-800",
    amber: "border-amber-500/30 bg-amber-500/10",
    blue: "border-blue-500/30 bg-blue-500/10",
    green: "border-green-500/30 bg-green-500/10",
  };

  return (
    <div className={`rounded-xl border p-4 shadow-md ${toneMap[tone]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-300">{title}</p>
        <span className="text-lg">{icon}</span>
      </div>

      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function InsightCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-md">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="text-2xl font-bold text-white mt-1">{value}</p>

      <p className="text-xs text-slate-500 mt-2">{helper}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  barClass,
}: {
  label: string;
  value: number;
  total: number;
  barClass: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>

        <span className="text-slate-400">
          {value} ({pct}%)
        </span>
      </div>

      <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${barClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
