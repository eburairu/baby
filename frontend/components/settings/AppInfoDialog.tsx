"use client"
import { ExternalLink } from "lucide-react"
import { formatJapaneseDate } from "@/lib/dateUtils"
import ReactMarkdown from "react-markdown"
import { EditDialogBase } from "@/components/records/EditDialogBase"
import { Button } from "@/components/ui/button"
import { useAppVersion } from "@/hooks/useAppVersion"

interface AppInfoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AppInfoDialog({ open, onOpenChange }: AppInfoDialogProps) {
    const { appVersion, isLoading } = useAppVersion()

    const publishedDate = appVersion?.published_at
        ? formatJapaneseDate(new Date(appVersion.published_at))
        : null

    return (
        <EditDialogBase
            open={open}
            onOpenChange={onOpenChange}
            title="バージョン情報"
            dialogClassName="max-w-lg max-h-[80vh] flex flex-col"
            contentClassName="flex-1 flex flex-col min-h-0 p-0"
        >
            <div className="flex flex-col h-full p-4">
                {isLoading ? (
                    <div className="space-y-2 py-4">
                        <div className="h-4 w-24 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="h-20 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse mt-4" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 overflow-hidden">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                                v{appVersion?.version ?? "—"}
                            </p>
                            {publishedDate && (
                                <p className="text-sm text-gray-500 dark:text-zinc-400">{publishedDate} リリース</p>
                            )}
                        </div>

                        {appVersion?.release_notes && (
                            <div className="overflow-y-auto">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">リリースノート</h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{appVersion.release_notes}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {appVersion?.html_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="self-start dark:border-zinc-700 dark:text-zinc-300"
                                asChild
                            >
                                <a href={appVersion.html_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    GitHubで詳細を確認
                                </a>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </EditDialogBase>
    )
}
