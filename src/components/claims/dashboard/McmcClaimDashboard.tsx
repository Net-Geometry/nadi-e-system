import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { FileText, Clock, CheckSquare, XSquare, Plus } from "lucide-react";
import { useState } from "react";
import { ClaimForm } from "@/components/claims/ClaimForm";
import { McmcClaimList } from "@/components/claims/McmcClaimList";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function McmcClaimDashboard() {
  const userMetadata = useUserMetadata();
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
            View claim submissions status.
          </p>
        </div>
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
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full sm:w-auto flex-1">
          <Input
            type="text"
            placeholder="Search sites..."
            // value={searchTerm}
            // onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 h-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <div className="flex gap-2 self-end">
          {/* {selectedSites.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5 text-sm">
              <span className="font-medium">
                {selectedSites.length} sites selected
              </span>
              <div className="flex gap-2">
                {isSuperAdmin ||
                  (isMCMCUser && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8"
                      onClick={() => {
                        setIsDeleteDialogOpen(true);
                        setSiteToDelete(null); // Indicate that we're doing batch delete
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => setSelectedSites([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          )} */}
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white"
            // onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {showNewClaimForm ? (
        <ClaimForm
          onSuccess={() => {
            setShowNewClaimForm(false);
            toast({
              title: "Success",
              description: "Claim submitted successfully",
            });
          }}
          onCancel={() => setShowNewClaimForm(false)}
        />
      ) : (
        <McmcClaimList />
      )}
    </div>
  );
}
