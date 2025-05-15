import { StatCard } from "@/components/hr/payroll/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayrollTable } from "@/components/hr/payroll/PayrollTable";
import { TabNavigation } from "@/components/hr/payroll/TabNavigation";
import { toast } from "@/hooks/use-toast";

// Mock data
const staffTypeData = [
  {
    id: 1,
    staffType: "Full-time Trainers",
    monthlyCost: 250000,
    incentive: 42000,
    notes: "Core teaching staff",
  },
  {
    id: 2,
    staffType: "Administration",
    monthlyCost: 120000,
    incentive: 18000,
    notes: "Operations support",
  },
  {
    id: 3,
    staffType: "Technical Support",
    monthlyCost: 85000,
    incentive: 12500,
    notes: "IT & equipment maintenance",
  },
  {
    id: 4,
    staffType: "Part-time Instructors",
    monthlyCost: 65000,
    incentive: 9500,
    notes: "Specialized courses",
  },
];

const columns = [
  {
    key: "staffType",
    title: "Staff Type",
  },
  {
    key: "monthlyCost",
    title: "Monthly Cost",
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
    key: "notes",
    title: "Notes",
  },
];

export function DUSPPage() {
  const handleRequestBudgetAdjustment = () => {
    toast.info("Budget adjustment request", {
      description: "Please specify the adjustment details in the form.",
      action: {
        label: "Open Form",
        onClick: () => toast.success("Budget adjustment form opened"),
      },
    });
  };

  const budgetVsActualTab = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Budget" value="RM 4,200,000" />
        <StatCard
          title="Actual Spent"
          value="RM 3,865,250"
          trend={{ value: 92, isPositive: true }}
        />
        <StatCard title="Remaining" value="RM 334,750" colorVariant="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Budget Utilization by Region
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          Budget utilization chart will appear here
        </CardContent>
      </Card>
    </div>
  );

  const incentivesBreakdownTab = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Total Incentives"
          value="RM 82,000"
          colorVariant="default"
        />
        <StatCard
          title="Highest Individual Incentives"
          value="RM 3,500"
          colorVariant="warning"
        />
      </div>

      <PayrollTable data={staffTypeData} columns={columns} />
    </div>
  );

  const ssoAllocationTab = (
    <div className="p-4 text-center text-muted-foreground">
      SSO Payroll Allocation data will appear here
    </div>
  );

  const tabs = [
    {
      value: "budget",
      label: "Budgeted vs Actual",
      content: budgetVsActualTab,
    },
    {
      value: "incentives",
      label: "Staff Incentives Breakdown",
      content: incentivesBreakdownTab,
    },
    {
      value: "sso",
      label: "SSO Payroll Allocation",
      content: ssoAllocationTab,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Financial Control Dashboard</h2>
        <Button
          className="bg-nadi-purple hover:bg-nadi-purple-light"
          onClick={handleRequestBudgetAdjustment}
        >
          Request Budget Adjustment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">
              Alert: Overpayment Flag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">
              Training Incentives exceed budget by 5% in Eastern region
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Underutilized Funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">
              Northern region at 78% of allocated payroll budget
            </p>
          </CardContent>
        </Card>
      </div>

      <TabNavigation tabs={tabs} defaultValue="budget" />
    </div>
  );
}
