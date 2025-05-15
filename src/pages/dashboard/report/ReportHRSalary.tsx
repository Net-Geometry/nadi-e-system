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
import { X, Filter, RotateCcw, Users, Building, Building2, Calendar, Download, Upload, ChevronsUpDown, Check, Award, UserPlus, UserMinus, DollarSign } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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

// Data for charts based on card information
const employeeDistributionData = [
    { name: 'Manager', value: 24, color: '#0088FE' },
    { name: 'Assistant Manager', value: 36, color: '#00C49F' },
    { name: 'Part Timer', value: 68, color: '#FF8042' }, // Updated to match the Number of Employees card (68)
];

// Vacancies distribution data
const vacanciesData = [
    { department: 'Manager', open: 6, filled: 2, color: '#0088FE' },
    { department: 'Assistant Manager', open: 4, filled: 1, color: '#00C49F' },
];

// Turnover rate data
const turnoverRateData = [
    { month: 'July', rate: 5.1 },
    { month: 'Aug', rate: 4.9 },
    { month: 'Sep', rate: 5.2 },
    { month: 'Oct', rate: 4.7 },
    { month: 'Nov', rate: 4.5 },
    { month: 'Dec', rate: 4.8 }
];


const ReportHRSalary = () => {
    // Filter states
    const [duspFilter, setDuspFilter] = useState<string | number | null>(null);
    const [phaseFilter, setPhaseFilter] = useState<(string | number)[]>([]);
    const [monthFilter, setMonthFilter] = useState<string | number | null>(null);
    const [yearFilter, setYearFilter] = useState<string | number | null>("2025"); // Default to current year

    const hasActiveFilters =
        duspFilter !== null ||
        phaseFilter.length > 0 ||
        monthFilter !== null ||
        (yearFilter !== null && yearFilter !== "2025");

    const resetFilters = () => {
        setDuspFilter(null);
        setPhaseFilter([]);
        setMonthFilter(null);
        setYearFilter("2025");
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">        <div className="flex justify-between items-center">
                <div>            <h1 className="text-xl font-bold">Human Resources</h1>
                    <p className="text-gray-500 mt-1">View and analyze staff data across all NADI sites</p>
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
                    {/* DUSP Filter */}          <Popover>
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
                                                >                          {duspFilter === dusp.id && (
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

                    {/* Phase Filter */}          <Popover>
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
                                                >                          {phaseFilter.includes(phase.id) && (
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

                    {/* Month Filter */}          <Popover>
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
                                                >                          {monthFilter === month.id && (
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

                    {/* Year Filter */}          <Popover>
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
                                                >                          {yearFilter === year.id && (
                                                    <Check className="h-3 w-3 text-white" />
                                                )}
                                                </div>
                                                {year.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>              </Command>
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
                    {/* Number of Employees Card */}
                    <Card className="overflow-hidden shadow-sm border border-gray-200 lg:col-span-3">
                        <CardHeader className="p-4 bg-white border-b">
                            <CardTitle className="text-lg font-medium text-gray-800">Number of Employees</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-full bg-blue-50">
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <span className="text-gray-600 font-medium">Staff Count</span>
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-medium">128</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Manager:</span>
                                    <span className="font-medium">24</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Assistant Manager:</span>
                                    <span className="font-medium">36</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Part Timer:</span>
                                    <span className="font-medium">68</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>          {/* Staff Processing Card */}
                    <Card className="overflow-hidden shadow-sm border border-gray-200 lg:col-span-2">
                        <CardHeader className="p-4 bg-white border-b">
                            <CardTitle className="text-lg font-medium text-gray-800">Salary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 rounded-full bg-green-50">
                                    <Users className="h-5 w-5 text-green-500" />
                                </div>
                                <span className="text-gray-600 font-medium">Site</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-gray-800 mb-2">12</div>
                                    <div className="text-sm text-gray-500 mt-1">Active NADI Site</div>
                                    {/* <div className="text-sm text-gray-500">Processing staff records this period</div> */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>          {/* Performance Recognition Card */}
                    <Card className="overflow-hidden shadow-sm border border-gray-200 lg:col-span-2">
                        <CardHeader className="p-4 bg-white border-b">
                            <CardTitle className="text-lg font-medium text-gray-800">Performance Incentives</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-full bg-amber-50">
                                    <Award className="h-5 w-5 text-amber-500" />
                                </div>
                                <span className="text-gray-600 font-medium">Site</span>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-800 mb-2">8</div>
                                <div className="text-sm text-gray-500 mt-1">Active NADI Site</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Number of Vacancies Card */}
                    <Card className="overflow-hidden shadow-sm border border-gray-200 lg:col-span-2">
                        <CardHeader className="p-4 bg-white border-b">
                            <CardTitle className="text-lg font-medium text-gray-800">Vacancies</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-full bg-purple-50">
                                    <UserPlus className="h-5 w-5 text-purple-500" />
                                </div>
                                <span className="text-gray-600 font-medium">Open Positions</span>
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-medium">10</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Manager:</span>
                                    <span className="font-medium">6</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Assistant Manager:</span>
                                    <span className="font-medium">4</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Turnover Rate Card */}
                    <Card className="overflow-hidden shadow-sm border border-gray-200 lg:col-span-3">
                        <CardHeader className="p-4 bg-white border-b">
                            <CardTitle className="text-lg font-medium text-gray-800">Turnover Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-full bg-red-50">
                                    <UserMinus className="h-5 w-5 text-red-500" />
                                </div>
                                <span className="text-gray-600 font-medium">Annual Rate</span>
                            </div>
                            <div className="mt-3 text-center">
                                <div className="text-2xl font-bold text-gray-800">4.8%</div>
                                <div className="text-sm text-gray-500 mt-1">Last 12 months</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>        {/* Graphs Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Employee Distribution Pie Chart */}
                    <Card className="overflow-hidden shadow-sm border border-gray-200">
                        <CardHeader className="p-4 bg-white border-b">
                            <CardTitle className="text-lg font-medium text-gray-800">Employee Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-full bg-blue-50">
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <span className="text-gray-600 font-medium">NADI Staff Categories</span>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={employeeDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {employeeDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} staff members`, 'Count']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-xs text-center text-gray-500 mt-2">
                                Total NADI Involvement: {employeeDistributionData.reduce((sum, item) => sum + item.value, 0)} staff members
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vacancies Chart */}
                    <Card className="overflow-hidden shadow-sm border border-gray-200">
                        <CardHeader className="p-4 bg-white border-b">
                            <CardTitle className="text-lg font-medium text-gray-800">Vacancies Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-full bg-purple-50">
                                    <UserPlus className="h-5 w-5 text-purple-500" />
                                </div>
                                <span className="text-gray-600 font-medium">Department Vacancies</span>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={vacanciesData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="department" type="category" width={100} />
                                    <Tooltip formatter={(value, name) => [`${value} positions`, name === 'open' ? 'Open' : 'In Progress']} />
                                    <Legend />
                                    <Bar dataKey="open" name="Open Positions" fill="#FF8042" />
                                    <Bar dataKey="filled" name="In Hiring Process" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="text-xs text-center text-gray-500 mt-2">
                                Total Open Positions: {vacanciesData.reduce((sum, item) => sum + item.open, 0)},
                                In Progress: {vacanciesData.reduce((sum, item) => sum + item.filled, 0)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Turnover Rate Chart */}
                    <Card className="overflow-hidden shadow-sm border border-gray-200">
                        <CardHeader className="p-4 bg-white border-b">
                            <CardTitle className="text-lg font-medium text-gray-800">Turnover Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-full bg-red-50">
                                    <UserMinus className="h-5 w-5 text-red-500" />
                                </div>
                                <span className="text-gray-600 font-medium">Monthly Turnover Analysis</span>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={turnoverRateData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, 10]} />
                                    <Tooltip formatter={(value) => [`${value}%`, 'Turnover Rate']} />
                                    <Legend />                  <Line type="monotone" dataKey="rate" stroke="#FF5252" name="Turnover Rate (%)" />
                                    <Line type="monotone" dataKey="rate" stroke="#FF5252" dot={{ stroke: '#FF5252', strokeWidth: 2, r: 4 }} activeDot={{ stroke: '#FF5252', strokeWidth: 2, r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="text-xs text-center text-gray-500 mt-2">
                                Average Turnover Rate: {(turnoverRateData.reduce((sum, item) => sum + item.rate, 0) / turnoverRateData.length).toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportHRSalary;