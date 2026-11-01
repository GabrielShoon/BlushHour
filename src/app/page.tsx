import {
  ArrowRight,
  ArrowsDownUp,
  Compass,
  CurrencyCircleDollar,
  MagnifyingGlass,
  MapPin,
  Shuffle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { DateIdeaCard } from "@/components/date-idea-card";
import { CategoryIcon, HUE_BG } from "@/components/icons";
import { CATEGORIES } from "@/data/categories";
import { PLACES } from "@/data/places";
import { SUGGESTED_DATES } from "@/data/suggested-dates";
import { formatSGD, formatTime, schedule, itineraryFromSuggestion } from "@/lib/itinerary";

function HeroCollage() {
  const sample = itineraryFromSuggestion(SUGGESTED_DATES[0]);
  const { stops, totalCost } = schedule(sample);
  const tilts = ["-3deg", "2deg", "-1.5deg"];
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div className="absolute -left-6 -top-6 size-40 rounded-full bg-gold/60 blur-2xl" />
      <div className="absolute -bottom-8 -right-4 size-48 rounded-full bg-rose/30 blur-3xl" />
      <ol className="relative flex flex-col gap-3">
        {stops.map((s, i) => (
          <li
            key={s.stop.id}
            className="float flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-lift"
            style={{ ["--r" as string]: tilts[i % 3], animationDelay: `${i * 0.6}s` }}
          >
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${HUE_BG[["rose", "gold", "plum"][i % 3] as "rose"]}`}
            >
              <CategoryIcon id={s.place.category} size={26} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft tabular">
                {formatTime(s.start)}
              </p>
              <p className="truncate font-display text-lg font-semibold">{s.place.name}</p>
            </div>
            <ArrowsDownUp size={20} className="text-ink-soft" />
          </li>
        ))}
      </ol>
      <div className="relative mt-4 flex items-center justify-between rounded-full bg-ink px-5 py-3 text-sm text-bg shadow-lift">
        <span className="flex items-center gap-2">
          <MapPin size={18} weight="fill" /> Sentosa · 3 stops
        </span>
        <span className="font-semibold tabular">{formatSGD(totalCost)} for 2</span>
      </div>
    </div>
  );
}

export default function Home() {
  const counts = Object.fromEntries(
    CATEGORIES.map((c) => [c.id, PLACES.filter((p) => p.category === c.id).length]),
  );
  const featured = SUGGESTED_DATES.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold text-ink-soft">
              <span className="size-2 rounded-full bg-rose" /> Date planning for Singapore
            </p>
            <h1 className="mt-5 text-5xl font-semibold sm:text-6xl lg:text-7xl">
              Don&apos;t get handed a date.{" "}
              <em className="font-medium text-rose" style={{ fontVariationSettings: '"SOFT" 100' }}>
                Make one.
              </em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              Browse {PLACES.length}+ activities, hidden gems and food spots, then mix them into a date that&apos;s
              yours. Swap, reorder and see the timings, map and total cost as you go.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/discover"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-rose px-6 font-semibold text-rose-ink shadow-card transition hover:brightness-110"
              >
                Start exploring <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
              <Link
                href="/dates"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-6 font-semibold transition hover:border-rose"
              >
                Get inspired
              </Link>
            </div>
          </div>
          <HeroCollage />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-semibold sm:text-4xl">Your date, your way</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          No chatbot or fixed itinerary. You get the pieces and a builder to put them together.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: MagnifyingGlass,
              title: "Discover",
              body: "Search and filter by vibe, area, budget and time of day. Heart the ones you like.",
            },
            {
              icon: Shuffle,
              title: "Mix & customise",
              body: "Add stops, drag them into order, swap for something nearby, and adjust how long you stay.",
            },
            {
              icon: CurrencyCircleDollar,
              title: "Organise",
              body: "See start times, travel between stops, a route map and the total cost for both of you.",
            },
          ].map(({ icon: I, title, body }, i) => (
            <li key={title} className="rounded-card border border-line bg-surface p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-rose-soft text-rose">
                  <I size={22} weight="bold" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-ink-soft tabular">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
              <p className="mt-2 text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Categories bento */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">What are you in the mood for?</h2>
            <p className="mt-2 text-ink-soft">Activities and food spots, from tall ships to tiny photobooths.</p>
          </div>
          <Link
            href="/discover"
            className="hidden shrink-0 items-center gap-1 font-semibold text-rose hover:underline sm:inline-flex"
          >
            See everything <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.filter((c) => counts[c.id] > 0).map((c, i) => (
            <li key={c.id} className={i === 0 ? "col-span-2 row-span-2 sm:col-span-1 lg:col-span-2" : ""}>
              <Link
                href={`/discover?category=${c.id}`}
                className={`group flex h-full min-h-28 flex-col justify-between rounded-card p-4 transition hover:-translate-y-0.5 hover:shadow-lift ${HUE_BG[c.hue]}`}
              >
                <CategoryIcon id={c.id} size={i === 0 ? 40 : 28} className="text-ink" />
                <div>
                  <p className={`font-display font-semibold ${i === 0 ? "text-3xl" : "text-lg"}`}>{c.label}</p>
                  <p className="text-sm text-ink-soft tabular">{counts[c.id]} spots</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Date ideas */}
      <section className="bg-surface-2/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">Need a starting point?</h2>
              <p className="mt-2 max-w-2xl text-ink-soft">
                These date ideas are starting points. Open any of them in the builder and make it your own.
              </p>
            </div>
            <Link
              href="/dates"
              className="hidden shrink-0 items-center gap-1 font-semibold text-rose hover:underline sm:inline-flex"
            >
              All date ideas <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featured.map((d) => (
              <DateIdeaCard key={d.slug} date={d} />
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <Compass size={40} className="mx-auto text-rose" aria-hidden />
        <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">Not another AI date generator.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">
          The best dates have a bit of both of you in them. BlushHour gives you real places, honest notes and a builder, and leaves the choices to you.
        </p>
        <Link
          href="/plan"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-bg transition hover:bg-rose hover:text-rose-ink"
        >
          Open the date builder <ArrowRight size={18} weight="bold" aria-hidden />
        </Link>
      </section>
    </>
  );
}
