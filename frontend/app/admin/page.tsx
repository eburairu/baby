"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { 
  Users, 
  UsersRound, 
  Activity, 
  Database,
  TrendingUp,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStats {
  total_users: number;
  total_families: number;
  total_records: number;
  active_users_last_24h: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useSWR<AdminStats>("/admin/stats", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">管理者ダッシュボード</h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-100" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "総ユーザー数",
      value: stats?.total_users ?? 0,
      icon: Users,
      description: "登録済みユーザーの総数",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "総家族数",
      value: stats?.total_families ?? 0,
      icon: UsersRound,
      description: "作成された家族グループの総数",
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "総育児記録数",
      value: stats?.total_records ?? 0,
      icon: FileText,
      description: "これまでに作成された全記録数",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "アクティブユーザー (24h)",
      value: stats?.active_users_last_24h ?? 0,
      icon: Activity,
      description: "最近アクティブだったユーザー数",
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">管理者ダッシュボード</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          システムの全体的な利用状況をリアルタイムで確認できます。
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.bg} ${card.color} p-2 rounded-full`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              最近の動向
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-gray-50 text-muted-foreground text-sm md:text-base">
            グラフ表示エリア（将来の拡張）
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Database className="h-5 w-5 text-primary" />
              システムの状態
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between py-2 border-b last:border-0">
               <span className="text-sm md:text-base">API サーバー</span>
               <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                 <span className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                 オンライン
               </span>
             </div>
             <div className="flex items-center justify-between py-2 border-b last:border-0">
               <span className="text-sm md:text-base">データベース</span>
               <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                 <span className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                 接続済み
               </span>
             </div>
             <div className="flex items-center justify-between py-2 border-b last:border-0">
               <span className="text-sm md:text-base">ストレージ (Cloudinary)</span>
               <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                 <span className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                 正常
               </span>
             </div>
             <div className="flex items-center justify-between py-2 border-b last:border-0">
               <span className="text-sm md:text-base">AI モデル (Gemini API)</span>
               <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                 <span className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                 正常
               </span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}