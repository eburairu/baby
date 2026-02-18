import useSWR from 'swr'
import { fetcher } from '@/lib/api'

export interface AppVersion {
    version: string
    release_notes: string | null
    published_at: string | null
    html_url: string | null
}

export function useAppVersion() {
    const { data, error, isLoading } = useSWR<AppVersion>('/version', fetcher, {
        revalidateOnFocus: false,
    })

    return {
        appVersion: data,
        isLoading,
        isError: error,
    }
}
