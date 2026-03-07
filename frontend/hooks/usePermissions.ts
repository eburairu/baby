import { useUser } from "./useAuth";
import { UserRole } from "@/lib/constants";

// /auth/me がユーザーのロールを返すため、/family/members への追加フェッチは不要。
export function usePermissions() {
    const { user, isLoading } = useUser();
    const role = user?.role;

    const isAdmin = role === UserRole.ADMIN;
    const isViewer = role === UserRole.VIEWER;
    const isMember = role === UserRole.MEMBER;

    // admin and member can write
    const canWrite = isAdmin || isMember;

    return {
        isAdmin,
        isViewer,
        isMember,
        canWrite,
        isLoading,
    };
}
