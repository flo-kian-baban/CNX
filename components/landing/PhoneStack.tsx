"use client";

import PhoneMock from "./PhoneMock";
import PhoneParallax from "./PhoneParallax";

/**
 * Hero right-side phone stack — NO background panel.
 * Two phones with CSS 3D perspective, pivoted at inner edges to face each other.
 * Mouse-follow parallax adds subtle tilt on desktop.
 */
export default function PhoneStack() {
    return (
        <div
            className="relative w-full max-w-[520px] mx-auto"
            style={{ aspectRatio: "4 / 5" }}
        >
            <PhoneParallax>
                {({ backTransform, frontTransform }) => (
                    <>
                        {/* Subtle ambient glow (not a panel) */}
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                top: "18%",
                                left: "8%",
                                width: "84%",
                                height: "60%",
                                background:
                                    "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(241,90,45,0.05) 0%, transparent 70%)",
                                filter: "blur(50px)",
                            }}
                        />

                        {/* ═══════════════════════════════════════════
                            PHONE A — Back / Left / Larger
                            Pivot at RIGHT edge so it rotates toward center
                        ═══════════════════════════════════════════ */}
                        <div
                            className="absolute"
                            style={{
                                top: "2%",
                                left: "0%",
                                width: "58%",
                                zIndex: 10,
                                transformOrigin: "100% 50%",
                                transform: backTransform,
                                transformStyle: "preserve-3d" as const,
                                backfaceVisibility: "hidden" as const,
                                willChange: "transform",
                            }}
                        >
                            {/* Ambient shadow (wide, soft) */}
                            <div
                                className="absolute pointer-events-none"
                                style={{
                                    bottom: "-8%",
                                    left: "8%",
                                    width: "84%",
                                    height: "20%",
                                    background:
                                        "radial-gradient(ellipse 100% 100% at 55% 50%, rgba(0,0,0,0.30), transparent 70%)",
                                    filter: "blur(22px)",
                                    borderRadius: "50%",
                                }}
                            />
                            {/* Contact shadow (tighter) */}
                            <div
                                className="absolute pointer-events-none"
                                style={{
                                    bottom: "-3%",
                                    left: "15%",
                                    width: "70%",
                                    height: "8%",
                                    background:
                                        "radial-gradient(ellipse 100% 100% at 55% 50%, rgba(0,0,0,0.35), transparent 70%)",
                                    filter: "blur(8px)",
                                    borderRadius: "50%",
                                }}
                            />

                            {/* Glass reflection overlay */}
                            <div className="absolute inset-0 pointer-events-none z-30 rounded-[2.8rem] overflow-hidden">
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 30%, transparent 60%)",
                                    }}
                                />
                            </div>

                            {/* Rim highlight — RIGHT edge (inner-facing) */}
                            <div
                                className="absolute pointer-events-none z-30"
                                style={{
                                    top: "8%",
                                    right: "0",
                                    width: "2px",
                                    height: "84%",
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                                    borderRadius: "1px",
                                    filter: "blur(0.3px)",
                                }}
                            />

                            <PhoneMock variant="back" />
                        </div>

                        {/* ═══════════════════════════════════════════
                            PHONE B — Front / Right / Smaller / Lower
                            Pivot at LEFT edge so it rotates toward center
                        ═══════════════════════════════════════════ */}
                        <div
                            className="absolute"
                            style={{
                                top: "calc(15% + 20px)",
                                right: "-2%",
                                width: "54%",
                                zIndex: 20,
                                transformOrigin: "0% 50%",
                                transform: frontTransform,
                                transformStyle: "preserve-3d" as const,
                                backfaceVisibility: "hidden" as const,
                                willChange: "transform",
                            }}
                        >
                            {/* Ambient shadow (wide, soft — stronger for front) */}
                            <div
                                className="absolute pointer-events-none"
                                style={{
                                    bottom: "-10%",
                                    left: "6%",
                                    width: "88%",
                                    height: "22%",
                                    background:
                                        "radial-gradient(ellipse 100% 100% at 45% 50%, rgba(0,0,0,0.40), transparent 65%)",
                                    filter: "blur(24px)",
                                    borderRadius: "50%",
                                }}
                            />
                            {/* Contact shadow (tighter, darker) */}
                            <div
                                className="absolute pointer-events-none"
                                style={{
                                    bottom: "-4%",
                                    left: "12%",
                                    width: "76%",
                                    height: "10%",
                                    background:
                                        "radial-gradient(ellipse 100% 100% at 45% 50%, rgba(0,0,0,0.45), transparent 65%)",
                                    filter: "blur(10px)",
                                    borderRadius: "50%",
                                }}
                            />

                            {/* Glass reflection overlay */}
                            <div className="absolute inset-0 pointer-events-none z-30 rounded-[2.8rem] overflow-hidden">
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.015) 35%, transparent 65%)",
                                    }}
                                />
                            </div>

                            {/* Rim highlight — LEFT edge (inner-facing) */}
                            <div
                                className="absolute pointer-events-none z-30"
                                style={{
                                    top: "8%",
                                    left: "0",
                                    width: "2px",
                                    height: "84%",
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                                    borderRadius: "1px",
                                    filter: "blur(0.3px)",
                                }}
                            />

                            <PhoneMock variant="front" />
                        </div>
                    </>
                )}
            </PhoneParallax>
        </div>
    );
}
