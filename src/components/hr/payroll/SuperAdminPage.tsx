import { StatCard } from "@/components/hr/payroll/StatCard";
import { PayrollTable } from "@/components/hr/payroll/PayrollTable";
import { TabNavigation } from "@/components/hr/payroll/TabNavigation";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  UserCheck,
  BarChart3,
  Download,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data
const payrollData = [
  {
    id: 1,
    name: "Jane Smith",
    role: "Senior Trainer",
    center: "KL Central",
    salary: 5000,
    incentive: 800,
    status: "Paid",
    lastPaid: "2025-04-28",
  },
  {
    id: 2,
    name: "Ahmad Abdullah",
    role: "Assistant Manager",
    center: "Johor Bahru",
    salary: 7500,
    incentive: 1200,
    status: "Pending",
    lastPaid: "2025-03-28",
  },
  {
    id: 3,
    name: "Mei Ling",
    role: "Technical Lead",
    center: "Penang",
    salary: 9000,
    incentive: 1500,
    status: "Paid",
    lastPaid: "2025-04-28",
  },
  {
    id: 4,
    name: "Rajesh Kumar",
    role: "Instructor",
    center: "KL East",
    salary: 4500,
    incentive: 600,
    status: "Pending",
    lastPaid: "2025-03-28",
  },
  {
    id: 5,
    name: "Sarah Johnson",
    role: "Site Supervisor",
    center: "Kuching",
    salary: 6200,
    incentive: 950,
    status: "Paid",
    lastPaid: "2025-04-28",
  },
];

// Center-specific data
const centerData = [
  {
    id: 1,
    center: "KL Central",
    staffCount: 12,
    totalSalary: 82000,
    incentives: 11500,
    pendingApprovals: 3,
  },
  {
    id: 2,
    center: "Johor Bahru",
    staffCount: 8,
    totalSalary: 53000,
    incentives: 8200,
    pendingApprovals: 2,
  },
  {
    id: 3,
    center: "Penang",
    staffCount: 9,
    totalSalary: 61500,
    incentives: 9300,
    pendingApprovals: 4,
  },
  {
    id: 4,
    center: "KL East",
    staffCount: 6,
    totalSalary: 32000,
    incentives: 4800,
    pendingApprovals: 1,
  },
  {
    id: 5,
    center: "Kuching",
    staffCount: 5,
    totalSalary: 28000,
    incentives: 4200,
    pendingApprovals: 2,
  },
];

// Role-specific data
const roleData = [
  {
    id: 1,
    role: "Senior Trainer",
    staffCount: 6,
    averageSalary: 5200,
    totalBudget: 31200,
    pendingApprovals: 2,
  },
  {
    id: 2,
    role: "Assistant Manager",
    staffCount: 4,
    averageSalary: 7200,
    totalBudget: 28800,
    pendingApprovals: 1,
  },
  {
    id: 3,
    role: "Technical Lead",
    staffCount: 3,
    averageSalary: 8800,
    totalBudget: 26400,
    pendingApprovals: 0,
  },
  {
    id: 4,
    role: "Instructor",
    staffCount: 18,
    averageSalary: 4500,
    totalBudget: 81000,
    pendingApprovals: 6,
  },
  {
    id: 5,
    role: "Site Supervisor",
    staffCount: 5,
    averageSalary: 6000,
    totalBudget: 30000,
    pendingApprovals: 3,
  },
];

// Helper function to safely format currency values
const formatCurrency = (value?: number) => {
  return typeof value === "number" ? value.toLocaleString() : "0";
};

const columns = [
  {
    key: "name",
    title: "Staff Name",
  },
  {
    key: "role",
    title: "Role",
  },
  {
    key: "center",
    title: "Center",
  },
  {
    key: "salary",
    title: "Monthly Salary",
    render: (value: number) =>
      typeof value === "number" ? `RM ${value.toLocaleString()}` : "RM 0",
  },
  {
    key: "incentive",
    title: "Incentive",
    render: (value: number) =>
      typeof value === "number" ? `RM ${value.toLocaleString()}` : "RM 0",
  },
  {
    key: "status",
    title: "Status",
    render: (value: string) => (
      <span
        className={
          value === "Paid"
            ? "text-nadi-success"
            : "text-nadi-warning font-medium"
        }
      >
        {value || "N/A"}
      </span>
    ),
  },
  {
    key: "lastPaid",
    title: "Last Paid",
    render: (value: string) =>
      value ? new Date(value).toLocaleDateString() : "N/A",
  },
];

const centerColumns = [
  {
    key: "center",
    title: "Center Name",
  },
  {
    key: "staffCount",
    title: "Staff Count",
  },
  {
    key: "totalSalary",
    title: "Total Salary",
    render: (value: number) =>
      typeof value === "number" ? `RM ${value.toLocaleString()}` : "RM 0",
  },
  {
    key: "incentives",
    title: "Total Incentive",
    render: (value: number) =>
      typeof value === "number" ? `RM ${value.toLocaleString()}` : "RM 0",
  },
  {
    key: "pendingApprovals",
    title: "Pending Approvals",
    render: (value: number) => (
      <span
        className={
          value > 0 ? "text-nadi-warning font-medium" : "text-nadi-success"
        }
      >
        {value}
      </span>
    ),
  },
];

const roleColumns = [
  {
    key: "role",
    title: "Role",
  },
  {
    key: "staffCount",
    title: "Staff Count",
  },
  {
    key: "averageSalary",
    title: "Average Salary",
    render: (value: number) =>
      typeof value === "number" ? `RM ${value.toLocaleString()}` : "RM 0",
  },
  {
    key: "totalBudget",
    title: "Total Budget",
    render: (value: number) =>
      typeof value === "number" ? `RM ${value.toLocaleString()}` : "RM 0",
  },
  {
    key: "pendingApprovals",
    title: "Pending Approvals",
    render: (value: number) => (
      <span
        className={
          value > 0 ? "text-nadi-warning font-medium" : "text-nadi-success"
        }
      >
        {value}
      </span>
    ),
  },
];

export function SuperAdminPage() {
  const handleConfigureRules = () => {
    toast.info("Opening payroll rules configuration", {
      description:
        "This will allow you to set approval thresholds and payment schedules.",
    });
  };

  const handleDownloadReport = (reportType: string) => {
    toast.success(`Downloading ${reportType} payroll report`, {
      description:
        "The report will be available in your downloads folder shortly.",
    });
  };

  const allStaffTab = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Payroll (April)"
          value="RM 178,500"
          icon={<Calendar size={18} />}
          trend={{ value: 2.5, isPositive: true }}
        />
        <StatCard
          title="Pending Approvals"
          value="12"
          icon={<UserCheck size={18} />}
          colorVariant="warning"
        />
        <StatCard
          title="Budget Utilization"
          value="87%"
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Staff Payroll Records</h2>
        <Button
          className="bg-nadi-purple hover:bg-nadi-purple-light"
          onClick={handleConfigureRules}
        >
          Configure Payroll Rules
        </Button>
      </div>

      <PayrollTable data={payrollData} columns={columns} />
    </div>
  );

  const byCenterTab = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Centers"
          value="5"
          icon={<BarChart3 size={18} />}
        />
        <StatCard
          title="Highest Payroll"
          value="KL Central"
          subValue="RM 82,000"
          colorVariant="success"
        />
        <StatCard
          title="Pending Center Approvals"
          value="12"
          icon={<UserCheck size={18} />}
          colorVariant="warning"
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Center Payroll Summary</h2>
        <Button
          className="gap-2"
          variant="outline"
          onClick={() => handleDownloadReport("center")}
        >
          <Download size={16} />
          Download Report
        </Button>
      </div>

      <PayrollTable data={centerData} columns={centerColumns} />

      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-700">
        <p>
          <strong>Note:</strong> Center budgets are allocated on a quarterly
          basis. Next allocation: June 2025
        </p>
      </div>
    </div>
  );

  const byRoleTab = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Role Categories"
          value="5"
          icon={<BarChart3 size={18} />}
        />
        <StatCard
          title="Highest Avg. Salary"
          value="Technical Lead"
          subValue="RM 8,800"
          colorVariant="success"
        />
        <StatCard
          title="Total Instructors"
          value="18"
          subValue="Largest role group"
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Role-Based Payroll Summary</h2>
        <Button
          className="gap-2"
          variant="outline"
          onClick={() => handleDownloadReport("role")}
        >
          <Download size={16} />
          Download Report
        </Button>
      </div>

      <PayrollTable data={roleData} columns={roleColumns} />

      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-700">
        <p>
          <strong>Note:</strong> Annual role-based salary reviews scheduled for
          July 2025
        </p>
      </div>
    </div>
  );

  const tabs = [
    { value: "all-staff", label: "All Staff", content: allStaffTab },
    { value: "by-center", label: "By Center", content: byCenterTab },
    { value: "by-role", label: "By Role", content: byRoleTab },
  ];

  return (
    <div className="space-y-6">
      <TabNavigation tabs={tabs} defaultValue="all-staff" />
    </div>
  );
}
