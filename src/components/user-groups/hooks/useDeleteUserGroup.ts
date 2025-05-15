import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserGroup } from "../types";

export const useDeleteUserGroup = () => {
  const queryClient = useQueryClient();

  const deleteUserGroup = useMutation({
    mutationFn: async (userGroupId: number) => {
      const { error } = await supabase
        .from("nd_user_group")
        .delete()
        .eq("id", userGroupId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      toast.success("User group deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting user group:", error);
      toast.error(
        "Failed to delete user group. It may be in use by one or more users."
      );
    },
  });

  return { deleteUserGroup };
};
