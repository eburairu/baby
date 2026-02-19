"use client"

import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"

export default function TestLoadingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-12 bg-gray-50 dark:bg-gray-900 p-8">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Feature Branch Design Test</h1>
                <p className="text-gray-500">Verifying unique IDs on feat/loading-animation-v3</p>
            </div>

            <div className="flex flex-wrap gap-12 justify-center items-center">
                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                    <BabyBottleLoading className="w-24 h-24" />
                    <span className="text-xs text-gray-400 font-medium">Default</span>
                </div>

                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                    <BabyBottleLoading className="w-16 h-16" />
                    <span className="text-xs text-gray-400 font-medium">Small</span>
                </div>

                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                    <BabyBottleLoading className="w-32 h-32" />
                    <span className="text-xs text-gray-400 font-medium">Large</span>
                </div>
            </div>
        </div>
    )
}
