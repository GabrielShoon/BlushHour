import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { DateIdeaCard } from "@/components/date-idea-card";
import { Photo } from "@/components/photo";
import { COLLECTIONS, collectionPlaces } from "@/data/collections";
import { PHOTOS } from "@/data/photos";
import { PLACES } from "@/data/places";
import { SUGGESTED_BY_SLUG } from "@/data/suggested-dates";
import { formatSGD, formatTime, itineraryFromSuggestion, schedule } from "@/lib/itinerary";

const EDIT = ["sentosa-sunset-splurge", "make-something-together", "under-fifty-city-lights"];
const MOODS = ["golden-hour", "rainy-day", "make-something", "under-20"];

function ItineraryTicket() {
  const plan = schedule(itineraryFromSuggestion(SUGGESTED_BY_SLUG["clarke-quay-game-night"]));
  return (
    <div className="w-64 rounded-card border border-line bg-surface/95 p-5 shadow-lift backdrop-blur" aria-hidden>
      <p className="eyebrow">Tonight · Clarke Quay</p>
      <ol className="mt-3 space-y-2.5">
        {plan.stops.map((s) => (
          <li key={s.stop.id} className="flex items-baseline gap-3 text-sm">
            <span className="w-14 shrink-0 text-ink-soft tabular">{formatTime(s.start)}</span>
            <span className="font-display text-lg leading-tight">{s.place.name}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 flex justify-between border-t border-line pt-3 text-sm">
        <span className="text-ink-soft">For two</span>
        <span className="font-semibold tabular">{formatSGD(plan.totalCost)}</span>
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:pt-16">
        <div className="rise">
          <p className="eyebrow">Date planning · Singapore</p>
          <h1 className="mt-5 text-[3.4rem] sm:text-7xl xl:text-[5.5rem]">
            The art of an evening, <em className="text-rose">well spent.</em>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-soft">
            Find {PLACES.length} places worth going to, from rooftop dinners to tiny photobooths. Then put them
            together into a date that&apos;s yours.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/explore"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-rose px-7 font-semibold text-rose-ink transition hover:brightness-110"
            >
              Start exploring <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/plan" className="font-medium underline decoration-line underline-offset-[6px] hover:decoration-ink">
              Or build one from scratch
            </Link>
          </div>
        </div>

        <div className="relative mx-auto h-[26rem] w-full max-w-xl sm:h-[34rem]">
          <div className="photo-grade absolute right-0 top-0 h-[88%] w-[78%] overflow-hidden rounded-card">
            <Photo photo={PHOTOS.heroBay} priority sizes="(min-width: 1024px) 40vw, 80vw" />
          </div>
          <div className="photo-grade absolute bottom-0 left-0 hidden h-[44%] w-[42%] overflow-hidden rounded-card border-[6px] border-bg sm:block">
            <Photo photo={PHOTOS.candlelit} sizes="20vw" />
          </div>
          <div className="absolute left-0 top-8 hidden sm:block lg:-left-6">
            <ItineraryTicket />
          </div>
        </div>
      </section>

      {/* The edit */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="edit">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink pt-6">
          <div>
            <p className="eyebrow">The edit</p>
            <h2 id="edit" className="mt-2 text-4xl sm:text-5xl">
              Three dates to steal, <em>then make your own</em>
            </h2>
          </div>
          <Link href="/explore" className="inline-flex items-center gap-1 font-medium hover:text-rose">
            All date ideas <ArrowUpRight size={16} aria-hidden />
          </Link>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
          {EDIT.map((slug, i) => (
            <li key={slug}>
              <DateIdeaCard date={SUGGESTED_BY_SLUG[slug]} index={i} size="lg" sizes="(min-width: 768px) 33vw, 100vw" />
            </li>
          ))}
        </ul>
      </section>

      {/* Moods */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="moods">
        <div className="border-t border-ink pt-6">
          <p className="eyebrow">Start with a mood</p>
          <h2 id="moods" className="mt-2 text-4xl sm:text-5xl">
            What kind of evening is it?
          </h2>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {MOODS.map((slug) => {
            const c = COLLECTIONS.find((x) => x.slug === slug)!;
            return (
              <li key={slug}>
                <Link
                  href={`/explore?tab=places&collection=${slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-card"
                >
                  <Photo photo={c.photo} sizes="(min-width: 1024px) 25vw, 50vw" decorative className="transition duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                    <span className="block font-display text-2xl leading-tight sm:text-3xl">{c.title}</span>
                    <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                      {collectionPlaces(c).length} places
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="how">
        <div className="grid gap-10 border-t border-ink pt-6 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 id="how" className="mt-2 text-4xl sm:text-5xl">
              Not a generator. <em>A sketchbook.</em>
            </h2>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3">
            {[
              ["Find", "Browse places and date ideas. Save the ones you like with the heart."],
              ["Arrange", "Add them to your date, drag them into order and swap anything that isn't quite right."],
              ["Go", "See the timings, the route and what it'll cost for two, then save it for the day."],
            ].map(([title, body], i) => (
              <li key={title}>
                <p className="font-display text-5xl text-rose">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-2xl">{title}</h3>
                <p className="mt-2 text-ink-soft">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
