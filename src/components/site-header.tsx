"use client";

import {
  BookmarkSimple,
  Compass,
  Heart,
  MapTrifold,
  SignIn,
  Sparkle,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./app-state";

const NAV = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/dates", label: "Date ideas", icon: Sparkle },
  { href: "/plan", label: "My date", icon: MapTrifold },
  { href: "/saved", label: "Saved", icon: BookmarkSimple },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
      <span className="grid size-9 place-items-center rounded-full bg-rose text-rose-ink">
        <Heart size={18} weight="fill" aria-hidden />
      </span>
      BlushHour
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { draft, user, ready } = useApp();
  const count = ready ? draft.stops.length : 0;
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={active(href) ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-surface-2 ${
                  active(href) ? "bg-surface-2 text-ink" : "text-ink-soft"
                }`}
              >
                {label}
                {href === "/plan" && count > 0 && (
                  <span className="ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-rose px-1.5 text-xs text-rose-ink tabular">
                    {count}
                    <span className="sr-only"> stops</span>
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <Link
            href={user ? "/saved" : "/login"}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition hover:border-rose"
          >
            {user ? <UserCircle size={20} aria-hidden /> : <SignIn size={20} aria-hidden />}
            <span>{user ? "Account" : "Sign in"}</span>
          </Link>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV.map(({ href, label, icon: I }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={active(href) ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                  active(href) ? "text-rose" : "text-ink-soft"
                }`}
              >
                <I size={24} weight={active(href) ? "fill" : "regular"} aria-hidden />
                {label}
                {href === "/plan" && count > 0 && (
                  <span className="absolute right-[calc(50%-22px)] top-2 grid min-w-5 place-items-center rounded-full bg-rose px-1 text-[11px] text-rose-ink tabular">
                    {count}
                    <span className="sr-only"> stops</span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
