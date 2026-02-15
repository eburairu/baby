export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors">
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
        </div>
    )
}
