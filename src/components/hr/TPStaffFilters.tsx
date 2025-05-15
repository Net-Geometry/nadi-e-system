
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, UserRound } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TPStaffFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  statusOptions: string[];
  userTypeFilter?: string;
  setUserTypeFilter?: (userType: string) => void;
  userTypeOptions?: string[];
  roleFilter?: string;
  setRoleFilter?: (role: string) => void;
  roleOptions?: string[];
  onResetFilters?: () => void;
}

export const TPStaffFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  statusOptions,
  userTypeFilter = "all",
  setUserTypeFilter,
  userTypeOptions = [],
  roleFilter = "all",
  setRoleFilter,
  roleOptions = [],
  onResetFilters,
}: TPStaffFiltersProps) => {
  const hasFilters = 
    searchQuery || 
    statusFilter !== "all" || 
    (userTypeFilter && userTypeFilter !== "all") ||
    (roleFilter && roleFilter !== "all");
  
  const hasUserTypeFilter = userTypeFilter !== undefined && setUserTypeFilter !== undefined && userTypeOptions.length > 0;
  const hasRoleFilter = roleFilter !== undefined && setRoleFilter !== undefined && roleOptions.length > 0;
  
  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search staff by name, email, user type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 h-12 w-full bg-white"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] h-12 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions?.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasUserTypeFilter && setUserTypeFilter && (
          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger className="w-[200px] h-12 flex items-center">
              <UserRound className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by User Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All User Types</SelectItem>
              {userTypeOptions.map((userType) => (
                <SelectItem key={userType} value={userType}>
                  {userType.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasRoleFilter && setRoleFilter && (
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px] h-12 flex items-center">
              <UserRound className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};
