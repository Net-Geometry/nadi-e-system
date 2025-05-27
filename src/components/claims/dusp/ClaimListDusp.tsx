import React, { useState, useMemo } from "react";
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
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { exportToCSV } from "@/utils/export-utils";
import { Eye } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import ClaimViewDialog from "../component/ClaimViewDialog";
import ClaimStatusDescriptionDialog from "../component/ClaimStatusLegend";
import { useFetchClaimDUSP } from "./hooks/fetch-claim-dusp";

export function ClaimListDusp() {
  const { data: claimDUSPData, isLoading: isClaimDUSPLoading } = useFetchClaimDUSP();
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<number | null>(null);

  // Filter states
  const [search, setSearch] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleOpenDescriptionDialog = (status: string) => {
    setSelectedStatus(status);
    setIsDescriptionDialogOpen(true);
  };

  const handleView = (claimId: number) => {
    setSelectedClaim(claimId);
    setIsViewDialogOpen(true);
  };

  const handleExport = () => {
    if (!filteredClaims) return;

    const exportData = filteredClaims.map((claim) => ({
      TP: claim.tp_dusp_id.name,
      ReferenceNumber: claim.ref_no,
      Year: claim.year,
      Month: claim.month
        ? new Date(0, claim.month - 1).toLocaleString("default", { month: "long" })
        : "N/A",
      Status: claim.claim_status.name,
      PaymentStatus: claim.payment_status ? "Paid" : "Unpaid",
    }));

    exportToCSV(exportData, `claim_list_dusp_${new Date().toISOString().split("T")[0]}`);
  };

  const filteredClaims = useMemo(() => {
    return claimDUSPData?.filter((claim) => {
      return (
        (!search ||
          claim.tp_dusp_id.name?.toLowerCase().includes(search.toLowerCase()) ||
          claim.ref_no?.toLowerCase().includes(search.toLowerCase())) &&
        (!filterYear || claim.year?.toString() === filterYear) &&
        (!filterMonth ||
          (claim.month &&
            new Date(0, claim.month - 1)
              .toLocaleString("default", { month: "long" })
              .includes(filterMonth))) &&
        (!filterStatus || claim.claim_status.name === filterStatus) &&
        (!filterPaymentStatus ||
          (filterPaymentStatus === "Paid" && claim.payment_status) ||
          (filterPaymentStatus === "Unpaid" && !claim.payment_status))
      );
    });
  }, [claimDUSPData, search, filterYear, filterMonth, filterStatus, filterPaymentStatus]);

  const paginatedClaims = useMemo(() => {
    return filteredClaims?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredClaims, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((filteredClaims?.length || 0) / itemsPerPage);

  if (isClaimDUSPLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  return (
    <div className="rounded-md border p-4 space-y-4">
      <h2 className="text-xl font-bold">Claim List (DUSP)</h2>

      {/* Search and Export */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by TP or Reference Number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mr-4"
        />
        <Button variant="outline" onClick={handleExport}>
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Year Filter */}
        <Select onValueChange={(value) => setFilterYear(value === "all" ? null : value)} value={filterYear || "all"}>
          <SelectTrigger className="w-[200px]">
            <span>Filter by Year</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {[...new Set(claimDUSPData?.map((claim) => claim.year))].map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month Filter */}
        <Select onValueChange={(value) => setFilterMonth(value === "all" ? null : value)} value={filterMonth || "all"}>
          <SelectTrigger className="w-[200px]">
            <span>Filter by Month</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.label}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select onValueChange={(value) => setFilterStatus(value === "all" ? null : value)} value={filterStatus || "all"}>
          <SelectTrigger className="w-[200px]">
            <span>Filter by Status</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {[...new Set(claimDUSPData?.map((claim) => claim.claim_status.name))].map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Status Filter */}
        <Select onValueChange={(value) => setFilterPaymentStatus(value === "all" ? null : value)} value={filterPaymentStatus || "all"}>
          <SelectTrigger className="w-[200px]">
            <span>Filter by Payment Status</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Statuses</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">No.</TableHead>
            <TableHead>TP Name</TableHead>
            <TableHead>Reference Number</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedClaims?.length > 0 ? (
            paginatedClaims.map((claim, index) => (
              <TableRow key={claim.id}>
                <TableCell className="text-center">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>{claim.tp_dusp_id.name}</TableCell>
                <TableCell>{claim.ref_no}</TableCell>
                <TableCell>{claim.year}</TableCell>
                <TableCell>
                  {claim.month
                    ? new Date(0, claim.month - 1).toLocaleString("default", { month: "long" })
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(claim.claim_status.name)}>
                    {claim.claim_status.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={claim.payment_status ? "success" : "warning"}>
                    {claim.payment_status ? "Paid" : "Unpaid"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => handleView(claim.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredClaims?.length || 0}
        />
      )}

      {/* Claim Status Description Dialog */}
      <ClaimStatusDescriptionDialog
        isOpen={isDescriptionDialogOpen}
        onClose={() => setIsDescriptionDialogOpen(false)}
        status={selectedStatus}
      />

      {/* Claim View Dialog */}
      {selectedClaim && (
        <ClaimViewDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          claimId={selectedClaim}
        />
      )}
    </div>
  );
}