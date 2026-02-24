"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  Baby,
  User as UserIcon,
  ShieldCheck,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

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

export default function AdminFamilyDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: family, isLoading } = useSWR<FamilyDetailResponse>(
    `/admin/families/${id}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="h-48 bg-gray-100 rounded animate-pulse" />
          <div className="h-48 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        家族が見つかりません。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/families"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{family.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>作成: {format(new Date(family.created_at), "PPP", { locale: ja })}</span>
            <span className="mx-1">·</span>
            <Users className="h-3.5 w-3.5" />
            <span>{family.member_count} 名</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-5 w-5 text-primary" />
              メンバー ({family.members.length} 名)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {family.members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                メンバーがいません。
              </p>
            ) : (
              family.members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      {member.username}
                    </div>
                    {member.display_name && (
                      <span className="text-xs text-muted-foreground pl-6">
                        {member.display_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "admin" && (
                      <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {ROLE_LABELS[member.role] ?? member.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Baby className="h-5 w-5 text-primary" />
              赤ちゃん ({family.babies.length} 人)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {family.babies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                登録された赤ちゃんがいません。
              </p>
            ) : (
              family.babies.map((baby) => (
                <div
                  key={baby.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
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
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
