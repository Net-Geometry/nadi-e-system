
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { PageContainer } from "@/components/ui/dashboard/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Eye, Download, MoreHorizontal, FileText, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VendorReport {
  id: number;
  registration_number: string;
  report_type: string;
  report_date: string;
  notes: string;
  notify_email: string;
  created_at: string;
  vendor_name?: string;
}

const VendorReports = () => {
  const [reports, setReports] = useState<VendorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: reportsData, error } = await supabase
        .from("nd_vendor_report")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get vendor names for each report
      const reportsWithVendorNames = await Promise.all(
        (reportsData || []).map(async (report) => {
          const { data: vendorData } = await supabase
            .from("nd_vendor_profile")
            .select("business_name")
            .eq("registration_number", report.registration_number)
            .maybeSingle();

          return {
            ...report,
            vendor_name: vendorData?.business_name || "Unknown Vendor",
          };
        })
      );

      setReports(reportsWithVendorNames);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: VendorReport) => {
    console.log("Viewing report:", report);
    // TODO: Implement report viewing functionality
    toast({
      title: "Report View",
      description: "Report viewing functionality will be implemented soon",
    });
  };

  const handleDownloadReport = (report: VendorReport) => {
    console.log("Downloading report:", report);
    // TODO: Implement report download functionality
    toast({
      title: "Download Report",
      description: "Report download functionality will be implemented soon",
    });
  };

  const getReportTypeBadge = (type: string) => {
    const typeColors: { [key: string]: string } = {
      "monthly": "bg-blue-500",
      "quarterly": "bg-green-500",
      "annual": "bg-purple-500",
      "incident": "bg-red-500",
      "maintenance": "bg-orange-500",
      "default": "bg-gray-500",
    };

    return typeColors[type.toLowerCase()] || typeColors.default;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredReports = reports.filter(
    (report) =>
      report.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.report_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageContainer>
        <div className="flex justify-between items-center mb-6">
          <PageHeader
            title="Vendor Reports"
            description="View and manage vendor reports and documentation"
          />
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : reports.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "..."
                  : reports.filter(
                      (r) =>
                        new Date(r.created_at).getMonth() === new Date().getMonth()
                    ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Reports</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "..."
                  : reports.filter((r) => r.report_type === "monthly").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incident Reports</CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "..."
                  : reports.filter((r) => r.report_type === "incident").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-6">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Company</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading reports...
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.vendor_name}
                      </TableCell>
                      <TableCell>{report.registration_number}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${getReportTypeBadge(
                            report.report_type
                          )} text-white`}
                        >
                          {report.report_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.report_date ? formatDate(report.report_date) : "N/A"}
                      </TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewReport(report)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadReport(report)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
};

export default VendorReports;
