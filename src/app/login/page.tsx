import type { Metadata } from "next";
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
    <div className="grain flex min-h-[70dvh] items-center justify-center px-4 py-12">
      <LoginForm next={next} linkError={sp.error === "link"} initialMode={sp.mode === "signup" ? "signup" : "signin"} />
    </div>
  );
}
