"use client";

import { Eye, EyeSlash, Heart, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

const inputCls =
  "h-12 w-full rounded-xl border border-line bg-bg px-4 text-base text-ink focus:border-rose aria-[invalid=true]:border-danger";

export function LoginForm({
  next,
  linkError,
  initialMode,
}: {
  next: string;
  linkError: boolean;
  initialMode: "signin" | "signup";
}) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(linkError ? "That sign-in link has expired. Please try again." : null);
  const [sent, setSent] = useState(false);

  if (!supabaseConfigured) {
    return (
      <div className="max-w-md rounded-card border border-line bg-surface p-8 shadow-lift">
        <h1 className="text-3xl font-semibold">Accounts aren&apos;t switched on yet</h1>
        <p className="mt-3 text-ink-soft">
          Add <code className="rounded bg-surface-2 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-surface-2 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code className="rounded bg-surface-2 px-1">.env.local</code>, then restart the dev server. In the
          meantime, favourites and dates are saved on this device.
        </p>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    const sb = getSupabase()!;
    setBusy(true);
    if (mode === "signin") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        setError(
          error.message.includes("Invalid login")
            ? "That email and password don't match. Check for typos, or create an account."
            : error.message,
        );
        return;
      }
      router.push(next);
      router.refresh();
    } else {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push(next);
        router.refresh();
      } else {
        setSent(true);
      }
    }
  };

  if (sent) {
    return (
      <div className="rise max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-lift" role="status">
        <Heart size={40} weight="fill" className="mx-auto text-rose" aria-hidden />
        <h1 className="mt-3 text-3xl font-semibold">Check your inbox</h1>
        <p className="mt-2 text-ink-soft">
          We sent a confirmation link to <strong className="text-ink">{email}</strong>. Open it on this device to
          finish signing up.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rise w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-lift sm:p-8"
      aria-describedby={error ? "form-error" : undefined}
    >
      <h1 className="text-4xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-ink-soft">
        {mode === "signin"
          ? "Sign in to see your saved dates on any device."
          : "Save favourites and date plans and pick up where you left off. Anything saved on this device comes with you."}
      </p>

      {error && (
        <p
          id="form-error"
          role="alert"
          className="mt-4 flex gap-2 rounded-xl bg-rose-soft p-3 text-sm font-medium text-ink"
        >
          <WarningCircle size={20} className="shrink-0 text-danger" aria-hidden /> {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="pw-help"
              className={`${inputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-ink-soft hover:text-ink"
            >
              {show ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
            </button>
          </div>
          <p id="pw-help" className="text-xs text-ink-soft">
            At least 8 characters.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 h-12 w-full rounded-full bg-rose font-semibold text-rose-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {mode === "signin" ? "New to BlushHour?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
          className="font-semibold text-rose underline-offset-2 hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
