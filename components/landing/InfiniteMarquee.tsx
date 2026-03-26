import React, { ReactNode } from "react";

interface InfiniteMarqueeProps {
    items: ReactNode[];
}

export default function InfiniteMarquee({ items }: InfiniteMarqueeProps) {
    const duplicatedItems = [...items, ...items, ...items, ...items];

    return (
        <div className="relative flex w-full overflow-hidden border-y border-white/5 py-10 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee flex min-w-full items-center gap-24 whitespace-nowrap px-12">
                {duplicatedItems.map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center text-white/50 hover:text-white transition-colors duration-500 grayscale hover:grayscale-0 opacity-80 hover:opacity-100"
                    >
                        {item}
                    </div>
                ))}
            </div>

            {/* Fade Gradients */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
    );
}
