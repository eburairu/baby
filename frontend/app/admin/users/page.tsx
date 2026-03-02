"use client";

import useSWR from "swr";
import { fetcher, patch } from "@/lib/api";
import { 
  Search,
  ShieldCheck,
  Calendar,
  User as UserIcon
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { User } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { data: users, isLoading, mutate } = useSWR<User[]>("/admin/users", fetcher);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.display_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleToggleSuperAdmin = async (userId: number, currentStatus: boolean) => {
    try {
      await patch(`/admin/users/${userId}/superadmin`, { is_superadmin: !currentStatus });
      toast.success("ユーザー権限を更新しました");
      mutate();
    } catch (error) {
      toast.error("権限の更新に失敗しました");
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ユーザー管理</h1>
        <p className="text-muted-foreground mt-2">
          システムの全ユーザーを表示し、権限設定などを行います。
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="ユーザー名や表示名で検索..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>ユーザー</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead>SuperAdmin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-16 animate-pulse bg-gray-50/50">
                  <TableCell colSpan={4} />
                </TableRow>
              ))
            ) : filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  ユーザーが見つかりません。
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 font-medium">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        {u.username}
                      </div>
                      <span className="text-xs text-muted-foreground pl-6">
                        {u.display_name || "(表示名なし)"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(u.created_at), "PPP", { locale: ja })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={u.is_superadmin}
                        onCheckedChange={() => handleToggleSuperAdmin(u.id, u.is_superadmin)}
                      />
                      {u.is_superadmin ? (
                         <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          管理者
                        </span>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                          ユーザー
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
