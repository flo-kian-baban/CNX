import React from "react";
import Container from "@/components/landing/Container";
import SectionTitle from "@/components/landing/SectionTitle";
import FAQAccordion from "@/components/landing/FAQAccordion";
import ScrollReveal from "@/components/landing/ScrollReveal";
import { FAQ_ITEMS } from "@/data/landing-data";

export default function FAQSection() {
    return (
        <section id="faq" className="scroll-mt-24 py-20 lg:py-32">
            <Container className="max-w-3xl">
                <ScrollReveal>
                    <SectionTitle
                        align="center"
                        badge="FAQ"
                        title="Common Questions"
                        subtitle="Everything you need to know about CNX."
                    />
                </ScrollReveal>

                <ScrollReveal className="mt-16">
                    <FAQAccordion items={FAQ_ITEMS} />
                </ScrollReveal>
            </Container>
        </section>
    );
}
