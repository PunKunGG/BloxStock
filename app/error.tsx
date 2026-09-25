"use client";

import Link from "next/link";
import { AlertCircle, RotateCw } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="not-found">
      <AlertCircle size={48} aria-hidden="true" />
      <h1>A small interruption.</h1>
      <p>We couldn’t load this page. Give it another try.</p>
      <button className="button button-primary" onClick={reset}>
        <RotateCw size={16} />
        Try again
      </button>
      <Link className="text-link" href="/">
        Back to current stock
      </Link>
    </div>
  );
}
