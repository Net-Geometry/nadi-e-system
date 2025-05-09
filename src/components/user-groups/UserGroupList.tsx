import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserGroup } from "./types";
import {
  Edit,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { UserGroupDialog } from "./UserGroupDialog";
import { DeleteUserGroupDialog } from "./DeleteUserGroupDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";
import { UserTypeChips } from "./UserTypeChips";
import { TableRowNumber } from "@/components/ui/TableRowNumber";
import { PaginationComponent } from "@/components/ui/PaginationComponent";

type SortDirection = "asc" | "desc" | null;
type SortField = "group_name" | "description" | null;

export const UserGroupList = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const pageSize = 20;

  const { data: userGroups = [], isLoading } = useQuery({
    queryKey: ["user-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_user_group")
        .select("*")
        .order("group_name");

      if (error) {
        toast.error("Failed to fetch user groups");
        throw error;
      }

      return data as UserGroup[];
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedUserGroups = () => {
    if (!sortField || !sortDirection) return userGroups;

    return [...userGroups].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      const compareResult = String(aValue || "").localeCompare(
        String(bValue || "")
      );
      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const handleEdit = (group: UserGroup) => {
    setSelectedGroup(group);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (group: UserGroup) => {
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const sorted = sortedUserGroups();
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedGroups = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return <div className="py-4">Loading user groups...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">User Groups</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      {userGroups.length === 0 ? (
        <EmptyState
          title="No user groups"
          description="Start by creating your first user group."
          action={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          }
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">No.</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("group_name")}
                    className="p-0 hover:bg-transparent font-medium flex items-center"
                  >
                    Group Name{renderSortIcon("group_name")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("description")}
                    className="p-0 hover:bg-transparent font-medium flex items-center"
                  >
                    Description{renderSortIcon("description")}
                  </Button>
                </TableHead>
                <TableHead>User Types</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGroups.map((group, index) => (
                <TableRow key={group.id}>
                  <TableRowNumber
                    index={(currentPage - 1) * pageSize + index}
                  />
                  <TableCell className="font-medium">
                    {group.group_name}
                  </TableCell>
                  <TableCell>{group.description || "—"}</TableCell>
                  <TableCell>
                    <UserTypeChips userTypes={group.user_types} />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(group)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {userGroups.length > pageSize && (
            <div className="p-4 border-t">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={userGroups.length}
              />
            </div>
          )}
        </div>
      )}

      <UserGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        userGroup={null}
      />

      {selectedGroup && (
        <>
          <UserGroupDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            userGroup={selectedGroup}
          />

          <DeleteUserGroupDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            userGroup={selectedGroup}
          />
        </>
      )}
    </div>
  );
};
