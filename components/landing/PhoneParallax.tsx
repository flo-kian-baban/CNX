"use client";

import React, { useRef, useEffect, useState } from "react";

interface PhoneParallaxProps {
    children: (style: {
        backTransform: string;
        frontTransform: string;
    }) => React.ReactNode;
}

/**
 * Mouse-follow parallax wrapper for the hero phone stack.
 * Tracks cursor position within its bounds and outputs smooth
 * rotateY/rotateX deltas via a render-prop callback.
 *
 * - Desktop only (disabled on touch / mobile).
 * - Respects prefers-reduced-motion.
 * - Uses requestAnimationFrame + lerp for silky-smooth updates.
 * - On mouse leave, smoothly returns to resting pose.
 */
export default function PhoneParallax({ children }: PhoneParallaxProps) {
    const targetRef = useRef({ nx: 0, ny: 0 });
    const currentRef = useRef({ nx: 0, ny: 0 });
    const rafRef = useRef<number>(0);
    const [delta, setDelta] = useState({ rx: 0, ry: 0 });
    const enabledRef = useRef(true);

    // Check for reduced motion + touch device
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        enabledRef.current = !mq.matches && !touch;

        const onChange = () => {
            enabledRef.current = !mq.matches && !touch;
            if (!enabledRef.current) {
                targetRef.current = { nx: 0, ny: 0 };
            }
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    // Attach mouse listeners to the entire hero section (#hero)
    useEffect(() => {
        const hero = document.getElementById("hero");
        if (!hero) return;

        const onMove = (e: MouseEvent) => {
            if (!enabledRef.current) return;
            const rect = hero.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            targetRef.current = {
                nx: Math.max(-1, Math.min(1, nx)),
                ny: Math.max(-1, Math.min(1, ny)),
            };
        };

        const onLeave = () => {
            targetRef.current = { nx: 0, ny: 0 };
        };

        hero.addEventListener("mousemove", onMove);
        hero.addEventListener("mouseleave", onLeave);
        return () => {
            hero.removeEventListener("mousemove", onMove);
            hero.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    // RAF loop with lerp
    useEffect(() => {
        const LERP = 0.07;
        const EPSILON = 0.001;

        const tick = () => {
            const t = targetRef.current;
            const c = currentRef.current;

            c.nx += (t.nx - c.nx) * LERP;
            c.ny += (t.ny - c.ny) * LERP;

            if (Math.abs(c.nx - t.nx) < EPSILON) c.nx = t.nx;
            if (Math.abs(c.ny - t.ny) < EPSILON) c.ny = t.ny;

            const ry = c.nx * 6;
            const rx = -c.ny * 4;

            setDelta((prev) => {
                if (
                    Math.abs(prev.rx - rx) < 0.01 &&
                    Math.abs(prev.ry - ry) < 0.01
                ) {
                    return prev;
                }
                return { rx, ry };
            });

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    // Build transform strings with delta applied on top of base transforms.
    // Back phone gets 85% of delta, front phone gets 100%.
    const backTransform = [
        `rotateY(${20 + delta.ry * 0.85}deg)`,
        `rotateX(2deg)`,
        `translateZ(-20px)`,
    ].join(" ");

    const frontTransform = [
        `rotateY(${-20 + delta.ry}deg)`,
        `rotateX(2deg)`,
        `translateZ(50px)`,
    ].join(" ");

    return (
        <div
            className="absolute inset-0"
            style={{
                perspective: "2000px",
                perspectiveOrigin: "50% 45%",
                transformStyle: "preserve-3d" as const,
            }}
        >
            {children({ backTransform, frontTransform })}
        </div>
    );
}
