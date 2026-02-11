"use client";

import { useState, useTransition, FormEvent, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { createProfileAfterSignUp } from "@/app/(actions)/auth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(urlMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMode(urlMode);
  }, [urlMode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowserClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: nickname ? { nickname: nickname.trim() } : undefined,
        },
      });

      if (signUpError) {
        const msg =
          /rate limit|rate_limit|429/i.test(signUpError.message)
            ? "Too many sign-up emails sent. Please try again in about an hour, or sign in with Google."
            : signUpError.message;
        setError(msg);
        return;
      }

      const user = data.user;
      const session = data.session;

      if (!session && user) {
        setError(
          "Account created. Please check your email to confirm your address, then log in."
        );
        return;
      }

      if (session && user) {
        const profileResult = await createProfileAfterSignUp(nickname || null);
        if (profileResult.error) {
          setError(profileResult.error);
          return;
        }
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const msg =
          /rate limit|rate_limit|429/i.test(signInError.message)
            ? "Too many login attempts. Please try again in about an hour, or sign in with Google."
            : signInError.message;
        setError(msg);
        return;
      }
    }

    startTransition(() => {
      router.push("/");
      router.refresh();
    });
  }

  async function handleGoogleSignIn() {
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (signInError) {
      const msg =
        /rate limit|rate_limit|429/i.test(signInError.message)
          ? "Too many attempts. Please try again later."
          : signInError.message;
      setError(msg);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-md">
      <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm shadow-blue-100">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <button
            type="button"
            onClick={() => {
              const nextMode = mode === "login" ? "signup" : "login";
              setMode(nextMode);
              router.replace(
                nextMode === "signup" ? "/login?mode=signup" : "/login"
              );
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Log in"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nickname
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-xl border border-blue-200 bg-blue-50/30 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-400 focus:bg-white"
                placeholder="Runner123"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-blue-200 bg-blue-50/30 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-400 focus:bg-white"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-blue-200 bg-blue-50/30 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-400 focus:bg-white"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200 disabled:opacity-60"
          >
            {isPending
              ? mode === "login"
                ? "Logging in..."
                : "Creating account..."
              : mode === "login"
              ? "Log in"
              : "Sign up"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-blue-100" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            or
          </span>
          <div className="h-px flex-1 bg-blue-100" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
