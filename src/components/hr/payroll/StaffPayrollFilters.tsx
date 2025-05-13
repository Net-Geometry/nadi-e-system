
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffPayrollFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  monthFilter: string;
  setMonthFilter: (month: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  onResetFilters: () => void;
}

export const StaffPayrollFilters = ({
  searchQuery,
  setSearchQuery,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  onResetFilters,
}: StaffPayrollFiltersProps) => {
  const hasFilters = 
    searchQuery || 
    monthFilter !== "all" || 
    yearFilter !== "all";
  
  // Generate month options
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search payslips by description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 h-12 w-full bg-white"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[200px] h-12 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[200px] h-12 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="h-12 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};
