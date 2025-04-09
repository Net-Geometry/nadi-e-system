
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, XSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TableRowNumber } from "@/components/ui/TableRowNumber";

export function ClaimList() {
  const { toast } = useToast();

  const { data: claims, isLoading, refetch } = useQuery({
    queryKey: ["claims"],
    queryFn: async () => {
      console.log("Fetching claims...");
      const { data, error } = await supabase
        .from("claims")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching claims:", error);
        throw error;
      }

      console.log("Claims fetched:", data);
      return data;
    },
  });

  const updateClaimStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("claims")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Claim ${status} successfully`,
      });

      refetch();
    } catch (error) {
      console.error("Error updating claim:", error);
      toast({
        title: "Error",
        description: "Failed to update claim status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div>Loading claims...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">No.</TableHead>
            <TableHead>Claim Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims?.map((claim, index) => (
            <TableRow key={claim.id}>
              <TableRowNumber index={index} />
              <TableCell>{claim.claim_number}</TableCell>
              <TableCell className="capitalize">{claim.claim_type}</TableCell>
              <TableCell>{claim.title}</TableCell>
              <TableCell>${claim.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(claim.status)}>
                  {claim.status}
                </Badge>
              </TableCell>
              <TableCell>
                {claim.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateClaimStatus(claim.id, "approved")}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateClaimStatus(claim.id, "rejected")}
                    >
                      <XSquare className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
