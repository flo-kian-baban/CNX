"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/landing/Container";
import Button from "@/components/landing/Button";

const NAV_LINKS = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "FAQ", href: "#faq" },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [compact, setCompact] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            setCompact(window.scrollY > 200);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 768) setMobileOpen(false);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 pt-5 md:pt-6">
            <Container className="max-w-[1280px]">
                {/* Glass pill container */}
                <nav
                    className={`mx-auto relative flex items-center justify-between rounded-full px-5 py-2.5 md:px-6 transition-all duration-700 ${compact ? "max-w-[750px]" : "max-w-[900px]"}`}
                    style={{
                        background: "rgba(255,255,255,0.07)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.06) inset",
                        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    }}
                >
                    {/* Left: Logo */}
                    <a href="/" className="flex-shrink-0 relative z-10">
                        <span className="text-xl font-bold tracking-tight text-white">
                            CNX
                        </span>
                    </a>

                    {/* Center: Nav links (desktop) */}
                    <div className="hidden md:flex flex-1 items-center justify-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="relative px-4 py-2 text-sm font-medium text-white/60 rounded-full transition-all duration-200 hover:text-white hover:bg-white/[0.06]"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Right: CTA */}
                    <div className="flex items-center gap-3 relative z-10">
                        <Button
                            variant="primary"
                            size="sm"
                            href="/login"
                            className="rounded-full px-5 text-sm font-semibold shadow-[0_0_20px_-4px_rgba(241,89,40,0.5)] hover:shadow-[0_0_28px_-4px_rgba(241,89,40,0.65)] hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Get Started
                        </Button>

                        {/* Hamburger (mobile) */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen((v) => !v)}
                            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors duration-200"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" y1="7" x2="20" y2="7" />
                                    <line x1="4" y1="12" x2="20" y2="12" />
                                    <line x1="4" y1="17" x2="20" y2="17" />
                                </svg>
                            )}
                        </button>
                    </div>
                </nav>

                {/* Mobile dropdown */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen
                        ? "max-h-[300px] opacity-100 mt-2"
                        : "max-h-0 opacity-0 mt-0"
                        }`}
                >
                    <div
                        className="flex flex-col gap-1 rounded-2xl px-4 py-4"
                        style={{
                            background: "rgba(255,255,255,0.07)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            boxShadow: "0 8px 32px -8px rgba(0,0,0,0.35)",
                        }}
                    >
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="px-4 py-3 text-sm font-medium text-white/60 rounded-xl transition-all duration-200 hover:text-white hover:bg-white/[0.06]"
                            >
                                {link.label}
                            </a>
                        ))}
                        <a
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="px-4 py-3 text-sm font-medium text-accent rounded-xl transition-all duration-200 hover:text-white hover:bg-white/[0.06]"
                        >
                            Get Started
                        </a>
                    </div>
                </div>
            </Container>
        </header>
    );
}
