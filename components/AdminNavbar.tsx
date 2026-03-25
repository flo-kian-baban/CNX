"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/admin";

// ─────────────────────────────────────────────
// AdminNavbar
// ─────────────────────────────────────────────

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [dropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="admin-navbar sticky top-0 z-50 border-b border-white/[0.06] bg-gray-950/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* ── Left: Logo + Nav ── */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/dashboard/edit" className="group flex items-center gap-0.5">
              <span className="text-xl font-black tracking-widest text-white transition-transform duration-200 group-hover:scale-[1.03]">
                CNX
              </span>
              <span className="text-xl font-black text-[#F15928] transition-transform duration-200 group-hover:scale-110">
                .
              </span>
            </Link>

            {/* Desktop nav pills */}
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/dashboard/edit"
                className={`relative rounded-lg px-3.5 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200 ${
                  pathname.startsWith("/dashboard/edit")
                    ? "bg-[#F15928]/[0.12] text-[#F15928]"
                    : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                Edit Card
                {pathname.startsWith("/dashboard/edit") && (
                  <span className="absolute -bottom-[13px] left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#F15928]" />
                )}
              </Link>

              {/* Separator */}
              <span className="mx-1 h-4 w-px bg-white/[0.08]" />

              {/* View Card — external link */}
              <a
                href={user ? `/card/${user.uid}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold tracking-wide text-gray-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                View Card
                <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Right: User area ── */}
          <div className="flex items-center gap-3">
            {/* User dropdown (desktop) */}
            <div ref={dropdownRef} className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-white/[0.06]"
                aria-label="User menu"
              >
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? "User"}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-white/10 transition-all duration-200 group-hover:ring-[#F15928]/40"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F15928]/15 text-sm font-bold text-[#F15928]">
                    {user?.displayName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <svg
                  className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="dropdown-enter absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-white/[0.08] bg-gray-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
                  {/* User info */}
                  <div className="border-b border-white/[0.06] px-4 py-4">
                    <div className="flex items-center gap-3">
                      {user?.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName ?? "User"}
                          width={40}
                          height={40}
                          className="rounded-full"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F15928]/15 text-base font-bold text-[#F15928]">
                          {user?.displayName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {user?.displayName ?? "User"}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {user?.email ?? ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <Link
                      href="/dashboard/edit"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
                    >
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Edit Card
                    </Link>
                    <a
                      href={user ? `/card/${user.uid}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
                    >
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      View Public Card
                    </a>
                    {isAdmin(user) && (
                      <>
                        <div className="my-1 border-t border-white/[0.06]" />
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#F15928]/80 transition-colors duration-150 hover:bg-[#F15928]/[0.08] hover:text-[#F15928]"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          Admin Panel
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-white/[0.06] p-1.5">
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/80 transition-colors duration-150 hover:bg-red-500/[0.08] hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="mobile-menu-enter fixed inset-0 z-[60] flex flex-col bg-gray-950/98 backdrop-blur-2xl md:hidden">
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between px-6">
            <Link href="/dashboard/edit" className="flex items-center gap-0.5" onClick={() => setMobileOpen(false)}>
              <span className="text-xl font-black tracking-widest text-white">CNX</span>
              <span className="text-xl font-black text-[#F15928]">.</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile nav links */}
          <div className="flex flex-1 flex-col px-6 pt-4">
            {/* User card */}
            {user && (
              <div className="mb-8 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? "User"}
                    width={44}
                    height={44}
                    className="rounded-full ring-2 ring-white/10"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F15928]/15 text-lg font-bold text-[#F15928]">
                    {user.displayName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.displayName ?? "User"}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email ?? ""}</p>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="space-y-1">
              <Link
                href="/dashboard/edit"
                onClick={() => setMobileOpen(false)}
                className={`mobile-link-stagger flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 ${
                  pathname.startsWith("/dashboard/edit")
                    ? "bg-[#F15928]/[0.1] text-[#F15928]"
                    : "text-gray-300 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Edit Card
              </Link>

              {/* View card link */}
              <a
                href={user ? `/card/${user.uid}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="mobile-link-stagger flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-semibold text-gray-300 transition-all duration-200 hover:bg-white/[0.04] hover:text-white"
                style={{ animationDelay: "50ms" }}
              >
                <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                View Public Card
              </a>

              {/* Admin link (admin only) */}
              {isAdmin(user) && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`mobile-link-stagger flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 ${
                    pathname === "/admin"
                      ? "bg-[#F15928]/[0.1] text-[#F15928]"
                      : "text-[#F15928]/70 hover:bg-[#F15928]/[0.06] hover:text-[#F15928]"
                  }`}
                  style={{ animationDelay: "100ms" }}
                >
                  <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Admin Panel
                </Link>
              )}
            </div>

            {/* Sign out at bottom */}
            <div className="mt-auto pb-10 pt-8">
              <button
                onClick={() => { setMobileOpen(false); logout(); }}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-red-400/80 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/[0.06] hover:text-red-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
