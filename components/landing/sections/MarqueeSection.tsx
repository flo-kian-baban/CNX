import React from "react";
import InfiniteMarquee from "@/components/landing/InfiniteMarquee";
import { INDUSTRIES } from "@/data/landing-data";

export default function MarqueeSection() {
    return (
        <section className="py-12">
            <div className="w-full">
                <InfiniteMarquee
                    items={INDUSTRIES.map((name, i) => (
                        <span key={i} className="text-lg sm:text-xl font-semibold tracking-wide whitespace-nowrap">
                            {name}
                        </span>
                    ))}
                />
            </div>
        </section>
    );
}
