import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-4 text-5xl">{title}</h1>
      <div className="mt-4 text-ink-soft">{children}</div>
    </div>
  );
}

/** Only admins get past this point; the database enforces it again on every change. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const sb = await getServerSupabase();
  if (!sb) {
    return <Notice title="Accounts aren't set up">Add your Supabase keys to .env.local first.</Notice>;
  }
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: isAdmin, error } = await sb.rpc("is_admin");
  if (error) {
    return (
      <Notice title="Admin isn't set up yet">
        Run <code>supabase/migrations/0003_catalogue.sql</code> and <code>0004_seed.sql</code> in the Supabase SQL
        Editor, then refresh.
      </Notice>
    );
  }
  if (isAdmin !== true) {
    return (
      <Notice title="Not an admin account">
        You&apos;re signed in as {user.email}. Admin access needs the admin email, verified.{" "}
        <Link href="/" className="font-medium text-rose underline underline-offset-4">
          Back home
        </Link>
      </Notice>
    );
  }
  return <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">{children}</div>;
}
