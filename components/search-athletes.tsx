"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CountryFlag } from "@/components/country-flag";

type AthleteHit = {
  id: string;
  nickname: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
};

function displayName(a: AthleteHit): string {
  if (a.nickname?.trim()) return a.nickname.trim();
  const first = a.first_name?.trim() ?? "";
  const last = a.last_name?.trim() ?? "";
  return [first, last].filter(Boolean).join(" ") || "Runner";
}

export function SearchAthletes() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<AthleteHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchAthletes = useCallback(async (q: string) => {
    if (!q.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search/athletes?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setHits(data.athletes ?? []);
      setSelectedIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setHits([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchAthletes(query);
      setOpen(true);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchAthletes]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && (hits.length > 0 || loading);

  return (
    <div className="relative w-full max-w-sm" ref={containerRef}>
      <div className="flex w-full items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm transition-colors focus-within:border-blue-400 focus-within:bg-white">
        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={(e) => {
            if (!showDropdown) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSelectedIndex((i) => (i + 1) % Math.max(1, hits.length));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSelectedIndex((i) => (i - 1 + hits.length) % Math.max(1, hits.length));
            } else if (e.key === "Enter" && hits[selectedIndex]) {
              e.preventDefault();
              window.location.href = `/runner/${hits[selectedIndex].id}`;
            }
          }}
          placeholder="Search runners..."
          className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-athletes-list"
          id="search-athletes-input"
        />
        {query && (
          <kbd className="rounded border border-blue-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
            ↵
          </kbd>
        )}
      </div>

      {showDropdown && (
        <ul
          id="search-athletes-list"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-xl border border-blue-200 bg-white py-2 shadow-lg"
        >
          {loading ? (
            <li className="px-4 py-3 text-sm text-slate-500">Searching...</li>
          ) : hits.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No runners found.</li>
          ) : (
            hits.map((athlete, i) => (
              <li key={athlete.id} role="option" aria-selected={i === selectedIndex}>
                <Link
                  href={`/runner/${athlete.id}`}
                  className={`flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selectedIndex ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  {athlete.avatar_url ? (
                    <Image
                      src={athlete.avatar_url}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {displayName(athlete)[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900">
                      {displayName(athlete)}
                    </span>
                    {(athlete.first_name || athlete.last_name) && athlete.nickname && (
                      <span className="block truncate text-xs text-slate-500">
                        {[athlete.first_name, athlete.last_name].filter(Boolean).join(" ")}
                      </span>
                    )}
                  </div>
                  {athlete.country_code && (
                    <CountryFlag code={athlete.country_code} size="sm" />
                  )}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
