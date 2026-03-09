"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { api, isApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/useAuth"
import { ErrorMessage } from "@/components/ui/error-message"

const formSchema = z.object({
    username: z.string().min(1, "ユーザー名を入力してください"),
    password: z.string().min(1, "パスワードを入力してください"),
})

export default function LoginPage() {
    const router = useRouter()
    const { mutate } = useUser()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setError(null)
            await api.post("/auth/login", values)
            await mutate() // refresh user state
            router.push("/dashboard")
        } catch (err: unknown) {
            console.error("Login failed", err)
            if (isApiError(err)) {
                setError((err.info as { detail?: string })?.detail || "ログインに失敗しました")
            } else {
                setError("ログインに失敗しました")
            }
        }
    }

    return (
        <Card className="rounded-2xl shadow-sm border-0">
            <CardHeader>
                <CardTitle data-sentry-unmask>Botoro にログイン</CardTitle>
                <CardDescription data-sentry-unmask>ユーザー名を入力してログインしてください</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {error && <ErrorMessage message={error} />}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ユーザー名</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ユーザー名を入力" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>パスワード</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                className="pr-10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                                            title={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11"
                            loading={form.formState.isSubmitting}
                            data-sentry-unmask
                        >
                            ログイン
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex-col gap-2 justify-center">
                <p className="text-sm text-muted-foreground">
                    アカウントをお持ちでないですか？{" "}
                    <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        新規登録
                    </Link>
                </p>
                <p className="text-sm text-muted-foreground text-center">
                    パスワードをお忘れの場合は、家族の管理者にお問い合わせください。
                </p>
            </CardFooter>
        </Card>
    )
}
