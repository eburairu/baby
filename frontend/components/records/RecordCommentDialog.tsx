"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CommentSection } from "./CommentSection";

interface RecordCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordType: string;
  recordId: number;
  title: string;
  currentUserId?: number;
  onCommentChange?: () => void;
}

export function RecordCommentDialog({
  open,
  onOpenChange,
  recordType,
  recordId,
  title,
  currentUserId,
  onCommentChange,
}: RecordCommentDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <CommentSection
              recordType={recordType}
              recordId={recordId}
              currentUserId={currentUserId}
              onCommentChange={onCommentChange}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800 max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>
        <CommentSection
          recordType={recordType}
          recordId={recordId}
          currentUserId={currentUserId}
          onCommentChange={onCommentChange}
        />
      </DialogContent>
    </Dialog>
  );
}
