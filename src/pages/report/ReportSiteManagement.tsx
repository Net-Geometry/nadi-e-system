import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, Filter, RotateCcw, Users, Building, Building2, Calendar, Download, Upload, ChevronsUpDown, Check,
  Shield, ClipboardCheck, FileText, Zap, Megaphone, MapPin
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const duspOptions = [
  { id: "dusp1", label: "DUSP 1" },
  { id: "dusp2", label: "DUSP 2" },
  { id: "dusp3", label: "DUSP 3" },
  { id: "dusp4", label: "DUSP 4" },
  { id: "dusp5", label: "DUSP 5" },
];

const phaseOptions = [
  { id: "phase1", label: "Phase 1" },
  { id: "phase2", label: "Phase 2" },
  { id: "phase3", label: "Phase 3" },
];

const nadiOptions = [
  { id: "nadi1", label: "NADI Site 1" },
  { id: "nadi2", label: "NADI Site 2" },
  { id: "nadi3", label: "NADI Site 3" },
  { id: "nadi4", label: "NADI Site 4" },
  { id: "nadi5", label: "NADI Site 5" },
];

const monthOptions = [
  { id: "jan", label: "January" },
  { id: "feb", label: "February" },
  { id: "mar", label: "March" },
  { id: "apr", label: "April" },
  { id: "may", label: "May" },
  { id: "jun", label: "June" },
  { id: "jul", label: "July" },
  { id: "aug", label: "August" },
  { id: "sep", label: "September" },
  { id: "oct", label: "October" },
  { id: "nov", label: "November" },
  { id: "dec", label: "December" },
];

const yearOptions = [
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
  { id: "2023", label: "2023" },
  { id: "2022", label: "2022" },
];

const ReportSiteManagement = () => {
  // Filter states
  const [duspFilter, setDuspFilter] = useState<string | number | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<(string | number)[]>([]);
  const [nadiFilter, setNadiFilter] = useState<(string | number)[]>([]);
  const [monthFilter, setMonthFilter] = useState<string | number | null>(null);
  const [yearFilter, setYearFilter] = useState<string | number | null>("2025"); // Default to current year

  const hasActiveFilters = 
    duspFilter !== null || 
    phaseFilter.length > 0 || 
    nadiFilter.length > 0 ||
    monthFilter !== null || 
    (yearFilter !== null && yearFilter !== "2025");

  const resetFilters = () => {
    setDuspFilter(null);
    setPhaseFilter([]);
    setNadiFilter([]);
    setMonthFilter(null);
    setYearFilter("2025");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Site Management</h1>
            <p className="text-gray-500 mt-1">View and analyze site management data across all NADI sites</p>
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="secondary" className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Excel
            </Button> */}
            <Button variant="secondary" className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2">
          {/* DUSP Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Building className="h-4 w-4 text-gray-500" />
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
                    {duspOptions.map((dusp) => (
                      <CommandItem
                        key={dusp.id}
                        onSelect={() => setDuspFilter(duspFilter === dusp.id ? null : dusp.id)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            duspFilter === dusp.id ? "bg-primary border-primary" : "opacity-50"
                          )}
                        >
                          {duspFilter === dusp.id && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {dusp.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Phase Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Users className="h-4 w-4 text-gray-500" />
                Phase {phaseFilter.length > 0 && `(${phaseFilter.length})`}
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search phases..." />
                <CommandList>
                  <CommandEmpty>No phases found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {phaseOptions.map((phase) => (
                      <CommandItem
                        key={phase.id}
                        onSelect={() => {
                          setPhaseFilter(
                            phaseFilter.includes(phase.id)
                              ? phaseFilter.filter(id => id !== phase.id)
                              : [...phaseFilter, phase.id]
                          );
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            phaseFilter.includes(phase.id) ? "bg-primary border-primary" : "opacity-50"
                          )}
                        >
                          {phaseFilter.includes(phase.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {phase.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* NADI Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Building2 className="h-4 w-4 text-gray-500" />
                NADI {nadiFilter.length > 0 && `(${nadiFilter.length})`}
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search NADI sites..." />
                <CommandList>
                  <CommandEmpty>No NADI sites found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {nadiOptions.map((nadi) => (
                      <CommandItem
                        key={nadi.id}
                        onSelect={() => {
                          setNadiFilter(
                            nadiFilter.includes(nadi.id)
                              ? nadiFilter.filter(id => id !== nadi.id)
                              : [...nadiFilter, nadi.id]
                          );
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            nadiFilter.includes(nadi.id) ? "bg-primary border-primary" : "opacity-50"
                          )}
                        >
                          {nadiFilter.includes(nadi.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {nadi.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Month Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Calendar className="h-4 w-4 text-gray-500" />
                Month
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search months..." />
                <CommandList>
                  <CommandEmpty>No month found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {monthOptions.map((month) => (
                      <CommandItem
                        key={month.id}
                        onSelect={() => setMonthFilter(monthFilter === month.id ? null : month.id)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            monthFilter === month.id ? "bg-primary border-primary" : "opacity-50"
                          )}
                        >
                          {monthFilter === month.id && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {month.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Year Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Calendar className="h-4 w-4 text-gray-500" />
                Year
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search years..." />
                <CommandList>
                  <CommandEmpty>No year found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {yearOptions.map((year) => (
                      <CommandItem
                        key={year.id}
                        onSelect={() => setYearFilter(yearFilter === year.id ? null : year.id)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            yearFilter === year.id ? "bg-primary border-primary" : "opacity-50"
                          )}
                        >
                          {yearFilter === year.id && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {year.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Spacer */}
          <div className="flex-1"></div>
          
          {/* Reset Button */}
          <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2 h-10 text-sm px-4 shadow-sm hover:bg-slate-100">
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="mr-1 flex items-center">
              <Filter className="h-4 w-4 text-slate-500 mr-1" />
              <span className="text-xs font-medium text-slate-500">Active Filters:</span>
            </div>
            {duspFilter !== null && (
              <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                <span className="font-medium">DUSP: {duspOptions.find(opt => opt.id === duspFilter)?.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-slate-200"
                  onClick={() => setDuspFilter(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {phaseFilter.length > 0 && (
              <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                <span className="font-medium">Phase: {phaseFilter.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-slate-200"
                  onClick={() => setPhaseFilter([])}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {nadiFilter.length > 0 && (
              <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                <span className="font-medium">NADI: {nadiFilter.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-slate-200"
                  onClick={() => setNadiFilter([])}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {monthFilter !== null && (
              <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                <span className="font-medium">Month: {monthOptions.find(opt => opt.id === monthFilter)?.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-slate-200"
                  onClick={() => setMonthFilter(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {yearFilter !== null && yearFilter !== "2025" && (
              <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                <span className="font-medium">Year: {yearFilter}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-slate-200"
                  onClick={() => setYearFilter("2025")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">          {/* Local Authority Card */}
          <Card className="overflow-hidden shadow-sm border border-gray-200">
            <CardHeader className="p-4 bg-white border-b">
              <CardTitle className="text-lg font-medium text-gray-800">Local Authority</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-amber-50">
                    <Building2 className="h-5 w-5 text-amber-500" />
                  </div>
                  <span className="text-gray-600 font-medium">NADI Count</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  82
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-sm font-medium text-gray-600">87% Coverage</span>
              </div>
            </CardContent>
          </Card>          {/* Site Insurance Card */}
          <Card className="overflow-hidden shadow-sm border border-gray-200">
            <CardHeader className="p-4 bg-white border-b">
              <CardTitle className="text-lg font-medium text-gray-800">Site Insurance</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-blue-50">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-gray-600 font-medium">NADI Count</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  43
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-sm font-medium text-gray-600">45% Coverage</span>
              </div>
            </CardContent>
          </Card>          {/* Audit Card */}
          <Card className="overflow-hidden shadow-sm border border-gray-200">
            <CardHeader className="p-4 bg-white border-b">
              <CardTitle className="text-lg font-medium text-gray-800">Audit</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-green-50">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-gray-600 font-medium">NADI Count</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  35
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '37%' }}></div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-sm font-medium text-gray-600">37% Coverage</span>
              </div>
            </CardContent>
          </Card>          {/* Site Agreement Card */}
          <Card className="overflow-hidden shadow-sm border border-gray-200">
            <CardHeader className="p-4 bg-white border-b">
              <CardTitle className="text-lg font-medium text-gray-800">Site Agreement</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-purple-50">
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="text-gray-600 font-medium">NADI Count</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  40
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-sm font-medium text-gray-600">42% Coverage</span>
              </div>
            </CardContent>
          </Card>          {/* Utilities Card */}
          <Card className="overflow-hidden shadow-sm border border-gray-200">
            <CardHeader className="p-4 bg-white border-b">
              <CardTitle className="text-lg font-medium text-gray-800">Utilities</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-red-50">
                    <Zap className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="text-gray-600 font-medium">NADI Count</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  44
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '47%' }}></div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-sm font-medium text-gray-600">Water, Electricity, IWK</span>
              </div>
            </CardContent>
          </Card>          {/* Awareness & Promotion Card */}
          <Card className="overflow-hidden shadow-sm border border-gray-200">
            <CardHeader className="p-4 bg-white border-b">
              <CardTitle className="text-lg font-medium text-gray-800">Awareness & Promotion</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-indigo-50">
                    <Megaphone className="h-5 w-5 text-indigo-500" />
                  </div>
                  <span className="text-gray-600 font-medium">NADI Count</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  33
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-sm font-medium text-gray-600">Programme Coverage</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportSiteManagement;