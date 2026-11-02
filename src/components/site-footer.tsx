import Link from "next/link";
import { Logo } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line pb-20 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-ink-soft">
            Date ideas and a planner for Singapore, for people who&apos;d rather put the date together themselves.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <p className="eyebrow mb-1">Plan</p>
          <Link href="/explore" className="hover:text-rose">Date ideas</Link>
          <Link href="/explore?tab=places" className="hover:text-rose">Places</Link>
          <Link href="/plan" className="hover:text-rose">My date</Link>
          <Link href="/saved" className="hover:text-rose">Saved</Link>
        </nav>
        <div className="text-sm text-ink-soft">
          <p className="eyebrow mb-3">Good to know</p>
          <p>Prices, hours and locations are estimates. Check with the venue before you go.</p>
          <p className="mt-2">
            Photos from{" "}
            <a href="https://unsplash.com" className="underline underline-offset-2 hover:text-rose" rel="noopener noreferrer" target="_blank">
              Unsplash
            </a>
            , chosen to set the mood. Not every photo shows the exact venue.
          </p>
        </div>
      </div>
    </footer>
  );
}
