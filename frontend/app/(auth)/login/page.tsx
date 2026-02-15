"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
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
            router.push("/")
        } catch (err: any) {
            console.error("Login failed", err)
            setError(err.info?.detail || "ログインに失敗しました")
        }
    }

    return (
        <Card className="rounded-2xl shadow-sm border-0">
            <CardHeader>
                <CardTitle>Baby App にログイン</CardTitle>
                <CardDescription>ユーザー名を入力してログインしてください</CardDescription>
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
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button 
                            type="submit" 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11" 
                            loading={form.formState.isSubmitting}
                        >
                            ログイン
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                    アカウントをお持ちでないですか？{" "}
                    <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        新規登録
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
