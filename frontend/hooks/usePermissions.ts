import { useUser } from "./useAuth";
import { useFamilyMembers } from "./useData";
import { UserRole } from "@/lib/constants";

export function usePermissions() {
    const { user, isLoading: userLoading } = useUser();
    const { members, isLoading: membersLoading } = useFamilyMembers();

    const currentMember = members?.find((m) => m.username === user?.username);
    const role = currentMember?.role;

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
        isLoading: userLoading || membersLoading,
    };
}
