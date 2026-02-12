"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { SearchAthletes } from "@/components/search-athletes";

type SimpleUser = {
  email: string | null;
  avatarUrl: string | null;
} | null;

const navItems: {
  href: string;
  label: string;
  /** When set, only this decides active state (so only one item can be active for "/") */
  activeWhen?: (pathname: string) => boolean;
}[] = [
  { href: "/", label: "Home", activeWhen: () => false },
  { href: "/", label: "Leaderboard", activeWhen: (p) => p === "/" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SimpleUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const setUserFromAuth = async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null) => {
      if (!authUser) {
        setUser(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", authUser.id)
        .maybeSingle();

      setUser({
        email: authUser.email ?? null,
        avatarUrl:
          profile?.avatar_url ??
          (authUser.user_metadata as { avatar_url?: string } | undefined)?.avatar_url ??
          null,
      });
    };

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await setUserFromAuth(data.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserFromAuth(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 h-[100px] z-50 border-b border-blue-100 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center h-full justify-between gap-4 px-4 py-3">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="RunLeague"
              width={40}
              height={40}
              className="h-20 w-20 object-contain"
            />
            {/* <span className="text-lg font-bold text-slate-900">
              Run<span className="text-blue-600">League</span>
            </span> */}
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const isActive = item.activeWhen
                ? item.activeWhen(pathname)
                : pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-lg px-3.5 py-2 text-lg font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Search */}
        <div className="hidden flex-1 items-center justify-center px-4 md:flex h-full">
          <SearchAthletes />
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
          ) : user ? (
            <>
              <button
                type="button"
                className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                aria-label="Notifications"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
              </button>

              <Link href="/profile" className="shrink-0">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Avatar"
                    width={30}
                    height={30}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-200 hover:ring-blue-400 transition-colors"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {user.email?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg px-3 py-2 text-md font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-md font-bold transition-colors text-slate-500 hover:bg-blue-50 hover:text-blue-700"
              >
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-md font-medium text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200"
              >
                Join now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
