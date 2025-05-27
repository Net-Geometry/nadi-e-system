import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Clock, CheckSquare, XSquare, Plus, Send } from "lucide-react";
import { useState } from "react";
import ClaimForm from "@/components/claims/tp/ClaimForm"; // Adjusted for default import
import { ClaimListTp } from "@/components/claims/tp/ClaimListTp";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const TpClaimDashboard = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId = parsedMetadata?.organization_id;

  const navigate = useNavigate(); // Initialize useNavigate

  const { toast } = useToast();

  const { data: claimStats, isLoading } = useQuery({
    queryKey: ["claimStats"],
    enabled: !!organizationId, // only run query when orgId exists
    queryFn: async () => {
      const { data: stats, error } = await supabase
        .from("nd_claim_application")
        .select(`claim_status (id, name)`)
        .eq("tp_dusp_id", organizationId);

      if (error) {
        console.error("Error fetching claim stats:", error);
        throw error;
      }

      const counts = {
        completed: stats.filter((c) => c.claim_status.name === "COMPLETED").length,
        processing: stats.filter((c) => c.claim_status.name === "PROCESSING").length,
        submitted: stats.filter((c) => c.claim_status.name === "SUBMITTED").length,
        drafted: stats.filter((c) => c.claim_status.name === "DRAFTED").length,
      };
      return counts;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Claim Management</h1>
          <p className="text-muted-foreground mt-2">Submit and track your claims</p>
        </div>
        {/* <pre>{JSON.stringify(profileData, null, 2)}</pre> */}

        <Button
          onClick={() =>
            navigate("/claim/register")
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          New Claim
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : claimStats?.drafted || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : claimStats?.submitted || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : claimStats?.processing || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claim Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : claimStats?.completed || 0}</div>
          </CardContent>
        </Card>
      </div>

      <ClaimListTp />
    </div>
  );
};

export default TpClaimDashboard;