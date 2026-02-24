"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import {
  Search,
  ChevronRight,
  Calendar,
  Baby,
  User as UserIcon,
  ShieldCheck,
  Users
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useState } from "react";

interface FamilyAdminResponse {
  id: number;
  name: string;
  member_count: number;
  created_at: string;
}

interface FamilyMemberResponse {
  user_id: number;
  username: string;
  display_name: string | null;
  role: string;
  joined_at: string;
}

interface BabyAdminResponse {
  id: number;
  name: string;
  birthday: string | null;
  gender: string | null;
  created_at: string;
}

interface FamilyDetailResponse {
  id: number;
  name: string;
  member_count: number;
  created_at: string;
  members: FamilyMemberResponse[];
  babies: BabyAdminResponse[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: "管理者",
  member: "メンバー",
  viewer: "閲覧者",
};

const GENDER_LABELS: Record<string, string> = {
  boy: "男の子",
  girl: "女の子",
  unknown: "不明",
};

function FamilyDetailSheet({
  familyId,
  open,
  onOpenChange,
}: {
  familyId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: family, isLoading } = useSWR<FamilyDetailResponse>(
    familyId ? `/admin/families/${familyId}` : null,
    fetcher
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isLoading ? "読み込み中..." : (family?.name ?? "家族詳細")}</SheetTitle>
          <SheetDescription>
            {family && (
              <span className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                作成: {format(new Date(family.created_at), "PPP", { locale: ja })}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="mt-6 space-y-4">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {family && (
          <div className="mt-6 space-y-6">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <UserIcon className="h-4 w-4 text-primary" />
                メンバー ({family.members.length} 名)
              </h3>
              {family.members.length === 0 ? (
                <p className="text-sm text-muted-foreground">メンバーがいません。</p>
              ) : (
                <div className="space-y-2">
                  {family.members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{member.username}</span>
                        {member.display_name && (
                          <span className="text-xs text-muted-foreground">{member.display_name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {member.role === "admin" && (
                          <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {ROLE_LABELS[member.role] ?? member.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Baby className="h-4 w-4 text-primary" />
                赤ちゃん ({family.babies.length} 人)
              </h3>
              {family.babies.length === 0 ? (
                <p className="text-sm text-muted-foreground">登録された赤ちゃんがいません。</p>
              ) : (
                <div className="space-y-2">
                  {family.babies.map((baby) => (
                    <div
                      key={baby.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{baby.name}</span>
                        {baby.birthday && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(baby.birthday), "PPP", { locale: ja })} 生まれ
                          </span>
                        )}
                      </div>
                      {baby.gender && (
                        <span className="text-xs text-muted-foreground">
                          {GENDER_LABELS[baby.gender] ?? baby.gender}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function AdminFamilies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: families, isLoading } = useSWR<FamilyAdminResponse[]>(
    `/admin/families${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`,
    fetcher
  );

  const handleRowClick = (familyId: number) => {
    setSelectedFamilyId(familyId);
    setSheetOpen(true);
  };

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
                <TableRow
                  key={family.id}
                  className="cursor-pointer hover:bg-gray-50/80"
                  onClick={() => handleRowClick(family.id)}
                >
                  <TableCell className="font-mono text-xs">{family.id}</TableCell>
                  <TableCell className="font-medium">{family.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {family.member_count} 名
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(family.created_at), "PPP", { locale: ja })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FamilyDetailSheet
        familyId={selectedFamilyId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
