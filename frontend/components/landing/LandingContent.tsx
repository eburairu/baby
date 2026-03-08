"use client"

import { LandingHeader } from "./LandingHeader"
import { LandingHero } from "./LandingHero"
import { LandingFeatures } from "./LandingFeatures"
import { LandingDetailedFeatures } from "./LandingDetailedFeatures"
import { LandingHowTo } from "./LandingHowTo"
import { LandingTrust } from "./LandingTrust"
import { LandingFAQ } from "./LandingFAQ"
import { LandingCTA } from "./LandingCTA"
import { LandingColumnTeaser } from "./LandingColumnTeaser"
import { LandingFooter } from "./LandingFooter"

export function LandingContent({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden transition-colors duration-300">
            <LandingHeader isLoggedIn={isLoggedIn} />

            <main className="pt-16">
                <LandingHero isLoggedIn={isLoggedIn} />
                <LandingFeatures />
                <LandingDetailedFeatures />
                <LandingHowTo isLoggedIn={isLoggedIn} />
                <LandingTrust />
                <LandingColumnTeaser />
                <LandingFAQ />
                <LandingCTA isLoggedIn={isLoggedIn} />
            </main>

            <LandingFooter />
        </div>
    )
}
