"use client";

import React, { useState } from "react";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (i: number) => {
        setOpenIndex(openIndex === i ? null : i);
    };

    return (
        <div className="space-y-4">
            {items.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                    <div
                        key={i}
                        className={`group overflow-hidden rounded-[20px] border transition-all duration-300 ${isOpen
                            ? "border-accent/30 bg-white/[0.03] shadow-glow"
                            : "border-white/5 bg-transparent hover:border-white/10 hover:bg-white/[0.02]"
                            }`}
                    >
                        <button
                            onClick={() => toggle(i)}
                            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors md:px-8"
                        >
                            <span
                                className={`text-lg font-medium transition-colors ${isOpen ? "text-white" : "text-muted hover:text-white"
                                    }`}
                            >
                                {item.question}
                            </span>
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${isOpen
                                    ? "border-accent bg-accent text-white rotate-180"
                                    : "border-white/10 text-muted group-hover:border-white/20 group-hover:text-white"
                                    }`}
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                        <div
                            className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="px-6 pb-6 pt-0 text-base leading-relaxed text-muted/80 md:px-8">
                                {item.answer}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
