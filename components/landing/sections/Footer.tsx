import React from "react";
import Container from "@/components/landing/Container";

export default function Footer() {
    return (
        <footer className="border-t border-white/5 py-12">
            <Container>
                <div className="flex flex-col items-center justify-center gap-6">
                    <span className="text-lg font-bold tracking-tight text-white/40 hover:text-white/100 transition-opacity duration-500">
                        CNX
                    </span>
                    <p className="text-[10px] text-muted/30 uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} CNX. All rights reserved.
                    </p>
                </div>
            </Container>
        </footer>
    );
}
