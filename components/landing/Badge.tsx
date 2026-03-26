import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

export default function Badge({ children, className = "" }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent shadow-[0_0_15px_-3px_rgba(241,89,40,0.2)] ${className}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(241,89,40,0.8)]" />
            {children}
        </span>
    );
}
