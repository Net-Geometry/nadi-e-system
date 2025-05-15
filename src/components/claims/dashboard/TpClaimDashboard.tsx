import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Clock, CheckSquare, XSquare, Plus } from "lucide-react";
import { useState } from "react";
import ClaimForm from "@/components/claims/ClaimForm"; // Adjusted for default import
import { ClaimList } from "@/components/claims/ClaimList";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { useDuspName } from "../hook/use-claim-data";

const TpClaimDashboard = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId = parsedMetadata?.organization_id;
  const tpName = parsedMetadata?.organization_name;
    const { duspName } = useDuspName();

  const [showNewClaimForm, setShowNewClaimForm] = useState(false);
  const { toast } = useToast();

  const { data: claimStats, isLoading } = useQuery({
    queryKey: ["claimStats"],
    queryFn: async () => {
      console.log("Fetching claim statistics...");
      const { data: stats, error } = await supabase
        .from("claims")
        .select("status")
        .returns<{ status: string }[]>();

      if (error) {
        console.error("Error fetching claim stats:", error);
        throw error;
      }

      const counts = {
        total: stats.length,
        pending: stats.filter((c) => c.status === "pending").length,
        approved: stats.filter((c) => c.status === "approved").length,
        rejected: stats.filter((c) => c.status === "rejected").length,
      };

      console.log("Claim statistics:", counts);
      return counts;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Claim Management</h1>
          <p className="text-muted-foreground mt-2">
            Submit and track your claims
          </p>
        </div>
        <Button onClick={() => setShowNewClaimForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Claim
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : claimStats?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : claimStats?.pending || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : claimStats?.approved || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : claimStats?.rejected || 0}
            </div>
          </CardContent>
        </Card>
      </div>

{showNewClaimForm ? (
  <ClaimForm
    isOpen={showNewClaimForm}
    onClose={() => setShowNewClaimForm(false)}
    organizationId={organizationId} // Pass organizationId here
    tpName={tpName} // Pass tpName here
    duspName={duspName} // Pass duspName here
  />
) : (
  <ClaimList />
)}
    </div>
  );
};

export default TpClaimDashboard;