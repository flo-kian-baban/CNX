import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
    href?: string;
}

export default function Button({
    variant = "primary",
    size = "md",
    children,
    className = "",
    href,
    ...props
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary:
            "bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_-5px_rgba(241,89,40,0.4)] hover:shadow-[0_0_25px_-5px_rgba(241,89,40,0.6)] border border-transparent hover:-translate-y-0.5",
        secondary:
            "bg-white/5 text-foreground border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5",
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3 text-base",
    };

    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

    if (href) {
        // Use Next.js Link for internal routes, <a> for hash links
        if (href.startsWith("#")) {
            return (
                <a href={href} className={classes}>
                    {children}
                </a>
            );
        }
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}
