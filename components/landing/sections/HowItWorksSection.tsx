import React from "react";
import Container from "@/components/landing/Container";
import SectionTitle from "@/components/landing/SectionTitle";
import Badge from "@/components/landing/Badge";
import ScrollReveal from "@/components/landing/ScrollReveal";
import { STEPS } from "@/data/landing-data";

export default function HowItWorksSection() {
    return (
        <section id="how" className="relative scroll-mt-24 py-20 lg:py-32 border-y border-white/5">
            <Container>
                <ScrollReveal>
                    <SectionTitle
                        align="center"
                        badge="How It Works"
                        title="Up and Running in Minutes"
                        subtitle="Three simple steps to your digital business card."
                    />
                </ScrollReveal>

                <div className="mt-24 relative max-w-5xl mx-auto">
                    {/* Desktop Connecting Line */}
                    <div className="absolute top-[32px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
                    <div className="absolute top-[32px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent hidden md:block border-t border-dashed border-accent/40 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]" />

                    {/* Mobile Connecting Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent md:hidden" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-accent/30 to-transparent md:hidden border-l border-dashed border-accent/40 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                        {STEPS.map((step, i) => (
                            <ScrollReveal key={i} className="relative flex flex-col items-center text-center">
                                {/* Node */}
                                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-background border border-white/10 mb-8 shadow-[0_0_30px_-5px_rgba(241,89,40,0.15)] group">
                                    <div className="absolute inset-0 rounded-full border border-accent/20 scale-110 group-hover:scale-125 transition-transform duration-500" />
                                    <div className="h-4 w-4 rounded-full bg-accent animate-pulse shadow-neon" />
                                    <div className="absolute inset-0 rounded-full bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                                </div>

                                {/* Content Card */}
                                <div className="w-full flex-grow flex flex-col items-center text-center p-8 rounded-[24px] border border-white/5 bg-surface/50 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-surface/80 group">
                                    <div className="flex items-center justify-center gap-3 mb-6">
                                        <Badge className="backdrop-blur-md bg-accent/5 border-accent/20 text-accent group-hover:bg-accent/10 group-hover:border-accent/40 group-hover:shadow-neon transition-all duration-300">
                                            STEP {step.number}
                                        </Badge>
                                    </div>

                                    <h3 className="mb-4 text-xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
                                        {step.title}
                                    </h3>

                                    <p className="text-sm leading-relaxed text-muted/70">
                                        {step.description}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
