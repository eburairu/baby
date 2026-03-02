"use client";

import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import {
  Search,
  ChevronRight,
  Calendar,
  Baby,
  User as UserIcon,
  ShieldCheck,
  Users,
  Plus,
  Copy,
  CheckCircle2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

interface FamilyAdminResponse {
  id: number;
  name: string;
  member_count: number;
  created_at: string;
}

interface FamilyCreateResponse {
  id: number;
  name: string;
  invite_code: string;
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdFamily, setCreatedFamily] = useState<FamilyCreateResponse | null>(null);

  const { data: families, isLoading } = useSWR<FamilyAdminResponse[]>(
    `/admin/families${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`,
    fetcher
  );

  const handleRowClick = (familyId: number) => {
    setSelectedFamilyId(familyId);
    setSheetOpen(true);
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newFamilyName.trim() }),
      });

      if (!res.ok) {
        throw new Error("家族の作成に失敗しました");
      }

      const data: FamilyCreateResponse = await res.json();
      setCreatedFamily(data);
      setNewFamilyName("");
      mutate(`/admin/families${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`);
      toast.success("家族を作成しました");
    } catch (error) {
      console.error(error);
      toast.error("家族の作成に失敗しました");
    } finally {
      setIsCreating(false);
    }
  };

  const copyInviteCode = () => {
    if (!createdFamily?.invite_code) return;
    navigator.clipboard.writeText(createdFamily.invite_code);
    toast.success("招待コードをコピーしました");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">家族一覧</h1>
        <p className="text-muted-foreground mt-2">
          登録されているすべての家族グループを表示します。
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="家族名で検索..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          setCreatedFamily(null);
          setCreateDialogOpen(true);
        }} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          新規家族作成
        </Button>
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {createdFamily ? (
            <>
              <DialogHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <DialogTitle className="text-center">家族を作成しました</DialogTitle>
                <DialogDescription className="text-center">
                  「{createdFamily.name}」の作成が完了しました。
                  以下の招待コードを代表者に伝えてください。
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 flex flex-col items-center">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg border font-mono text-lg font-bold tracking-wider select-all">
                  {createdFamily.invite_code}
                  <Button variant="ghost" size="icon" onClick={copyInviteCode} className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setCreateDialogOpen(false)} className="w-full">
                  閉じる
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={handleCreateFamily}>
              <DialogHeader>
                <DialogTitle>新規家族作成</DialogTitle>
                <DialogDescription>
                  新しい家族グループを作成します。
                  作成後、招待コードが発行されます。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">家族名</Label>
                  <Input
                    id="name"
                    placeholder="例: 佐藤家"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isCreating || !newFamilyName.trim()}>
                  {isCreating ? "作成中..." : "作成する"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
