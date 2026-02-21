"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { 
  UsersRound, 
  Search,
  ChevronRight,
  Calendar
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
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface FamilyAdminResponse {
  id: number;
  name: string;
  member_count: number;
  created_at: string;
}

export default function AdminFamilies() {
  const { data: families, isLoading } = useSWR<FamilyAdminResponse[]>("/admin/families", fetcher);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">家族一覧</h1>
        <p className="text-muted-foreground mt-2">
          登録されているすべての家族グループを表示します。
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="家族名で検索..." 
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>家族名</TableHead>
              <TableHead>メンバー数</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-16 animate-pulse bg-gray-50/50">
                  <TableCell colSpan={5} />
                </TableRow>
              ))
            ) : families?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  家族が見つかりません。
                </TableCell>
              </TableRow>
            ) : (
              families?.map((family) => (
                <TableRow key={family.id}>
                  <TableCell className="font-mono text-xs">{family.id}</TableCell>
                  <TableCell className="font-medium">{family.name}</TableCell>
                  <TableCell>{family.member_count} 名</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(family.created_at), "PPP", { locale: ja })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </button>
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
