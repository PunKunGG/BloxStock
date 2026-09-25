import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="not-found">
      <span className="eyebrow">404 · OFF THE SHELVES</span>
      <SearchX size={52} aria-hidden="true" />
      <h1>This fruit got away.</h1>
      <p>
        We couldn’t find that page. There are plenty more fruits to explore.
      </p>
      <Link href="/fruits" className="button button-primary">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to the fruit directory
      </Link>
    </div>
  );
}
