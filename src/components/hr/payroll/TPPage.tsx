
import { useState, useMemo } from "react";
import { StatCard } from "@/components/hr/payroll/StatCard";
import { PayrollTable } from "@/components/hr/payroll/PayrollTable";
import { PayrollFilters } from "@/components/hr/payroll/PayrollFilters";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  filterPayrollData, 
  exportSelectedPayrollToCSV 
} from "@/utils/export-payroll-utils";

// Mock data
const teamData = [
  {
    id: 1,
    name: "David Chen",
    position: "Senior Developer",
    payment: 8500,
    status: "Paid",
    allowance: 1200,
    center: "KL Central",
    lastPaid: "2025-04-15",
  },
  {
    id: 2,
    name: "Aisha Mohammed",
    position: "UX Designer",
    payment: 7200,
    status: "Paid",
    allowance: 900,
    center: "KL Central",
    lastPaid: "2025-04-15",
  },
  {
    id: 3,
    name: "Raj Patel",
    position: "QA Engineer",
    payment: 6800,
    status: "Pending",
    allowance: 800,
    center: "Penang",
    lastPaid: "2025-03-15",
  },
  {
    id: 4,
    name: "Lee Min",
    position: "Junior Developer",
    payment: 4500,
    status: "Pending",
    allowance: 600,
    center: "KL East",
    lastPaid: "2025-03-15",
  },
  {
    id: 5,
    name: "Sarah Johnson",
    position: "Senior Developer",
    payment: 8700,
    status: "Paid",
    allowance: 1200,
    center: "Johor",
    lastPaid: "2025-04-15",
  },
  {
    id: 6,
    name: "Michael Wong",
    position: "Project Manager",
    payment: 9500,
    status: "Paid",
    allowance: 1500,
    center: "KL Central",
    lastPaid: "2025-04-15",
  },
  {
    id: 7,
    name: "Fatimah Zahra",
    position: "UX Designer",
    payment: 7500,
    status: "Pending",
    allowance: 900,
    center: "Kuching",
    lastPaid: "2025-03-15",
  },
  {
    id: 8,
    name: "Chong Wei",
    position: "Systems Analyst",
    payment: 8200,
    status: "Paid",
    allowance: 1000,
    center: "Penang",
    lastPaid: "2025-04-15",
  },
];

const columns = [
  {
    key: "name",
    title: "Team Member",
  },
  {
    key: "position",
    title: "Position",
  },
  {
    key: "payment",
    title: "Monthly Payment",
    render: (value: number) =>
      typeof value === "number" ? `RM ${value.toLocaleString()}` : "RM 0",
  },
  {
    key: "status",
    title: "Payment Status",
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
];

export function TPPage() {
  const { toast } = useToast();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentRange, setPaymentRange] = useState<[number, number]>([0, 15000]);
  
  // Get unique position and status options
  const positionOptions = useMemo(() => {
    return Array.from(new Set(teamData.map(item => item.position)));
  }, []);
  
  const statusOptions = useMemo(() => {
    return Array.from(new Set(teamData.map(item => item.status)));
  }, []);
  
  // Calculate min and max payment values from data
  const minPayment = useMemo(() => {
    return Math.min(...teamData.map(item => item.payment));
  }, []);
  
  const maxPayment = useMemo(() => {
    return Math.max(...teamData.map(item => item.payment));
  }, []);
  
  // Filter data based on filters
  const filteredData = useMemo(() => {
    return filterPayrollData(
      teamData, 
      searchQuery, 
      positionFilter, 
      statusFilter, 
      paymentRange[0], 
      paymentRange[1]
    );
  }, [searchQuery, positionFilter, statusFilter, paymentRange]);
  
  const handleSubmitPayrollClaim = () => {
    toast({
      title: "Preparing payroll claim submission",
      description: "Please review your team's information before submitting."
    });

    // Simulate form opening delay
    setTimeout(() => {
      toast({
        title: "Payroll claim form ready",
        action: (
          <Button 
            onClick={() => toast({
              title: "Claim submitted successfully"
            })} 
            variant="default" 
            size="sm"
          >
            Submit
          </Button>
        )
      });
    }, 1500);
  };

  const handleUploadProof = () => {
    toast({
      title: "Upload payment proof documentation",
      description: "Accepted formats: PDF, JPEG, PNG (max 10MB)",
      action: (
        <Button
          onClick={() => {
            // In a real app, this would open a file picker
            setTimeout(() => {
              toast({
                title: "Document uploaded successfully"
              });
            }, 1000);
          }}
          variant="default"
          size="sm"
        >
          Select File
        </Button>
      )
    });
  };
  
  const resetFilters = () => {
    setSearchQuery("");
    setPositionFilter("all");
    setStatusFilter("all");
    setPaymentRange([minPayment, maxPayment]);
  };
  
  const handleExportSelected = (selectedRecords: any[]) => {
    exportSelectedPayrollToCSV(selectedRecords, 'team-payroll-selected');
  };
  
  const handleExportAll = () => {
    if (filteredData.length === 0) {
      toast({
        title: "No records to export",
        description: "There are no records matching your current filters."
      });
      return;
    }
    
    exportSelectedPayrollToCSV(filteredData, 'team-payroll-all');
    toast({
      title: `Exported ${filteredData.length} records`,
      description: "The file has been downloaded to your device."
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Team Monthly Payroll" value="RM 27,000" />
        <StatCard
          title="Training Bonus Awarded"
          value="RM 4,200"
          colorVariant="success"
        />
        <StatCard
          title="Pending Reimbursements"
          value="RM 1,850"
          colorVariant="warning"
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Team Payroll</h2>
        <div className="flex gap-2">
          <Button
            className="bg-nadi-purple hover:bg-nadi-purple-light gap-2"
            onClick={handleSubmitPayrollClaim}
          >
            <FileText size={16} />
            Submit Payroll Claim
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleUploadProof}
          >
            <Upload size={16} />
            Upload Proof
          </Button>
        </div>
      </div>

      <PayrollFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        positionFilter={positionFilter}
        setPositionFilter={setPositionFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentRange={paymentRange}
        setPaymentRange={setPaymentRange}
        positionOptions={positionOptions}
        statusOptions={statusOptions}
        minPayment={minPayment}
        maxPayment={maxPayment}
        onResetFilters={resetFilters}
        onExportAll={handleExportAll}
      />

      <PayrollTable 
        data={filteredData} 
        columns={columns} 
        onExportSelected={handleExportSelected} 
      />

      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-700">
        <p>
          <strong>Note:</strong> Please submit all payroll claims by the 25th of
          each month.
        </p>
      </div>
    </div>
  );
}
