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

const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
})

export default function LoginPage() {
    const router = useRouter()
    const { mutate } = useUser()
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: process.env.NEXT_PUBLIC_TEST_USER_USERNAME || "",
            password: process.env.NEXT_PUBLIC_TEST_USER_PASSWORD || "",
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
            setError(err.info?.detail || "Login failed")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Login to Baby-App</CardTitle>
                <CardDescription>Enter your username below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your-username" {...field} />
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
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Login</Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
