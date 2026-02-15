import { useUser } from "./useAuth";
import { UserRole } from "@/lib/constants";

export function usePermissions() {
    const { user } = useUser();

    const isAdmin = user?.role === UserRole.ADMIN;
    const isViewer = user?.role === UserRole.VIEWER;
    const isMember = user?.role === UserRole.MEMBER;
    
    // admin and member can write
    const canWrite = isAdmin || isMember;

    return {
        isAdmin,
        isViewer,
        isMember,
        canWrite,
    };
}
