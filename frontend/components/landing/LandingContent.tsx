"use client"

import { LandingHeader } from "./LandingHeader"
import { LandingHero } from "./LandingHero"
import { LandingFeatures } from "./LandingFeatures"
import { LandingDetailedFeatures } from "./LandingDetailedFeatures"
import { LandingTestimonials } from "./LandingTestimonials"
import { LandingHowTo } from "./LandingHowTo"
import { LandingTrust } from "./LandingTrust"
import { LandingFAQ } from "./LandingFAQ"
import { LandingCTA } from "./LandingCTA"
import { LandingFooter } from "./LandingFooter"

export function LandingContent({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
            <LandingHeader isLoggedIn={isLoggedIn} />

            <main className="pt-16">
                <LandingHero isLoggedIn={isLoggedIn} />
                <LandingFeatures />
                <LandingDetailedFeatures />
                <LandingTestimonials />
                <LandingHowTo isLoggedIn={isLoggedIn} />
                <LandingTrust />
                <LandingFAQ />
                <LandingCTA isLoggedIn={isLoggedIn} />
            </main>

            <LandingFooter />
        </div>
    )
}
