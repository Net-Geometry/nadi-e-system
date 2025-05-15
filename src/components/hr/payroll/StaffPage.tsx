import { useState, useMemo } from "react";
import { StatCard } from "@/components/hr/payroll/StatCard";
import { PayrollTable } from "@/components/hr/payroll/PayrollTable";
import { StaffPayrollFilters } from "@/components/hr/payroll/StaffPayrollFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { filterStaffPayrollByDate } from "@/utils/export-payroll-utils";
import { Download, Banknote, CircleDollarSign, HandCoins } from "lucide-react";

// Mock staff payroll data
const payrollHistory = [
  {
    id: 1,
    date: "2025-04-15",
    month: "April",
    year: 2025,
    details: "Monthly Salary",
    amount: 5500,
    incentive: 800,
    status: (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200"
      >
        Paid
      </Badge>
    ),
    reference: "PAY/2025/04/001",
  },
  {
    id: 2,
    date: "2025-03-15",
    month: "March",
    year: 2025,
    details: "Monthly Salary",
    amount: 5500,
    incentive: 800,
    status: (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200"
      >
        Paid
      </Badge>
    ),
    reference: "PAY/2025/03/001",
  },
  {
    id: 3,
    date: "2025-02-15",
    month: "February",
    year: 2025,
    details: "Monthly Salary",
    amount: 5500,
    incentive: 800,
    status: (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200"
      >
        Paid
      </Badge>
    ),
    reference: "PAY/2025/02/001",
  },
  {
    id: 4,
    date: "2025-01-15",
    month: "January",
    year: 2025,
    details: "Monthly Salary",
    amount: 5500,
    incentive: 800,
    status: (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200"
      >
        Paid
      </Badge>
    ),
    reference: "PAY/2025/01/001",
  },
  {
    id: 5,
    date: "2024-12-15",
    month: "December",
    year: 2024,
    details: "Monthly Salary",
    amount: 5300,
    incentive: 750,
    status: (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200"
      >
        Paid
      </Badge>
    ),
    reference: "PAY/2024/12/001",
  },
  {
    id: 6,
    date: "2024-11-15",
    month: "November",
    year: 2024,
    details: "Monthly Salary",
    amount: 5300,
    incentive: 750,
    status: (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200"
      >
        Paid
      </Badge>
    ),
    reference: "PAY/2024/11/001",
  },
];

const columns = [
  {
    key: "date",
    title: "Date",
    render: (value: string) => new Date(value).toLocaleDateString("en-MY"),
  },
  {
    key: "month",
    title: "Month",
  },
  {
    key: "details",
    title: "Description",
  },
  {
    key: "amount",
    title: "Amount",
    render: (value: number) =>
      typeof value === "number" ? `RM ${value.toLocaleString()}` : "RM 0",
  },
  {
    key: "status",
    title: "Status",
    render: (value: string) => (
      <span className="text-nadi-success">{value || "N/A"}</span>
    ),
  },
  {
    key: "reference",
    title: "Reference",
  },
];

export function StaffPage() {
  const { toast } = useToast();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return filterStaffPayrollByDate(
      payrollHistory,
      searchQuery,
      monthFilter !== "all" ? parseInt(monthFilter) : undefined,
      yearFilter !== "all" ? parseInt(yearFilter) : undefined
    );
  }, [searchQuery, monthFilter, yearFilter]);

  const handleDownloadPayslip = (record: any) => {
    toast({
      title: "Downloading payslip",
      description: `Payslip for ${record.month} ${record.year} is being prepared.`,
    });

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Payslip downloaded successfully",
      });
    }, 1000);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setMonthFilter("all");
    setYearFilter("all");
  };

  // Calculate totals for current year
  const currentYear = new Date().getFullYear();
  const currentYearData = payrollHistory.filter(
    (item) => new Date(item.date).getFullYear() === currentYear
  );
  const totalAmount = currentYearData.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const totalIncentives = currentYearData.reduce(
    (sum, item) => sum + (item.incentive || 0),
    0
  );
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Paid: "bg-green-100 text-green-800 border-green-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Monthly Salary"
          value={`RM ${payrollHistory[0]?.amount.toLocaleString() || "0"}`}
          icon={<CircleDollarSign size={24} className="text-blue-500" />}
          colorVariant="primary"
          backgroundColor="bg-blue-50"
          textColor="text-blue-700"
        />
        <StatCard
          title="Monthly Incentives"
          value={`RM ${payrollHistory[0]?.incentive.toLocaleString() || "0"}`}
          icon={<HandCoins size={24} className="text-green-500" />}
          colorVariant="success"
          backgroundColor="bg-green-50"
          textColor="text-green-700"
        />
        <StatCard
          title="Year-to-Date Income"
          value={`RM ${(totalAmount + totalIncentives).toLocaleString()}`}
          icon={<Banknote size={24} className="text-gray-500" />}
          colorVariant="default"
          backgroundColor="bg-gray-50"
          textColor="text-gray-700"
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">My Payroll History</h2>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            toast({
              title: "Downloading annual income statement",
              description: `Your annual income statement for ${currentYear} is being prepared.`,
            });

            setTimeout(() => {
              toast({
                title: "Annual income statement downloaded",
              });
            }, 1500);
          }}
        >
          <Download size={16} />
          Download Annual Statement
        </Button>
      </div>

      <StaffPayrollFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        onResetFilters={resetFilters}
      />

      <PayrollTable
        data={filteredData}
        columns={columns}
        staffView={true}
        pageSize={5}
      />

      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-700">
        <p>
          <strong>Note:</strong> Payslips are typically processed by the 15th of
          each month. If you have any questions about your payroll, please
          contact HR.
        </p>
      </div>
    </div>
  );
}
