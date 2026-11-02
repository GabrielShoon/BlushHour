import type { Metadata } from "next";
import { Photo } from "@/components/photo";
import { PHOTOS } from "@/data/photos";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/saved";
  return (
    <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
      <div className="flex justify-center">
        <LoginForm next={next} linkError={sp.error === "link"} initialMode={sp.mode === "signup" ? "signup" : "signin"} />
      </div>
      <div className="photo-grade relative hidden aspect-[4/5] overflow-hidden rounded-card lg:block">
        <Photo photo={PHOTOS.river} sizes="50vw" decorative />
        <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-8 font-display text-4xl text-white">
          Keep every plan, <em>and every favourite,</em> in one place.
        </p>
      </div>
    </div>
  );
}
