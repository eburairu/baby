"use client";

import { ResponsiveModal } from "@/components/ui/responsive-modal";
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
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      contentClassName="pb-6"
    >
      <CommentSection
        recordType={recordType}
        recordId={recordId}
        currentUserId={currentUserId}
        onCommentChange={onCommentChange}
      />
    </ResponsiveModal>
  );
}
