
import { Table, TableBody } from "@/components/ui/table";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";
import { Profile } from "@/types/auth";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "email" | "phone" | "status" | "site" | "phase" | "state" | "created_at" | null;

interface UserTableProps {
  users: Profile[];
  isLoading: boolean;
  selectedUsers: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
  onEditUser: (user: Profile) => void;
  onDeleteUser: (userId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: SortDirection;
}

export const UserTable = ({
  users,
  isLoading,
  selectedUsers,
  onSelectAll,
  onSelectUser,
  onEditUser,
  onDeleteUser,
  currentPage,
  totalPages,
  onPageChange,
  onSort,
  sortField,
  sortDirection
}: UserTableProps) => {
  const renderPaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          isActive={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2 && totalPages > 3) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <Table>
        <UserTableHeader
          onSelectAll={onSelectAll}
          allSelected={users.length ? selectedUsers.length === users.length : false}
          showRowNumbers={false}
          onSort={onSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
        <TableBody>
          {isLoading ? (
            <tr>
              <td colSpan={10} className="text-center py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6E41E2]"></div>
                </div>
                <p className="mt-2 text-gray-500">Loading users...</p>
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelected={selectedUsers.includes(user.id)}
                onSelect={onSelectUser}
                onEdit={onEditUser}
                onDelete={onDeleteUser}
                rowIndex={index}
              />
            ))
          )}
        </TableBody>
      </Table>
      
      {users.length > 0 && totalPages > 1 && (
        <div className="border-t p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
