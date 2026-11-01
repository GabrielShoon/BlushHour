import type { Metadata } from "next";
import { DatesClient } from "./dates-client";

export const metadata: Metadata = {
  title: "Date ideas",
  description: "Singapore date ideas by mood, occasion and budget. Open any of them in the builder and remix it.",
};

export default function DatesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-semibold sm:text-5xl">Date ideas</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Starting points, not scripts. Pick one that fits your mood, then swap, add or drop stops in the builder.
      </p>
      <DatesClient />
    </div>
  );
}
