
import { RefreshCw, UserIcon, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AuditLog } from "./utils/activity-utils";
import { useState } from "react";
import { TableRowNumber } from "@/components/ui/TableRowNumber";
import { PaginationComponent } from "@/components/ui/PaginationComponent";

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  filterBy: "all" | "login" | "logout" | "actions";
  setFilterBy: (filter: "all" | "login" | "logout" | "actions") => void;
}

type SortDirection = "asc" | "desc" | null;
type SortField = "created_at" | "userEmail" | "action" | "entity_type" | "ip_address" | null;

export const AuditLogTable = ({ 
  logs, 
  isLoading, 
  filterBy, 
  setFilterBy 
}: AuditLogTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const pageSize = 20;

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

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const sortedLogs = () => {
    if (!sortField || !sortDirection) return logs;
    
    return [...logs].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "userEmail":
          aValue = a.userEmail || "";
          bValue = b.userEmail || "";
          break;
        case "action":
          aValue = a.action || "";
          bValue = b.action || "";
          break;
        case "entity_type":
          aValue = a.entity_type || "";
          bValue = b.entity_type || "";
          break;
        case "ip_address":
          aValue = a.ip_address || "";
          bValue = b.ip_address || "";
          break;
        default:
          return 0;
      }
      
      let compareResult;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        compareResult = aValue - bValue;
      } else {
        compareResult = String(aValue).localeCompare(String(bValue));
      }
        
      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  };

  const sorted = sortedLogs();
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedLogs = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Audit Logs</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Button 
              variant={filterBy === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterBy("all")}
            >
              All
            </Button>
            <Button 
              variant={filterBy === "login" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterBy("login")}
            >
              Logins
            </Button>
            <Button 
              variant={filterBy === "logout" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterBy("logout")}
            >
              Logouts
            </Button>
            <Button 
              variant={filterBy === "actions" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterBy("actions")}
            >
              Actions
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">No.</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("created_at")}
                    className="p-0 hover:bg-transparent font-medium flex items-center"
                  >
                    Time{renderSortIcon("created_at")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("userEmail")}
                    className="p-0 hover:bg-transparent font-medium flex items-center"
                  >
                    User{renderSortIcon("userEmail")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("action")}
                    className="p-0 hover:bg-transparent font-medium flex items-center"
                  >
                    Action{renderSortIcon("action")}
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("entity_type")}
                    className="p-0 hover:bg-transparent font-medium flex items-center"
                  >
                    Entity Type{renderSortIcon("entity_type")}
                  </Button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("ip_address")}
                    className="p-0 hover:bg-transparent font-medium flex items-center"
                  >
                    IP Address{renderSortIcon("ip_address")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, index) => (
                  <TableRow key={log.id}>
                    <TableRowNumber index={(currentPage - 1) * pageSize + index} />
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.created_at), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[120px] md:max-w-none" title={log.userEmail || 'Unknown'}>
                          {log.userEmail || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="hidden md:table-cell">{log.entity_type}</TableCell>
                    <TableCell className="hidden lg:table-cell">{log.ip_address}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No audit logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {logs.length > pageSize && (
            <div className="p-4 border-t">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={logs.length}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
