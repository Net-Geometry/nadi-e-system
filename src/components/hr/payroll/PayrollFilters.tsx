
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, DollarSign, FileSpreadsheet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { exportSelectedPayrollToCSV } from "@/utils/export-payroll-utils";

interface PayrollFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  positionFilter: string;
  setPositionFilter: (position: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  paymentRange: [number, number];
  setPaymentRange: (range: [number, number]) => void;
  positionOptions: string[];
  statusOptions: string[];
  minPayment?: number;
  maxPayment?: number;
  onResetFilters: () => void;
  onExportAll: () => void;
}

export const PayrollFilters = ({
  searchQuery,
  setSearchQuery,
  positionFilter,
  setPositionFilter,
  statusFilter,
  setStatusFilter,
  paymentRange,
  setPaymentRange,
  positionOptions,
  statusOptions,
  minPayment = 0,
  maxPayment = 10000,
  onResetFilters,
  onExportAll
}: PayrollFiltersProps) => {
  const [isPaymentRangeOpen, setIsPaymentRangeOpen] = useState(false);
  const [tempPaymentRange, setTempPaymentRange] = useState<[number, number]>(paymentRange);
  
  const hasFilters = 
    searchQuery || 
    positionFilter !== "all" || 
    statusFilter !== "all" ||
    paymentRange[0] > minPayment || 
    paymentRange[1] < maxPayment;

  const formatCurrency = (value: number) => {
    return `RM ${value.toLocaleString()}`;
  };
  
  const handlePaymentRangeApply = () => {
    setPaymentRange(tempPaymentRange);
    setIsPaymentRangeOpen(false);
  };
  
  const handlePaymentRangeReset = () => {
    const resetRange: [number, number] = [minPayment, maxPayment];
    setTempPaymentRange(resetRange);
    setPaymentRange(resetRange);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search payroll by name, position..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 h-12 w-full bg-white"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-[200px] h-12 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {positionOptions.map((position) => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] h-12 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={isPaymentRangeOpen} onOpenChange={setIsPaymentRangeOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-12 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Payment Range</span>
              {(paymentRange[0] > minPayment || paymentRange[1] < maxPayment) && (
                <span className="ml-2 rounded-full bg-nadi-purple text-white w-2 h-2"></span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Payment Range</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(tempPaymentRange[0])}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(tempPaymentRange[1])}
                  </span>
                </div>
                <Slider
                  min={minPayment}
                  max={maxPayment}
                  step={100}
                  value={tempPaymentRange}
                  onValueChange={(values) => setTempPaymentRange([values[0], values[1]])}
                  className="my-4"
                />
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePaymentRangeReset}
                >
                  Reset
                </Button>
                <Button size="sm" onClick={handlePaymentRangeApply}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          className="h-12 flex items-center gap-2"
          onClick={onExportAll}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export All
        </Button>

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
