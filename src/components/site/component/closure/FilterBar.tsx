import React from "react";
import { Button } from "../../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command";
import { cn } from "../../../../lib/utils";
import { Filter, RotateCcw, Box, ChevronsUpDown, MapPin, Clock, Check } from "lucide-react";

interface FilterBarProps {
  categories: any[];
  uniqueRegions: string[];
  uniqueStates: string[];
  uniqueStatuses: string[];
  uniqueDUSP: any[];
  uniqueTP: any[];
  selectedCategoryFilters: string[];
  selectedRegionFilters: string[];
  selectedStateFilters: string[];
  selectedStatusFilters: string[];
  selectedDuspFilters: string[];
  selectedTpFilters: string[];
  setSelectedCategoryFilters: (filters: string[]) => void;
  setSelectedRegionFilters: (filters: string[]) => void;
  setSelectedStateFilters: (filters: string[]) => void;
  setSelectedStatusFilters: (filters: string[]) => void;
  setSelectedDuspFilters: (filters: string[]) => void;
  setSelectedTpFilters: (filters: string[]) => void;
  handleResetFilters: () => void;
  handleApplyFilters: () => void;
  isSuperAdmin: boolean;
  isMCMCUser: boolean;
  isDUSPUser: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  uniqueRegions,
  uniqueStates,
  uniqueStatuses,
  uniqueDUSP,
  uniqueTP,
  selectedCategoryFilters,
  selectedRegionFilters,
  selectedStateFilters,
  selectedStatusFilters,
  selectedDuspFilters,
  selectedTpFilters,
  setSelectedCategoryFilters,
  setSelectedRegionFilters,
  setSelectedStateFilters,
  setSelectedStatusFilters,
  setSelectedDuspFilters,
  setSelectedTpFilters,
  handleResetFilters,
  handleApplyFilters,
  isSuperAdmin,
  isMCMCUser,
  isDUSPUser,
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {/* Category Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-10">
              <Box className="h-4 w-4 text-gray-500" />
              Category
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput placeholder="Search categories..." />
              <CommandList>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {categories?.map((category) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => {
                        const value = category.eng;
                        setSelectedCategoryFilters(
                          selectedCategoryFilters.includes(value)
                            ? selectedCategoryFilters.filter((item) => item !== value)
                            : [...selectedCategoryFilters, value]
                        );
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          selectedCategoryFilters.includes(category.eng)
                            ? "bg-primary border-primary"
                            : "opacity-50"
                        )}
                      >
                        {selectedCategoryFilters.includes(category.eng) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {category.eng}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Region Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-10">
              <Box className="h-4 w-4 text-gray-500" />
              Region
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput placeholder="Search regions..." />
              <CommandList>
                <CommandEmpty>No regions found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {uniqueRegions.map((region) => (
                    <CommandItem
                      key={region}
                      onSelect={() => {
                        const value = region;
                        setSelectedRegionFilters(
                          selectedRegionFilters.includes(value)
                            ? selectedRegionFilters.filter((item) => item !== value)
                            : [...selectedRegionFilters, value]
                        );
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          selectedRegionFilters.includes(region)
                            ? "bg-primary border-primary"
                            : "opacity-50"
                        )}
                      >
                        {selectedRegionFilters.includes(region) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {region}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* State Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-10">
              <MapPin className="h-4 w-4 text-gray-500" />
              State
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput placeholder="Search states..." />
              <CommandList>
                <CommandEmpty>No states found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {uniqueStates.map((state) => (
                    <CommandItem
                      key={state}
                      onSelect={() => {
                        const value = state;
                        setSelectedStateFilters(
                          selectedStateFilters.includes(value)
                            ? selectedStateFilters.filter((item) => item !== value)
                            : [...selectedStateFilters, value]
                        );
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          selectedStateFilters.includes(state)
                            ? "bg-primary border-primary"
                            : "opacity-50"
                        )}
                      >
                        {selectedStateFilters.includes(state) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {state}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-10">
              <Clock className="h-4 w-4 text-gray-500" />
              Status
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput placeholder="Search statuses..." />
              <CommandList>
                <CommandEmpty>No statuses found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {uniqueStatuses.map((status) => (
                    <CommandItem
                      key={status}
                      onSelect={() => {
                        const value = status;
                        setSelectedStatusFilters(
                          selectedStatusFilters.includes(value)
                            ? selectedStatusFilters.filter((item) => item !== value)
                            : [...selectedStatusFilters, value]
                        );
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          selectedStatusFilters.includes(status)
                            ? "bg-primary border-primary"
                            : "opacity-50"
                        )}
                      >
                        {selectedStatusFilters.includes(status) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {status}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* DUSP Filter - Only for MCMC and Super Admin */}
        {(isSuperAdmin || isMCMCUser) && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 h-10">
                <Box className="h-4 w-4 text-gray-500" />
                DUSP
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search DUSP..." />
                <CommandList>
                  <CommandEmpty>No DUSP found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {uniqueDUSP.map((dusp) => (
                      <CommandItem
                        key={dusp.id}
                        onSelect={() => {
                          const value = dusp.id;
                          setSelectedDuspFilters(
                            selectedDuspFilters.includes(value)
                              ? selectedDuspFilters.filter((item) => item !== value)
                              : [...selectedDuspFilters, value]
                          );
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            selectedDuspFilters.includes(dusp.id)
                              ? "bg-primary border-primary"
                              : "opacity-50"
                          )}
                        >
                          {selectedDuspFilters.includes(dusp.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {dusp.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* TP Filter - Only for DUSP, MCMC and Super Admin */}
        {(isSuperAdmin || isMCMCUser || isDUSPUser) && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 h-10">
                <Box className="h-4 w-4 text-gray-500" />
                TP
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search TP..." />
                <CommandList>
                  <CommandEmpty>No TP found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {uniqueTP.map((tp) => (
                      <CommandItem
                        key={tp.id}
                        onSelect={() => {
                          const value = tp.id;
                          setSelectedTpFilters(
                            selectedTpFilters.includes(value)
                              ? selectedTpFilters.filter((item) => item !== value)
                              : [...selectedTpFilters, value]
                          );
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            selectedTpFilters.includes(tp.id)
                              ? "bg-primary border-primary"
                              : "opacity-50"
                          )}
                        >
                          {selectedTpFilters.includes(tp.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {tp.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        <Button
          variant="outline"
          className="flex items-center gap-2 h-10"
          onClick={handleResetFilters}
        >
          <RotateCcw className="h-4 w-4 text-gray-500" />
          Reset
        </Button>
      </div>

      <Button
        variant="secondary"
        className="flex items-center gap-2 ml-auto"
        onClick={handleApplyFilters}
      >
        <Filter className="h-4 w-4" />
        Apply Filters
      </Button>
    </div>
  );
};

export default FilterBar;
