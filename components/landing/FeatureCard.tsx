import React from "react";

interface FeatureCardProps {
    title: string;
    description: React.ReactNode;
    icon: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export default function FeatureCard({
    title,
    description,
    icon,
    children,
    className = "",
}: FeatureCardProps) {
    return (
        <div
            className={`group relative overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.02] p-6 md:p-8 transition-all duration-500 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-glow hover:-translate-y-1 ${className}`}
        >
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-accent shadow-surface ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-white group-hover:ring-accent/50">
                    {icon}
                </div>

                <h3 className="mb-3 text-xl font-bold text-foreground tracking-tight group-hover:text-white transition-colors">
                    {title}
                </h3>

                <p className="text-base leading-relaxed text-muted/80 group-hover:text-muted transition-colors">
                    {description}
                </p>

                {children && <div className="mt-auto pt-6">{children}</div>}
            </div>
        </div>
    );
}
