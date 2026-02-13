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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/hooks/useAuth"

const createFamilySchema = z.object({
    name: z.string().min(1, "Family name is required"),
    username: z.string().min(1, "Your name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

const joinFamilySchema = z.object({
    invite_code: z.string().min(1, "Invitation code is required"),
    username: z.string().min(1, "Your name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function RegisterPage() {
    const router = useRouter()
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
            router.push("/")
        } catch (err: any) {
            console.error("Registration failed", err)
            setError(err.info?.detail || "Registration failed")
        }
    }

    async function onJoinSubmit(values: z.infer<typeof joinFamilySchema>) {
        try {
            setError(null)
            const { invite_code, ...userIn } = values
            await api.post(`/auth/register/join?invite_code=${invite_code}`, userIn)
            await mutate()
            router.push("/")
        } catch (err: any) {
            console.error("Join failed", err)
            setError(err.info?.detail || "Join failed")
        }
    }

    return (
        <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="create">Create Family</TabsTrigger>
                <TabsTrigger value="join">Join Family</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Family</CardTitle>
                        <CardDescription>Start managing your baby&apos;s records together.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                                {error && <div className="text-red-500 text-sm">{error}</div>}
                                <FormField
                                    control={createForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Family Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Suzuki Family" {...field} />
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
                                            <FormLabel>Your Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Taro" {...field} />
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
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" loading={createForm.formState.isSubmitting}>Create Family</Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline">
                                Login
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </TabsContent>

            <TabsContent value="join">
                <Card>
                    <CardHeader>
                        <CardTitle>Join an Existing Family</CardTitle>
                        <CardDescription>Enter the invitation code from your family member.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...joinForm}>
                            <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                                {error && <div className="text-red-500 text-sm">{error}</div>}
                                <FormField
                                    control={joinForm.control}
                                    name="invite_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Invitation Code</FormLabel>
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
                                            <FormLabel>Your Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Hanako" {...field} />
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
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" loading={joinForm.formState.isSubmitting}>Join Family</Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline">
                                Login
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
