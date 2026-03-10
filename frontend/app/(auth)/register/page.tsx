"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { api, getErrorMessage } from "@/lib/api"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/hooks/useAuth"
import { ErrorMessage } from "@/components/ui/error-message"
import { Suspense } from "react"

const createFamilySchema = z.object({
    name: z.string().min(1, "家族名を入力してください"),
    username: z.string().min(1, "お名前を入力してください"),
    password: z.string().min(6, "パスワードは6文字以上で入力してください"),
})

const joinFamilySchema = z.object({
    invite_code: z.string().min(1, "招待コードを入力してください"),
    username: z.string().min(1, "お名前を入力してください"),
    password: z.string().min(6, "パスワードは6文字以上で入力してください"),
})

function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isJoin = searchParams.get("join") === "true"
    const { mutate } = useUser()
    const [error, setError] = useState<string | null>(null)

    const createForm = useForm<z.infer<typeof createFamilySchema>>({
        resolver: zodResolver(createFamilySchema),
        defaultValues: {
            name: "",
            username: "",
            password: "",
        },
    })

    const joinForm = useForm<z.infer<typeof joinFamilySchema>>({
        resolver: zodResolver(joinFamilySchema),
        defaultValues: {
            invite_code: "",
            username: "",
            password: "",
        },
    })

    async function onCreateSubmit(values: z.infer<typeof createFamilySchema>) {
        try {
            setError(null)
            await api.post("/auth/register/family", values)
            await mutate()
            router.push("/dashboard")
        } catch (err: unknown) {
            console.error("Registration failed", err)
            setError(getErrorMessage(err, "登録に失敗しました"))
        }
    }

    async function onJoinSubmit(values: z.infer<typeof joinFamilySchema>) {
        try {
            setError(null)
            const { invite_code, ...userIn } = values
            await api.post(`/auth/register/join?invite_code=${invite_code}`, userIn)
            await mutate()
            router.push("/dashboard")
        } catch (err: unknown) {
            console.error("Join failed", err)
            setError(getErrorMessage(err, "家族への参加に失敗しました"))
        }
    }

    return (
        <Tabs defaultValue={isJoin ? "join" : "create"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 p-1 rounded-xl">
                <TabsTrigger value="create" className="rounded-lg" data-sentry-unmask>家族を新規作成</TabsTrigger>
                <TabsTrigger value="join" className="rounded-lg" data-sentry-unmask>家族に参加</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
                <Card className="rounded-2xl shadow-sm border-0">
                    <CardHeader>
                        <CardTitle data-sentry-unmask>家族の新規作成</CardTitle>
                        <CardDescription data-sentry-unmask>家族で赤ちゃんの記録を共有しましょう。</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                                {error && <ErrorMessage message={error} />}
                                <FormField
                                    control={createForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>家族名</FormLabel>
                                            <FormControl>
                                                <Input placeholder="例: 鈴木家" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>お名前</FormLabel>
                                            <FormControl>
                                                <Input placeholder="例: 太郎" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
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
                                    loading={createForm.formState.isSubmitting}
                                    data-sentry-unmask
                                >
                                    家族を作成して登録
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">
                            すでにアカウントをお持ちですか？{" "}
                            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                ログイン
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </TabsContent>

            <TabsContent value="join">
                <Card className="rounded-2xl shadow-sm border-0">
                    <CardHeader>
                        <CardTitle data-sentry-unmask>既存の家族に参加</CardTitle>
                        <CardDescription data-sentry-unmask>家族から共有された招待コードを入力してください。</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form {...joinForm}>
                            <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                                {error && <ErrorMessage message={error} />}
                                <FormField
                                    control={joinForm.control}
                                    name="invite_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>招待コード</FormLabel>
                                            <FormControl>
                                                <Input placeholder="XXXX" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={joinForm.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>お名前</FormLabel>
                                            <FormControl>
                                                <Input placeholder="例: 花子" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={joinForm.control}
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
                                    loading={joinForm.formState.isSubmitting}
                                    data-sentry-unmask
                                >
                                    家族に参加して登録
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">
                            すでにアカウントをお持ちですか？{" "}
                            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                ログイン
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
        </Suspense>
    )
}
