"use client"

import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { useState } from "react"

export default function TestLoadingPage() {
    const [isDark, setIsDark] = useState(false)
    const [bgColor, setBgColor] = useState("bg-gray-50")

    const toggleColor = (bg: string, dark: boolean) => {
        setBgColor(bg)
        setIsDark(dark)
    }

    return (
        <div className={`${isDark ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
            <div className={`min-h-screen flex flex-col items-center gap-12 p-8 ${isDark ? 'bg-zinc-950' : bgColor}`}>
                <div className="space-y-4 text-center mt-8">
                    <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>BabyBottleLoading Debugger</h1>
                    <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>このページでプレビューしながら <code>baby-bottle-loading.tsx</code> を編集してください。</p>
                    
                    <div className="flex gap-2 justify-center mt-4">
                        <button onClick={() => toggleColor("bg-white", false)} className="px-3 py-1 text-xs rounded border bg-white text-black">White</button>
                        <button onClick={() => toggleColor("bg-zinc-100", false)} className="px-3 py-1 text-xs rounded border bg-zinc-100 text-black">Light Gray</button>
                        <button onClick={() => toggleColor("bg-zinc-900", true)} className="px-3 py-1 text-xs rounded border bg-zinc-900 text-white">Dark Gray</button>
                        <button onClick={() => toggleColor("bg-black", true)} className="px-3 py-1 text-xs rounded border bg-black text-white">Pure Black</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
                    {/* Size Variations */}
                    <div className={`flex flex-col items-center gap-6 p-10 rounded-3xl backdrop-blur-sm border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/50 border-black/5'}`}>
                        <h2 className={`text-sm font-semibold uppercase tracking-wider opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>Sizes</h2>
                        <div className="flex items-end gap-8">
                            <div className="flex flex-col items-center gap-2">
                                <BabyBottleLoading className={`w-12 h-12 ${isDark ? 'text-white' : 'text-gray-800'}`} />
                                <span className={`text-[10px] opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>Small</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <BabyBottleLoading className={`w-20 h-20 ${isDark ? 'text-white' : 'text-gray-800'}`} />
                                <span className={`text-[10px] opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>Medium</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <BabyBottleLoading className={`w-32 h-32 ${isDark ? 'text-white' : 'text-gray-800'}`} />
                                <span className={`text-[10px] opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>Large</span>
                            </div>
                        </div>
                    </div>

                    {/* Color Variations */}
                    <div className={`flex flex-col items-center gap-6 p-10 rounded-3xl backdrop-blur-sm border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/50 border-black/5'}`}>
                        <h2 className={`text-sm font-semibold uppercase tracking-wider opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>Colors</h2>
                        <div className="flex flex-wrap justify-center gap-8">
                            <div className="flex flex-col items-center gap-2">
                                <BabyBottleLoading className="w-16 h-16 text-rose-400" />
                                <span className={`text-[10px] opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>Rose</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <BabyBottleLoading className="w-16 h-16 text-amber-400" />
                                <span className={`text-[10px] opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>Amber</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <BabyBottleLoading className="w-16 h-16 text-emerald-400" />
                                <span className={`text-[10px] opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>Emerald</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <BabyBottleLoading className="w-16 h-16 text-indigo-400" />
                                <span className={`text-[10px] opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>Indigo</span>
                            </div>
                        </div>
                    </div>

                    {/* Focus View */}
                    <div className={`flex flex-col items-center justify-center gap-6 p-10 rounded-3xl shadow-xl border ${isDark ? 'bg-zinc-900/80 border-white/10' : 'bg-white/80 border-black/5'}`}>
                        <h2 className={`text-sm font-semibold uppercase tracking-wider opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>Focus Mode</h2>
                        <BabyBottleLoading className={`w-48 h-48 ${isDark ? 'text-white' : 'text-gray-800'}`} />
                    </div>
                </div>

                <div className={`max-w-2xl text-center text-sm opacity-60 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <p>💡 ヒント: <code>frontend/components/ui/baby-bottle-loading.tsx</code> を編集すると、ここですぐに反映されます。</p>
                </div>
            </div>
        </div>
    )
}
