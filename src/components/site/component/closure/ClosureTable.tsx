import React from "react";
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from "../../../ui/table";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "../../../../lib/utils";
import StatusCell from "./StatusCell";
import ActionButtons from "./ActionButtons";
import { ColumnConfig } from "../../../../types/TableTypes";
import TableRowNumber from "../../../shared/TableRowNumber";

interface ClosureTableProps {
  isLoading: boolean;
  error: Error | null;
  columns: ColumnConfig[];
  paginatedData: any[];
  handleSort: (field: string) => void;
  sortField: string;
  sortDirection: string;
  user: any;
  currentPage: number;
  pageSize: number;
  canApprove: (item: any) => boolean;
  handleViewClosure: (id: number) => void;
  handleEditDraft: (id: number) => void;
  handleDeleteDraftClick: (id: number) => void;
  handleDeletePendingClick: (id: number) => void;
}

const ClosureTable: React.FC<ClosureTableProps> = ({
  isLoading,
  error,
  columns,
  paginatedData,
  handleSort,
  sortField,
  sortDirection,
  user,
  currentPage,
  pageSize,
  canApprove,
  handleViewClosure,
  handleEditDraft,
  handleDeleteDraftClick,
  handleDeletePendingClick,
}) => {
  return (
    <div className="rounded-md border overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading data...</span>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">
          Error loading data: {(error as Error).message}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      column.id === "number" ? "w-[60px] text-center" : "",
                      column.sortable ? "cursor-pointer" : ""
                    )}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && (
                        <div className="ml-2">
                          {sortField === column.id ? (
                            sortDirection === "asc" ? (
                              <span className="inline-block">↑</span>
                            ) : (
                              <span className="inline-block">↓</span>
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id}>
                    {columns.map((column) => (
                      <TableCell key={`${item.id}-${column.id}`}>
                        {column.cell(
                          item,
                          (currentPage - 1) * pageSize + index
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-4"
                  >
                    No closure requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ClosureTable;
