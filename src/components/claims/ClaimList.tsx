import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

import { useFetchClaimTP } from "./hook/fetch-claim-tp"; // Import the hook

import { Eye } from "lucide-react"; // Import the Eye icon
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"; // Import Tooltip components

import React, { useState } from "react";
import ClaimViewDialog from "./component/ClaimViewDialog"; // Import the dialog

export function ClaimList() {
  const { toast } = useToast();
  const { data: claimTPData, isLoading: isClaimTPLoading } = useFetchClaimTP();

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  const handleView = (claim: any) => {
    setSelectedClaim(claim);
    setIsViewDialogOpen(true);
  };

  if (isClaimTPLoading) {
    return <div>Loading claims...</div>;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "DRAFTED":
        return "default";
      case "SUBMITTED":
        return "info";
      case "PROCESSING":
        return "warning";
      case "COMPLETED":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">No.</TableHead>
            <TableHead>TP Name</TableHead>
            <TableHead>Reference Number</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claimTPData?.map((claim, index) => (
            <TableRow key={claim.id}>
              <TableRowNumber index={index} />
              <TableCell>{claim.tp_dusp_id.name}</TableCell>
              <TableCell>{claim.ref_no}</TableCell>
              <TableCell>{claim.year}</TableCell>
              <TableCell>{claim.month}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(claim.logs[0]?.status_id.name)}>
                  {claim.logs[0]?.status_id.name}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => handleView(claim)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Claim View Dialog */}
      {selectedClaim && (
        <ClaimViewDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          claim={selectedClaim}
        />
      )}
    </div>
  );
}