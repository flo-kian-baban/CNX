"use client";

import React from "react";

interface PhoneMockProps {
    variant: "back" | "front";
    className?: string;
    screenContent?: React.ReactNode;
}

/**
 * A photorealistic SVG iPhone mockup.
 * Renders frame, bezel, notch/Dynamic Island, screen area, reflection, and metallic edge.
 * The `screenContent` prop renders inside the screen via foreignObject.
 */
export default function PhoneMock({
    variant,
    className = "",
    screenContent,
}: PhoneMockProps) {
    const id = variant; // unique prefix for SVG defs

    return (
        <div className={`relative ${className}`}>
            {/* Soft drop shadow behind the device */}
            <div
                className="absolute inset-0 translate-y-3 scale-[0.92]"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 80%, rgba(0,0,0,0.55), transparent 70%)",
                    filter: "blur(18px)",
                    borderRadius: "2.4rem",
                }}
            />

            <svg
                viewBox="0 0 280 580"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative w-full h-auto"
            >
                <defs>
                    {/* Metallic edge gradient */}
                    <linearGradient
                        id={`${id}-edge`}
                        x1="0"
                        y1="0"
                        x2="280"
                        y2="580"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor="#555" />
                        <stop offset="30%" stopColor="#333" />
                        <stop offset="50%" stopColor="#555" />
                        <stop offset="70%" stopColor="#2a2a2a" />
                        <stop offset="100%" stopColor="#444" />
                    </linearGradient>

                    {/* Inner bezel gradient */}
                    <linearGradient
                        id={`${id}-bezel`}
                        x1="140"
                        y1="0"
                        x2="140"
                        y2="580"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor="#1a1a1e" />
                        <stop offset="100%" stopColor="#111114" />
                    </linearGradient>

                    {/* Glass reflection gradient */}
                    <linearGradient
                        id={`${id}-reflection`}
                        x1="140"
                        y1="0"
                        x2="140"
                        y2="580"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor="white" stopOpacity="0.08" />
                        <stop offset="35%" stopColor="white" stopOpacity="0.02" />
                        <stop offset="65%" stopColor="white" stopOpacity="0" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.03" />
                    </linearGradient>

                    {/* Screen clip */}
                    <clipPath id={`${id}-screenClip`}>
                        <rect x="12" y="12" width="256" height="556" rx="32" ry="32" />
                    </clipPath>

                    {/* Diagonal highlight sweep */}
                    <linearGradient
                        id={`${id}-diagonal-sweep`}
                        x1="0"
                        y1="0"
                        x2="280"
                        y2="580"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor="white" stopOpacity="0.06" />
                        <stop offset="20%" stopColor="white" stopOpacity="0" />
                        <stop offset="80%" stopColor="white" stopOpacity="0" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.02" />
                    </linearGradient>

                    {/* Top-left edge highlight */}
                    <linearGradient
                        id={`${id}-edge-highlight`}
                        x1="0"
                        y1="0"
                        x2="280"
                        y2="290"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                        <stop offset="40%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* ── OUTER FRAME (metallic edge) ── */}
                <rect
                    x="0.5"
                    y="0.5"
                    width="279"
                    height="579"
                    rx="44"
                    ry="44"
                    fill={`url(#${id}-edge)`}
                    stroke="#444"
                    strokeWidth="0.3"
                />

                {/* Highlight stroke on top edge (metallic shine) */}
                <rect
                    x="1"
                    y="1"
                    width="278"
                    height="578"
                    rx="43.5"
                    ry="43.5"
                    fill="none"
                    stroke="white"
                    strokeOpacity="0.1"
                    strokeWidth="0.5"
                />

                {/* ── INNER BEZEL ── */}
                <rect
                    x="6"
                    y="6"
                    width="268"
                    height="568"
                    rx="38"
                    ry="38"
                    fill={`url(#${id}-bezel)`}
                />

                {/* ── SCREEN AREA ── */}
                <rect
                    x="12"
                    y="12"
                    width="256"
                    height="556"
                    rx="32"
                    ry="32"
                    fill="#0d0d12"
                />

                {/* Glass inset border (screen edge) */}
                <rect
                    x="12"
                    y="12"
                    width="256"
                    height="556"
                    rx="32"
                    ry="32"
                    fill="none"
                    stroke="white"
                    strokeOpacity="0.04"
                    strokeWidth="0.5"
                />

                {/* Screen content via foreignObject */}
                <foreignObject
                    x="12"
                    y="12"
                    width="256"
                    height="556"
                    clipPath={`url(#${id}-screenClip)`}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            borderRadius: "32px",
                            background: variant === "back"
                                ? "linear-gradient(160deg, #13151a 0%, #1a1c24 50%, #0d0e14 100%)"
                                : "linear-gradient(160deg, #111318 0%, #191c22 50%, #0c0e12 100%)",
                        }}
                    >
                        {screenContent || <DefaultScreenContent variant={variant} />}
                    </div>
                </foreignObject>

                {/* ── DYNAMIC ISLAND (pill cutout) ── */}
                <rect
                    x="105"
                    y="18"
                    width="70"
                    height="22"
                    rx="11"
                    ry="11"
                    fill="#000"
                />
                {/* Subtle ring around the pill */}
                <rect
                    x="104.5"
                    y="17.5"
                    width="71"
                    height="23"
                    rx="11.5"
                    ry="11.5"
                    fill="none"
                    stroke="#222"
                    strokeWidth="0.5"
                />

                {/* ── GLASS REFLECTION ── */}
                <rect
                    x="12"
                    y="12"
                    width="256"
                    height="556"
                    rx="32"
                    ry="32"
                    fill={`url(#${id}-reflection)`}
                />

                {/* Diagonal highlight sweep for extra realism */}
                <rect
                    x="12"
                    y="12"
                    width="256"
                    height="556"
                    rx="32"
                    ry="32"
                    fill={`url(#${id}-diagonal-sweep)`}
                    opacity="0.4"
                />

                {/* Top-left edge highlight on frame */}
                <rect
                    x="0.5"
                    y="0.5"
                    width="279"
                    height="579"
                    rx="44"
                    ry="44"
                    fill={`url(#${id}-edge-highlight)`}
                />

                {/* Side button details */}
                {/* Power button (right side) */}
                <rect x="279" y="140" width="1.5" height="50" rx="0.75" fill="#444" />
                {/* Volume Up (left side) */}
                <rect x="-0.5" y="130" width="1.5" height="30" rx="0.75" fill="#444" />
                {/* Volume Down (left side) */}
                <rect x="-0.5" y="170" width="1.5" height="30" rx="0.75" fill="#444" />
                {/* Silent switch (left side) */}
                <rect x="-0.5" y="105" width="1.5" height="16" rx="0.75" fill="#444" />
            </svg>
        </div>
    );
}

/* ── Default placeholder screen UI ── */
function DefaultScreenContent({ variant }: { variant: "back" | "front" }) {
    if (variant === "back") {
        return (
            <div className="flex flex-col h-full p-5 pt-12 gap-3">
                {/* Status bar */}
                <div className="flex justify-between items-center px-1 mb-2">
                    <div className="w-8 h-2 rounded-full bg-white/20" />
                    <div className="flex gap-1">
                        <div className="w-4 h-2 rounded-sm bg-white/15" />
                        <div className="w-3 h-2 rounded-sm bg-white/15" />
                        <div className="w-5 h-2 rounded-full bg-white/15" />
                    </div>
                </div>
                {/* Header */}
                <div className="w-24 h-3 rounded bg-white/25 mb-1" />
                <div className="w-36 h-5 rounded bg-white/12" />
                {/* Card */}
                <div className="mt-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <div className="w-16 h-3 rounded bg-accent/40" />
                        <div className="w-8 h-3 rounded bg-white/10" />
                    </div>
                    <div className="w-full h-20 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5" />
                    <div className="flex gap-2">
                        <div className="flex-1 h-3 rounded bg-white/8" />
                        <div className="flex-1 h-3 rounded bg-white/8" />
                    </div>
                </div>
                {/* List items */}
                <div className="mt-2 flex flex-col gap-2.5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
                            <div className="flex-1 flex flex-col gap-1.5">
                                <div className="w-3/4 h-2.5 rounded bg-white/12" />
                                <div className="w-1/2 h-2 rounded bg-white/6" />
                            </div>
                            <div className="w-10 h-5 rounded-full bg-accent/15" />
                        </div>
                    ))}
                </div>
                {/* Bottom nav */}
                <div className="mt-auto flex justify-around pt-3 border-t border-white/[0.06]">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className={`w-5 h-5 rounded-md ${i === 1 ? "bg-accent/40" : "bg-white/10"}`} />
                            <div className="w-6 h-1.5 rounded bg-white/8" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Front phone — review/rating screen
    return (
        <div className="flex flex-col h-full p-5 pt-12 gap-3">
            {/* Status bar */}
            <div className="flex justify-between items-center px-1 mb-2">
                <div className="w-8 h-2 rounded-full bg-white/20" />
                <div className="flex gap-1">
                    <div className="w-4 h-2 rounded-sm bg-white/15" />
                    <div className="w-3 h-2 rounded-sm bg-white/15" />
                    <div className="w-5 h-2 rounded-full bg-white/15" />
                </div>
            </div>
            {/* Header */}
            <div className="w-20 h-3 rounded bg-white/20 mb-2" />
            {/* Rating area */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`w-6 h-6 rounded-sm ${i <= 4 ? "bg-accent/50" : "bg-white/10"}`}
                        />
                    ))}
                </div>
                <div className="w-28 h-2.5 rounded bg-white/12 mt-1" />
                <div className="w-full h-16 rounded-lg bg-white/[0.03] border border-white/[0.05]" />
            </div>
            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 mt-1">
                {["Great service", "Fast delivery", "Quality"].map((label, i) => (
                    <div
                        key={i}
                        className="px-3 py-1.5 rounded-full border border-accent/20 bg-accent/[0.06]"
                    >
                        <div
                            className="h-2 rounded bg-accent/30"
                            style={{ width: `${label.length * 5}px` }}
                        />
                    </div>
                ))}
            </div>
            {/* Submit area */}
            <div className="mt-3 flex flex-col gap-2">
                <div className="w-full h-10 rounded-xl bg-accent/30" />
                <div className="w-32 h-2 rounded bg-white/8 mx-auto" />
            </div>
            {/* Bottom spacer */}
            <div className="mt-auto flex justify-around pt-3 border-t border-white/[0.06]">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-5 h-5 rounded-md ${i === 2 ? "bg-accent/40" : "bg-white/10"}`} />
                        <div className="w-6 h-1.5 rounded bg-white/8" />
                    </div>
                ))}
            </div>
        </div>
    );
}
