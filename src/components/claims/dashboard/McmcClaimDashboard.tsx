import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { FileText, Clock, CheckSquare, XSquare, Plus } from "lucide-react";
import { useState } from "react";
// import { ClaimForm } from "@/components/claims/ClaimForm";
import { ClaimList } from "@/components/claims/ClaimList";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { exportSitesToCSV } from "@/utils/export-utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/site/TableSkeleton";
import {
  Box,
  Package,
  Settings,
  DollarSign,
  CheckCircle,
  PauseCircle,
  Building2,
  Bell,
  Search,
  Download,
  Filter,
  RotateCcw,
  Users,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  ChevronsUpDown,
  X,
  Check,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { PaginationComponent } from "@/components/ui/PaginationComponent";

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
{/* 
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
        <ClaimList />
      )} */}
    </div>
  );
}
