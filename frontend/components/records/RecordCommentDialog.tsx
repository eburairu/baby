"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CommentSection } from "./CommentSection";

interface RecordCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordType: string;
  recordId: number;
  title: string;
  currentUserId?: number;
}

export function RecordCommentDialog({
  open,
  onOpenChange,
  recordType,
  recordId,
  title,
  currentUserId,
}: RecordCommentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>
        <CommentSection
          recordType={recordType}
          recordId={recordId}
          currentUserId={currentUserId}
        />
      </DialogContent>
    </Dialog>
  );
}
