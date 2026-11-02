"use client";

import { Compass, Heart, House, MapTrifold, UserCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./app-state";

export function Logo() {
  return (
    <Link href="/" className="font-display text-[1.75rem] leading-none tracking-tight" aria-label="BlushHour home">
      Blush<em className="text-rose">Hour</em>
    </Link>
  );
}

function Count({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-rose px-1.5 text-[11px] font-semibold leading-5 text-rose-ink tabular">
      {n}
      <span className="sr-only"> {n === 1 ? "stop" : "stops"}</span>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { draft, user, ready, favorites } = useApp();
  const count = ready ? draft.stops.length : 0;
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const exploreActive = active("/explore") || active("/places") || active("/dates");

  const desktopLink = (on: boolean) =>
    `relative py-2 text-[15px] font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:bg-ink after:transition-transform ${
      on ? "text-ink after:scale-x-100" : "text-ink-soft hover:text-ink after:scale-x-0 hover:after:scale-x-100"
    }`;

  const mobile = [
    { href: "/", label: "Home", icon: House, on: active("/") },
    { href: "/explore", label: "Explore", icon: Compass, on: exploreActive },
    { href: "/plan", label: "My date", icon: MapTrifold, on: active("/plan"), badge: count },
    { href: "/saved", label: "Saved", icon: Heart, on: active("/saved") },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            <Link href="/explore" aria-current={exploreActive ? "page" : undefined} className={desktopLink(exploreActive)}>
              Explore
            </Link>
            <Link href="/plan" aria-current={active("/plan") ? "page" : undefined} className={desktopLink(active("/plan"))}>
              My date
              <Count n={count} />
            </Link>
          </nav>
          <div className="flex items-center justify-end gap-1">
            <Link
              href="/saved"
              aria-label={`Saved${ready && favorites.length ? `, ${favorites.length} favourites` : ""}`}
              aria-current={active("/saved") ? "page" : undefined}
              className={`hidden size-11 place-items-center rounded-full transition hover:bg-surface-2 md:grid ${
                active("/saved") ? "text-rose" : "text-ink"
              }`}
            >
              <Heart size={22} weight={active("/saved") ? "fill" : "regular"} aria-hidden />
            </Link>
            <Link
              href={user ? "/saved" : "/login"}
              className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              {user ? (
                <>
                  <UserCircle size={22} aria-hidden /> <span className="hidden sm:inline">Account</span>
                </>
              ) : (
                "Sign in"
              )}
            </Link>
          </div>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-4">
          {mobile.map(({ href, label, icon: I, on, badge }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                  on ? "text-rose" : "text-ink-soft"
                }`}
              >
                <I size={22} weight={on ? "fill" : "regular"} aria-hidden />
                {label}
                {!!badge && (
                  <span className="absolute right-[calc(50%-20px)] top-2 grid min-w-[18px] place-items-center rounded-full bg-rose px-1 text-[10px] leading-[18px] text-rose-ink tabular">
                    {badge}
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
