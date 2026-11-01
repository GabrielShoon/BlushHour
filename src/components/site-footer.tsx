import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-2/50 pb-20 md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-ink-soft sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-display text-lg font-semibold text-ink">BlushHour</span> · Made in Singapore for
          people who&apos;d rather plan it themselves.
        </p>
        <p>
          Prices, hours and locations are estimates. Check with the venue before you go.{" "}
          <Link href="/discover" className="font-semibold text-rose underline-offset-4 hover:underline">
            Start exploring
          </Link>
        </p>
      </div>
    </footer>
  );
}
