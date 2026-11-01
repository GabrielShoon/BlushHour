import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-semibold text-rose">404</p>
      <h1 className="mt-4 text-3xl font-semibold">This spot isn&apos;t on the map</h1>
      <p className="mt-2 text-ink-soft">It may have moved or closed. Plenty of other ideas are waiting.</p>
      <Link
        href="/discover"
        className="mt-6 inline-flex h-12 items-center rounded-full bg-rose px-6 font-semibold text-rose-ink"
      >
        Back to Discover
      </Link>
    </div>
  );
}
