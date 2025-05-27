import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { PageContainer } from "@/components/ui/dashboard/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  MapPin,
  FileText,
  Plus,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const VendorManagement = () => {
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalStaff: 0,
    activeContracts: 0,
    pendingReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch vendor statistics
        const [vendorsRes, staffRes, contractsRes, reportsRes] =
          await Promise.all([
            supabase.from("nd_vendor_profile").select("id", { count: "exact" }),
            supabase.from("nd_vendor_staff").select("id", { count: "exact" }),
            supabase
              .from("nd_vendor_contract")
              .select("id", { count: "exact" })
              .eq("is_active", true),
            supabase.from("nd_vendor_report").select("id", { count: "exact" }),
          ]);

        setStats({
          totalVendors: vendorsRes.count || 0,
          totalStaff: staffRes.count || 0,
          activeContracts: contractsRes.count || 0,
          pendingReports: reportsRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching vendor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Vendors",
      value: stats.totalVendors,
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      title: "Total Staff",
      value: stats.totalStaff,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Active Contracts",
      value: stats.activeContracts,
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "Total Reports",
      value: stats.pendingReports,
      icon: BarChart3,
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <PageContainer>
        <div className="flex justify-between items-center mb-6">
          <PageHeader
            title="Vendor Management"
            description="Manage vendor companies, staff, and contracts"
          />
          <Button asChild>
            <Link to="/vendor/companies/new">
              <Plus className="mr-2 h-4 w-4" />
              Register New Vendor
            </Link>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon
                  className={`h-4 w-4 text-white rounded p-1 ${stat.color}`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Vendor Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View and manage all vendor companies
              </p>
              <Button asChild className="w-full">
                <Link to="/vendor/companies">View Companies</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Vendor Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage vendor staff and assignments
              </p>
              <Button asChild className="w-full">
                <Link to="/vendor/staff">View Staff</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View and manage vendor contracts
              </p>
              <Button asChild className="w-full">
                <Link to="/vendor/contracts">View Contracts</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View vendor reports and analytics
              </p>
              <Button asChild className="w-full">
                <Link to="/vendor/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
};

export default VendorManagement;