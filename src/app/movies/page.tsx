"use client";

import { Suspense } from "react";
import MoviesPageContent from "./MoviesPageContent";

export default function MoviesPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-slate-300">Loading movies...</div>}
    >
      <MoviesPageContent />
    </Suspense>
  );
}
