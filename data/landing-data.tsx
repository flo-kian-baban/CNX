import React from "react";

/* ─── Features ─────────────────────────────────────────── */

export const FEATURES = [
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>
        ),
        title: "Tap & Share Instantly",
        description: (
            <span className="block max-w-[65%]">NFC-powered digital business cards. One tap and your contact is shared — no apps, no friction. Works with every modern smartphone out of the box.</span>
        ),
        span: "col-span-1 md:col-span-2 lg:col-span-2",
        children: (
            <div className="absolute -top-12 -right-26 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <svg className="h-72 w-72 text-accent/100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
            </div>
        ),
    },
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
        ),
        title: "Fully Customizable Design",
        description:
            "Your brand, your style. Custom colors, photos, bios, social links, and more — all editable in real time from your dashboard.",
        span: "col-span-1 md:col-span-1 lg:col-span-1",
    },
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
        ),
        title: "LinkedIn Auto-Import",
        description:
            "Pull in your professional data from LinkedIn — experience, education, headline — and populate your card instantly. Zero manual entry.",
        span: "col-span-1 md:col-span-1 lg:col-span-1",
    },
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
            </svg>
        ),
        title: "Smart vCard Downloads",
        description: (
            <span className="block max-w-[65%]">Recipients save your contact info directly to their phone with one tap. Full vCard support with photo, links, social profiles, and more — no typing required.</span>
        ),
        span: "col-span-1 md:col-span-2 lg:col-span-2",
        children: (
            <div className="absolute bottom-14 -right-22 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <svg className="h-66 w-66 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.6">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M8 11h8M8 14h5" strokeWidth="0.8" />
                    <circle cx="12" cy="7.5" r="2" strokeWidth="0.8" />
                </svg>
            </div>
        ),
    },
];

/* ─── How It Works Steps ─── */

export const STEPS = [
    {
        number: "01",
        title: "Sign Up in Seconds",
        description: "Create your account with Google Sign-In. No forms, no passwords — you're in instantly and ready to build your card.",
    },
    {
        number: "02",
        title: "Customize Your Card",
        description: "Add your photo, bio, links, and social profiles. Import from LinkedIn or build from scratch. Preview in real time.",
    },
    {
        number: "03",
        title: "Share Everywhere",
        description: "Share via NFC tap, QR code, or direct link. Recipients view your card and save your contact info in one tap.",
    },
];

/* ─── Industries / Use Cases for Marquee ─── */

export const INDUSTRIES = [
    "Tech & Startups",
    "Real Estate",
    "Finance",
    "Creative Agencies",
    "Healthcare",
    "Legal",
    "Consulting",
    "Education",
];

/* ─── FAQ ─── */

export const FAQ_ITEMS = [
    {
        question: "Do I need to download an app?",
        answer:
            "No app needed — ever. CNX cards work via NFC and QR codes. Recipients open your card in their browser. You manage everything from the web dashboard.",
    },
    {
        question: "How does the NFC tap work?",
        answer:
            "When someone taps their phone on your CNX card, it opens your digital business card in their browser instantly. Works with all modern iPhones and Android devices.",
    },
    {
        question: "Can I update my card after creating it?",
        answer:
            "Absolutely. Log in to your dashboard and update your info, links, photo, or design at any time. Changes reflect instantly — no need to reprint anything.",
    },
    {
        question: "Is my data secure?",
        answer:
            "Yes. CNX uses Firebase Authentication and Firestore with strict security rules. Your data is encrypted and only accessible to you.",
    },
    {
        question: "What information can I put on my card?",
        answer:
            "Your name, photo, title, company, bio, phone, email, website, social links, custom links, education, and more. You have full control over what's visible.",
    },
];
