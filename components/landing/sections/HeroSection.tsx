import React from "react";
import Container from "@/components/landing/Container";
import Button from "@/components/landing/Button";
import ScrollReveal from "@/components/landing/ScrollReveal";
import PhoneStack from "@/components/landing/PhoneStack";

export default function HeroSection() {
    return (
        <section id="hero" className="relative overflow-hidden pb-16 pt-24 lg:pb-32 lg:pt-40">
            {/* Grid Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <Container className="relative z-10">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-12 items-center">
                    {/* LEFT COLUMN: Content */}
                    <div className="flex flex-col items-start text-left max-w-2xl relative z-10">
                        <ScrollReveal>
                            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 mb-8 backdrop-blur-md">
                                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent">Now Live</span>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal className="delay-100">
                            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl mb-8 drop-shadow-lg">
                                Your Identity.
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent to-white opacity-90 mt-2">
                                    One Tap Away.
                                </span>
                            </h1>
                        </ScrollReveal>

                        <ScrollReveal className="delay-200">
                            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-10 max-w-lg font-light">
                                Create stunning digital business cards in minutes. Share via NFC, QR code, or link.
                                Import from LinkedIn. Save contacts instantly.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal className="delay-300 flex flex-col gap-8 w-full sm:w-auto">
                            {/* CTAs */}
                            <div className="flex flex-wrap gap-5">
                                <Button variant="primary" size="lg" href="/login" className="px-10 h-14 text-lg font-semibold tracking-wide shadow-neon hover:shadow-[0_0_40px_-5px_rgba(241,89,40,0.5)] transition-all duration-300">
                                    Get Started Free
                                </Button>
                                <Button variant="secondary" size="lg" href="#features" className="px-8 h-14 text-lg border-white/10 hover:bg-white/5 hover:border-white/20">
                                    Learn More
                                </Button>
                            </div>

                            {/* Trust bullets */}
                            <div className="flex flex-wrap items-center gap-6 text-xs font-medium tracking-wide text-muted/60 uppercase">
                                <span className="flex items-center gap-2 hover:text-white transition-colors">
                                    <span className="h-1 w-1 bg-accent" />
                                    No App Required
                                </span>
                                <span className="flex items-center gap-2 hover:text-white transition-colors">
                                    <span className="h-1 w-1 bg-accent" />
                                    Free to Start
                                </span>
                                <span className="flex items-center gap-2 hover:text-white transition-colors">
                                    <span className="h-1 w-1 bg-accent" />
                                    Instant Setup
                                </span>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* RIGHT COLUMN: Visual Panel (PHONES) */}
                    <div className="relative h-[450px] sm:h-[550px] lg:h-[600px] w-full flex items-center justify-center lg:justify-end perspective-[2000px]">
                        {/* Spotlight Effect placed directly behind the phones */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square bg-accent/20 blur-[100px] sm:blur-[120px] rounded-full animate-pulse-glow -z-10" />
                        <PhoneStack />
                    </div>
                </div>
            </Container>
        </section>
    );
}
