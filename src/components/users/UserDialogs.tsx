
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import type { Profile } from "@/types/auth";

interface UserDialogsProps {
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  userToEdit?: Profile;
  setUserToEdit: (user?: Profile) => void;
}

export const UserDialogs = ({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  userToEdit,
  setUserToEdit
}: UserDialogsProps) => {
  const queryClient = useQueryClient();

  return (
    <>
      <UserFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
        }}
      />

      <UserFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={userToEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          setUserToEdit(undefined);
        }}
      />
    </>
  );
};
