"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SuperAdminGuard } from "@/components/auth/SuperAdminGuard";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  ChevronLeft,
  ShieldCheck,
  Menu,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "ダッシュボード", href: "/admin", icon: LayoutDashboard },
    { name: "家族一覧", href: "/admin/families", icon: UsersRound },
    { name: "ユーザー管理", href: "/admin/users", icon: Users },
    { name: "AI 設定", href: "/admin/ai", icon: Sparkles },
  ];

  return (
    <SuperAdminGuard>
      <div className="flex h-screen bg-gray-50 text-gray-900">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-white md:flex">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-primary">
              <ShieldCheck className="h-6 w-6" />
              <span>Botoro Admin</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>アプリに戻る</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header (Mobile) */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:hidden">
             <Link href="/" className="flex items-center gap-2 font-bold text-primary">
              <ShieldCheck className="h-6 w-6" />
              <span>Admin</span>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-64 p-0">
                <div className="flex h-16 items-center border-b px-6">
                  <SheetTitle className="flex items-center gap-2 font-bold text-primary">
                    <ShieldCheck className="h-6 w-6" />
                    <span>Botoro Admin</span>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    管理者用ナビゲーションメニュー
                  </SheetDescription>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-primary text-white" 
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t p-4 mt-auto">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>アプリに戻る</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </SuperAdminGuard>
  );
}
