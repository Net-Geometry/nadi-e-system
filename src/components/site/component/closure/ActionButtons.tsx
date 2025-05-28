import React from "react";
import { Button } from "../../../ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  item: any;
  user: any;
  canApprove: (item: any) => boolean;
  handleViewClosure: (id: number) => void;
  handleEditDraft: (id: number) => void;
  handleDeleteDraftClick: (id: number) => void;
  handleDeletePendingClick: (id: number) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  item,
  user,
  canApprove,
  handleViewClosure,
  handleEditDraft,
  handleDeleteDraftClick,
  handleDeletePendingClick,
}) => {
  const isDraft = item.nd_closure_status?.name === "Draft";
  const isSubmitted = item.nd_closure_status?.id === 2; // Submitted
  const isPending = isSubmitted && item.created_by === user?.id; // Check if pending and owner
  const needsApproval = canApprove(item); // Check if this user can approve this request

  return (
    <div className="flex space-x-2">
      {/* View button with approval indicator */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleViewClosure(item.id)}
        title={needsApproval ? "View and approve" : "View"}
        className={needsApproval ? "relative" : ""}
      >
        <Eye className="h-4 w-4" />
      </Button>

      {/* Edit button - only for drafts */}
      {isDraft && item.created_by === user?.id && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleEditDraft(item.id)}
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}

      {/* Delete button */}
      {(isDraft || isPending) && item.created_by === user?.id && (
        <Button
          variant="outline"
          size="icon"
          className="text-red-500"
          onClick={() =>
            isDraft
              ? handleDeleteDraftClick(item.id)
              : handleDeletePendingClick(item.id)
          }
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
