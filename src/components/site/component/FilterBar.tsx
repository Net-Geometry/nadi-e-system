
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FilterBarProps {
  showDateRange?: boolean;
  showRegion?: boolean;
  showCenterType?: boolean;
  showSearch?: boolean;
  showPcBookingFilter?: boolean;
  onFilterChange?: (filters: any) => void;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  showDateRange = true,
  showRegion = true,
  showCenterType = true,
  showPcBookingFilter = false,
  showSearch = true,
  onFilterChange,
  children,
  className,
}: FilterBarProps) {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [region, setRegion] = React.useState<string>('all');
  const [centerType, setCenterType] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [pcAvailability, setPcAvailability] = React.useState<string>('all');
  const [pcTypeTabs, setPcTypeTabs] = React.useState<string>('all');

  const handleFilterChange = () => {
    if (showPcBookingFilter && onFilterChange) {
      onFilterChange({
        pcAvailability,
        pcTypeTabs,
        searchQuery
      });
      return;
    }

    if (onFilterChange) {
      onFilterChange({
        dateRange: { start: startDate, end: endDate },
        region,
        centerType,
        searchQuery,
      });
    }
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [startDate, endDate, region, centerType, searchQuery, pcAvailability, pcTypeTabs]);

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {showDateRange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-between w-[240px]"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate && endDate ? (
                <>
                  {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
                </>
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="grid gap-2">
              <Calendar
                mode="range"
                selected={{
                  from: startDate,
                  to: endDate,
                }}
                onSelect={(range) => {
                  setStartDate(range?.from);
                  setEndDate(range?.to);
                }}
                numberOfMonths={2}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}

      {showRegion && (
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="north">North</SelectItem>
            <SelectItem value="south">South</SelectItem>
            <SelectItem value="east">East</SelectItem>
            <SelectItem value="west">West</SelectItem>
            <SelectItem value="central">Central</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showCenterType && (
        <Select value={centerType} onValueChange={setCenterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Center Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Center Types</SelectItem>
            <SelectItem value="urban">Urban</SelectItem>
            <SelectItem value="rural">Rural</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 w-[200px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {showPcBookingFilter && (

        <section className='flex gap-2' id="filterPcBooking">
            <Tabs value={pcAvailability} defaultValue='all' onValueChange={(value: string) => { setPcAvailability(value) }}>
              <TabsList className='bg-white' defaultValue={'all'}>
                <TabsTrigger value='all'>All</TabsTrigger>
                <TabsTrigger value='Available'>Free</TabsTrigger>
                <TabsTrigger value='in-use'>Used</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={pcTypeTabs} defaultValue='all' onValueChange={(value: string) => { setPcTypeTabs(value) }}>
              <TabsList className='bg-white' defaultValue={'all'}>
                <TabsTrigger value='all'>All</TabsTrigger>
                <TabsTrigger value='Gaming'>Gaming</TabsTrigger>
                <TabsTrigger value='Printer'>Printer</TabsTrigger>
              </TabsList>
            </Tabs>            
        </section>

      )}

      {children}
    </div>
  );
}

export default FilterBar;
