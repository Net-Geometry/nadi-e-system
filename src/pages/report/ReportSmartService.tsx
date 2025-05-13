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
import { X, Filter, RotateCcw, Building, Calendar, Download, Upload, ChevronsUpDown, Check, Users, CalendarDays, BookOpen } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const pillarOptions = [
  { id: "entrepreneurship", label: "Entrepreneurship" },
  { id: "nadiPreneur", label: "NADI-Preneur" },
  { id: "lifelongLearning", label: "Lifelong Learning" },
  { id: "wellbeing", label: "Wellbeing" },
  { id: "awareness", label: "Awareness" },
];

const programOptions = [
  { id: "program1", label: "Program 1" },
  { id: "program2", label: "Program 2" },
  { id: "program3", label: "Program 3" },
  { id: "program4", label: "Program 4" },
  { id: "program5", label: "Program 5" },
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

// Dummy data for programs and participants by category
const programsAndParticipantsData = [
  { category: 'Entrepreneur', programs: 7, participants: 176, nadiInvolved: 43 },
  { category: 'Lifelong Learning', programs: 5, participants: 74, nadiInvolved: 17 },
  { category: 'Wellbeing', programs: 18, participants: 146, nadiInvolved: 41 },
  { category: 'Awareness', programs: 11, participants: 84, nadiInvolved: 30 },
  { category: 'Govt Initiative', programs: 7, participants: 144, nadiInvolved: 41 },
];

// Dummy data for programs and participants
const singleNadiData = [
  { category: 'Entrepreneur', programs: 6, participants: 94 },
  { category: 'Lifelong Learning', programs: 8, participants: 31 },
  { category: 'Wellbeing', programs: 6, participants: 61 },
  { category: 'Awareness', programs: 3, participants: 76 },
  { category: 'Govt Initiative', programs: 9, participants: 57 },
];

// Dummy data for program table
const programTableData = [
  { id: 1, name: 'Entrepreneur Workshop Series 1', date: '15 Apr 2025', channel: 'In-person Workshop', format: 'Physical', participants: 35 },
  { id: 2, name: 'Digital Skills Development', date: '20 Apr 2025', channel: 'Online Course', format: 'Online', participants: 57 },
  { id: 3, name: 'Community Business Forum', date: '28 Apr 2025', channel: 'Seminar', format: 'Physical', participants: 42 },
  { id: 4, name: 'Youth Leadership Program', date: '05 May 2025', channel: 'Hybrid Workshop', format: 'Hybrid', participants: 28 },
  { id: 5, name: 'Financial Literacy Webinar', date: '12 May 2025', channel: 'Webinar', format: 'Online', participants: 63 },
];

const ReportSmartService = () => {
  // Filter states and tab state
  const [activeTab, setActiveTab] = useState("phase");
  const [duspFilter, setDuspFilter] = useState<string | number | null>(null);
  const [nadiFilter, setNadiFilter] = useState<string | number | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<string | number | null>(null);
  const [pillarFilter, setPillarFilter] = useState<string | number | null>(null);
  const [programFilter, setProgramFilter] = useState<string | number | null>(null);
  const [monthFilter, setMonthFilter] = useState<string | number | null>(null);
  const [yearFilter, setYearFilter] = useState<string | number | null>("2025"); // Default to current year

  // Calculate totals
  const totalPrograms = programsAndParticipantsData.reduce((sum, item) => sum + item.programs, 0);
  const totalParticipants = programsAndParticipantsData.reduce((sum, item) => sum + item.participants, 0);

  const hasActiveFiltersPhase = 
    duspFilter !== null || 
    phaseFilter !== null || 
    monthFilter !== null || 
    yearFilter !== "2025";

  const hasActiveFiltersPillar = 
    nadiFilter !== null || 
    pillarFilter !== null || 
    programFilter !== null || 
    monthFilter !== null || 
    yearFilter !== "2025";
    
  const hasActiveFiltersMonth = 
    nadiFilter !== null || 
    monthFilter !== null || 
    yearFilter !== "2025";

  const resetFilters = () => {
    setDuspFilter(null);
    setNadiFilter(null);
    setPhaseFilter(null);
    setPillarFilter(null);
    setProgramFilter(null);
    setMonthFilter(null);
    setYearFilter("2025");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Smart Services</h1>
            <p className="text-gray-500 mt-1">View and analyze smart service programs and participation data</p>
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

        <Tabs defaultValue="phase" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-[550px] grid-cols-3">
            <TabsTrigger value="phase">By Phase</TabsTrigger>
            <TabsTrigger value="pillar">Pillar by Programme</TabsTrigger>
            <TabsTrigger value="month">By Month</TabsTrigger>
          </TabsList>
          
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
                {yearFilter !== "2025" && (
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

            {/* Main Content for Phase tab - Combined Bar and Line Chart */}
            <div className="w-full">
              <Card className="shadow-sm border border-gray-200 overflow-hidden">
                <CardHeader className="p-4 bg-white border-b">
                  <CardTitle className="text-lg font-medium text-gray-800">Programs and Participants with NADI Involvement</CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                      data={programsAndParticipantsData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="programs" name="Number of Programs" fill="#4f46e5" />
                      <Bar yAxisId="left" dataKey="participants" name="Number of Participants" fill="#ef4444" />
                      <Line yAxisId="right" type="monotone" dataKey="nadiInvolved" name="Total NADI Involved" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* By Pillar & Programme Tab */}
          <TabsContent value="pillar" className="mt-4">
            {/* Filters Row for Pillar & Programme tab */}
            <div className="flex flex-wrap gap-2 mb-4">
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

              {/* Pillar Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-10"
                  >
                    <Building className="h-4 w-4 text-gray-500" />
                    Pillar
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0">
                  <Command>
                    <CommandInput placeholder="Search Pillar..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {pillarOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setPillarFilter(option.id === pillarFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                pillarFilter === option.id ? "opacity-100" : "opacity-0"
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
              
              {/* Program Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-10"
                  >
                    <Building className="h-4 w-4 text-gray-500" />
                    Program
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0">
                  <Command>
                    <CommandInput placeholder="Search Program..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {programOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.label}
                            onSelect={() => {
                              setProgramFilter(option.id === programFilter ? null : option.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                programFilter === option.id ? "opacity-100" : "opacity-0"
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

            {/* Active Pillar Filters */}
            {hasActiveFiltersPillar && (
              <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-50 rounded-lg border border-slate-100 mb-6">
                <div className="mr-1 flex items-center">
                  <Filter className="h-4 w-4 text-slate-500 mr-1" />
                  <span className="text-sm font-medium text-slate-500">Active filters:</span>
                </div>
                {nadiFilter !== null && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>NADI: {nadiOptions.find(n => n.id === nadiFilter)?.label}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setNadiFilter(null)}
                    />
                  </Badge>
                )}
                {pillarFilter !== null && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>Pillar: {pillarOptions.find(p => p.id === pillarFilter)?.label}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setPillarFilter(null)}
                    />
                  </Badge>
                )}
                {programFilter !== null && (
                  <Badge variant="outline" className="gap-2 px-3 py-1 h-7 bg-white shadow-sm hover:bg-slate-50">
                    <span>Program: {programOptions.find(p => p.id === programFilter)?.label}</span>
                    <X
                      className="h-3.5 w-3.5 text-muted-foreground cursor-pointer"
                      onClick={() => setProgramFilter(null)}
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
                {yearFilter !== "2025" && (
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
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="shadow-sm border border-gray-200 overflow-hidden">
                <CardHeader className="p-4 bg-white border-b">
                  <CardTitle className="text-lg font-medium text-gray-800">Number of Program</CardTitle>
                </CardHeader>
                <CardContent className="p-4 bg-white">
                  <div className="flex flex-col items-center">
                    <div className="p-2 rounded-full bg-indigo-50 mb-1">
                      <CalendarDays className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mt-1">48</div>
                    <div className="text-gray-600 text-sm">Total active programs</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 w-full">
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-indigo-600">21</span>
                        <span className="text-gray-500">Entrepreneur</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-green-500">18</span>
                        <span className="text-gray-500">L. Learning</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-amber-500">9</span>
                        <span className="text-gray-500">Wellbeing</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-200 overflow-hidden">
                <CardHeader className="p-4 bg-white border-b">
                  <CardTitle className="text-lg font-medium text-gray-800">Number of Participants</CardTitle>
                </CardHeader>
                <CardContent className="p-4 bg-white">
                  <div className="flex flex-col items-center">
                    <div className="p-2 rounded-full bg-purple-50 mb-1">
                      <Users className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mt-1">624</div>
                    <div className="text-gray-600 text-sm">Total program participants</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 w-full">
                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-blue-600">412</span>
                        <span className="text-gray-500">NADI Members</span>
                      </div>
                      <div className="h-full w-px bg-gray-100"></div>
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-pink-500">212</span>
                        <span className="text-gray-500">External</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Program Table */}
            <Card className="shadow-sm border border-gray-200 overflow-hidden">
              <CardHeader className="p-4 bg-white border-b">
                <CardTitle className="text-lg font-medium text-gray-800">Program Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Program Name</TableHead>
                      <TableHead>Date Program</TableHead>
                      <TableHead>Channel/ Types</TableHead>
                      <TableHead>Online /Physical</TableHead>
                      <TableHead>Total Participants</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programTableData.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>{program.id}</TableCell>
                        <TableCell className="font-medium">{program.name}</TableCell>
                        <TableCell>{program.date}</TableCell>
                        <TableCell>{program.channel}</TableCell>
                        <TableCell>{program.format}</TableCell>
                        <TableCell>{program.participants}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Month Tab */}
          <TabsContent value="month" className="mt-4">
            {/* Filters Row for Month tab */}
            <div className="flex flex-wrap gap-2 mb-4">
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

            {/* Active Month Filters */}
            {hasActiveFiltersMonth && (
              <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-50 rounded-lg border border-slate-100 mb-6">
                <div className="mr-1 flex items-center">
                  <Filter className="h-4 w-4 text-slate-500 mr-1" />
                  <span className="text-sm font-medium text-slate-500">Active filters:</span>
                </div>
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
                {yearFilter !== "2025" && (
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

            {/* Main Content for Month tab - Bar Chart  */}
            <Card className="shadow-sm border border-gray-200 overflow-hidden">
              <CardHeader className="p-4 bg-white border-b">
                <CardTitle className="text-lg font-medium text-gray-800">Programs and Participants</CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={singleNadiData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="programs" name="Number of Programs" fill="#4f46e5" />
                    <Bar dataKey="participants" name="Number of Participants" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReportSmartService;