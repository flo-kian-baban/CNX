import React from "react";
import Badge from "./Badge";

interface SectionTitleProps {
    badge?: string;
    title: string;
    subtitle?: string;
    align?: "left" | "center";
}

export default function SectionTitle({
    badge,
    title,
    subtitle,
    align = "left",
}: SectionTitleProps) {
    return (
        <div className={`flex flex-col gap-4 ${align === "center" ? "items-center text-center" : "items-start text-left"}`}>
            {badge && (
                <Badge className="mb-2 backdrop-blur-md bg-accent/5 border-accent/20 text-accent hover:bg-accent/10 hover:border-accent/40 hover:shadow-neon transition-all duration-300">
                    {badge}
                </Badge>
            )}

            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-sm">
                {title}
            </h2>

            {subtitle && (
                <p className="max-w-xl text-base sm:text-lg text-muted/80 leading-relaxed">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
