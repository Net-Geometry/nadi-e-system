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
import { X, Filter, RotateCcw, Building, Calendar, Download, Upload, ChevronsUpDown, Check, ClipboardList } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const duspOptions = [
  { id: "dusp1", label: "DUSP 1" },
  { id: "dusp2", label: "DUSP 2" },
  { id: "dusp3", label: "DUSP 3" },
  { id: "dusp4", label: "DUSP 4" },
  { id: "dusp5", label: "DUSP 5" },
];

const nadiOptions = [
  { id: "nadi1", label: "NADI 1" },
  { id: "nadi2", label: "NADI 2" },
  { id: "nadi3", label: "NADI 3" },
  { id: "nadi4", label: "NADI 4" },
  { id: "nadi5", label: "NADI 5" },
];

const phaseOptions = [
  { id: "phase1", label: "Phase 1" },
  { id: "phase2", label: "Phase 2" },
  { id: "phase3", label: "Phase 3" },
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
  { id: "2021", label: "2021" },
];

// Dummy data for docket status
const docketStatusData = [
  { status: 'Existing', minor: 21, major: 18 },
  { status: 'New', minor: 19, major: 33 },
  { status: 'Close', minor: 21, major: 19 },
  { status: 'Pending', minor: 14, major: 38 },
];

const ReportCM = () => {
  // Filter states
  const [activeTab, setActiveTab] = useState("nadi");
  const [duspFilter, setDuspFilter] = useState<string | number | null>(null);
  const [nadiFilter, setNadiFilter] = useState<string | number | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<string | number | null>(null);
  const [monthFilter, setMonthFilter] = useState<string | number | null>(null);
  const [yearFilter, setYearFilter] = useState<string | number | null>("2025"); // Default to current year

  const hasActiveFiltersNadi = 
    duspFilter !== null || 
    nadiFilter !== null || 
    monthFilter !== null || 
    (yearFilter !== null && yearFilter !== "2025");

  const hasActiveFiltersPhase = 
    duspFilter !== null || 
    phaseFilter !== null || 
    monthFilter !== null || 
    (yearFilter !== null && yearFilter !== "2025");

  const resetFilters = () => {
    setDuspFilter(null);
    setNadiFilter(null);
    setPhaseFilter(null);
    setMonthFilter(null);
    setYearFilter("2025");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Comprehensive Maintenance</h1>
            <p className="text-gray-500 mt-1">View and analyze maintenance dockets across all sites</p>
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

        <Tabs defaultValue="nadi" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="nadi">By NADI</TabsTrigger>
            <TabsTrigger value="phase">By Phase</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nadi" className="mt-4">
            {/* Filters Row for NADI tab */}
            <div className="flex flex-wrap gap-2 mb-4">
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
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {duspOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setDuspFilter(option.id === duspFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                duspFilter === option.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
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
                    <Building className="h-4 w-4 text-gray-500" />
                    NADI
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0">
                  <Command>
                    <CommandInput placeholder="Search NADI..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {nadiOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setNadiFilter(option.id === nadiFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                nadiFilter === option.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
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
                    <CommandInput placeholder="Search month..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {monthOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setMonthFilter(option.id === monthFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                monthFilter === option.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
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
                    <CommandInput placeholder="Search year..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {yearOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setYearFilter(option.id === yearFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                yearFilter === option.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
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
            {hasActiveFiltersNadi && (
              <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-50 rounded-lg border border-slate-100 mb-6">
                <div className="mr-1 flex items-center">
                  <Filter className="h-4 w-4 text-slate-500 mr-1" />
                  <span className="text-sm font-medium text-slate-500">Active filters:</span>
                </div>
                {duspFilter !== null && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>DUSP: {duspOptions.find(d => d.id === duspFilter)?.label}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setDuspFilter(null)}
                    />
                  </Badge>
                )}
                {nadiFilter !== null && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>NADI: {nadiOptions.find(n => n.id === nadiFilter)?.label}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setNadiFilter(null)}
                    />
                  </Badge>
                )}
                {monthFilter !== null && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>Month: {monthOptions.find(m => m.id === monthFilter)?.label}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setMonthFilter(null)}
                    />
                  </Badge>
                )}
                {yearFilter !== null && yearFilter !== "2025" && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>Year: {yearFilter}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setYearFilter("2025")}
                    />
                  </Badge>
                )}
              </div>
            )}            {/* Main Content for NADI tab */}
            <div className="grid grid-cols-12 gap-6">
              {/* Docket Status Chart */}
              <div className="col-span-8 lg:col-span-8">
                <Card className="shadow-sm border border-gray-200 h-full overflow-hidden">
                  <CardHeader className="p-4 bg-white border-b">
                    <CardTitle className="text-lg font-medium text-gray-800">Number of Dockets by Status (Minor & Major)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 bg-white">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={docketStatusData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="minor" fill="#4f46e5" name="Minor" />
                        <Bar dataKey="major" fill="#ef4444" name="Major" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Total Docket Open Card */}
              <div className="col-span-4 lg:col-span-4">
                <Card className="shadow-sm border border-gray-200 h-full overflow-hidden">
                  <CardHeader className="p-4 bg-white border-b">
                    <CardTitle className="text-lg font-medium text-gray-800">Total Docket Open</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center p-6 bg-white">
                    <div className="p-2.5 rounded-full bg-blue-50 mb-2">
                      <ClipboardList className="h-7 w-7 text-blue-500" />
                    </div>
                    <div className="text-4xl font-bold text-gray-800">182</div>
                    <div className="text-gray-600 text-sm mt-2">Current open maintenance dockets</div>
                    <div className="mt-4 pt-4 border-t border-gray-100 w-full flex justify-between text-sm">
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-blue-600">67</span>
                        <span className="text-gray-500">Minor</span>
                      </div>
                      <div className="h-full w-px bg-gray-100"></div>
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-red-500">115</span>
                        <span className="text-gray-500">Major</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* By Phase Tab */}
          <TabsContent value="phase" className="mt-4">
            {/* Filters Row for Phase tab */}
            <div className="flex flex-wrap gap-2 mb-4">
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
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {duspOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setDuspFilter(option.id === duspFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                duspFilter === option.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
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
                    <Building className="h-4 w-4 text-gray-500" />
                    Phase
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0">
                  <Command>
                    <CommandInput placeholder="Search Phase..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {phaseOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setPhaseFilter(option.id === phaseFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                phaseFilter === option.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
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
                    <CommandInput placeholder="Search month..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {monthOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setMonthFilter(option.id === monthFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                monthFilter === option.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
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
                    <CommandInput placeholder="Search year..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {yearOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setYearFilter(option.id === yearFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                yearFilter === option.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
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
            {hasActiveFiltersPhase && (
              <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-50 rounded-lg border border-slate-100 mb-6">
                <div className="mr-1 flex items-center">
                  <Filter className="h-4 w-4 text-slate-500 mr-1" />
                  <span className="text-sm font-medium text-slate-500">Active filters:</span>
                </div>
                {duspFilter !== null && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>DUSP: {duspOptions.find(d => d.id === duspFilter)?.label}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setDuspFilter(null)}
                    />
                  </Badge>
                )}
                {phaseFilter !== null && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>Phase: {phaseOptions.find(p => p.id === phaseFilter)?.label}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setPhaseFilter(null)}
                    />
                  </Badge>
                )}
                {monthFilter !== null && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>Month: {monthOptions.find(m => m.id === monthFilter)?.label}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setMonthFilter(null)}
                    />
                  </Badge>
                )}
                {yearFilter !== null && yearFilter !== "2025" && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>Year: {yearFilter}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setYearFilter("2025")}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Main Content for Phase tab - same as NADI tab */}
            <div className="grid grid-cols-12 gap-6">
              {/* Docket Status Chart */}
              <div className="col-span-8 lg:col-span-8">
                <Card className="shadow-sm border border-gray-200 h-full overflow-hidden">
                  <CardHeader className="p-4 bg-white border-b">
                    <CardTitle className="text-lg font-medium text-gray-800">Number of Dockets by Status (Minor & Major)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 bg-white">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={docketStatusData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="minor" fill="#4f46e5" name="Minor" />
                        <Bar dataKey="major" fill="#ef4444" name="Major" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Total Docket Open Card */}
              <div className="col-span-4 lg:col-span-4">
                <Card className="shadow-sm border border-gray-200 h-full overflow-hidden">
                  <CardHeader className="p-4 bg-white border-b">
                    <CardTitle className="text-lg font-medium text-gray-800">Total Docket Open</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center p-6 bg-white">
                    <div className="p-2.5 rounded-full bg-blue-50 mb-2">
                      <ClipboardList className="h-7 w-7 text-blue-500" />
                    </div>
                    <div className="text-4xl font-bold text-gray-800">182</div>
                    <div className="text-gray-600 text-sm mt-2">Current open maintenance dockets</div>
                    <div className="mt-4 pt-4 border-t border-gray-100 w-full flex justify-between text-sm">
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-blue-600">67</span>
                        <span className="text-gray-500">Minor</span>
                      </div>
                      <div className="h-full w-px bg-gray-100"></div>
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-red-500">115</span>
                        <span className="text-gray-500">Major</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReportCM;