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
import ClaimStatusDescriptionDialog from "../component/ClaimStatusLegend";
import { useFetchClaimDUSP } from "./hooks/fetch-claim-dusp";
import { useNavigate } from "react-router-dom";

export function ClaimListDusp() {
  const { data: claimDUSPData, isLoading: isClaimDUSPLoading } = useFetchClaimDUSP();
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const navigate = useNavigate();

  // Sorting
  const [sortField, setSortField] = useState<string>("year");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter states
  const [search, setSearch] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterQuarter, setFilterQuarter] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helpers
  const quarters = [1, 2, 3, 4];

  const handleOpenDescriptionDialog = (status: string) => {
    setSelectedStatus(status);
    setIsDescriptionDialogOpen(true);
  };
  const handleView = (claimId: number) => navigate(`/claim/report?id=${claimId}`);

  const handleExport = () => {
    if (!filteredClaims) return;
    const exportData = filteredClaims.map((claim) => ({
      TP: claim.tp_dusp_id.name,
      ReferenceNumber: claim.ref_no,
      Year: claim.year,
      Quarter: claim.quarter ? `Q${claim.quarter}` : "N/A",
      Status: claim.claim_status.name,
      PaymentStatus: claim.payment_status ? "Paid" : "Unpaid",
    }));
    exportToCSV(exportData, `claim_list_dusp_${new Date().toISOString().split("T")[0]}`);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredClaims = useMemo(() => {
    let claims =
      claimDUSPData?.filter((claim) => {
        const claimQuarter = claim.quarter ?? (claim.month ? Math.ceil(claim.month / 3) : null);
        return (
          (!search ||
            claim.tp_dusp_id.name?.toLowerCase().includes(search.toLowerCase()) ||
            claim.ref_no?.toLowerCase().includes(search.toLowerCase())) &&
          (!filterYear || claim.year?.toString() === filterYear) &&
          (!filterQuarter || (claimQuarter && claimQuarter.toString() === filterQuarter)) &&
          (!filterStatus || claim.claim_status.name === filterStatus) &&
          (!filterPaymentStatus ||
            (filterPaymentStatus === "Paid" && claim.payment_status) ||
            (filterPaymentStatus === "Unpaid" && !claim.payment_status))
        );
      }) ?? [];

    // Sorting
    if (sortField) {
      claims = [...claims].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        if (sortField === "status") {
          aValue = a.claim_status.name;
          bValue = b.claim_status.name;
        } else if (sortField === "tp") {
          aValue = a.tp_dusp_id.name;
          bValue = b.tp_dusp_id.name;
        } else if (sortField === "quarter") {
          aValue = a.quarter ?? (a.month ? Math.ceil(a.month / 3) : 0);
          bValue = b.quarter ?? (b.month ? Math.ceil(b.month / 3) : 0);
        } else if (sortField === "updated_at") {
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
        }

        if (aValue === undefined || bValue === undefined) return 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    return claims;
  }, [claimDUSPData, search, filterYear, filterQuarter, filterStatus, filterPaymentStatus, sortField, sortOrder]);

  const paginatedClaims = useMemo(() => {
    return filteredClaims?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
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

  return (
    <div className="rounded-md border p-4 space-y-4">
      <h2 className="text-xl font-bold">Claim List (DUSP)</h2>

      {/* Search & Export */}
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
        {/* Year */}
        <Select value={filterYear || "all"} onValueChange={(v) => setFilterYear(v === "all" ? null : v)}>
          <SelectTrigger className="w-[200px]">Filter by Year</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {[...new Set(claimDUSPData?.map((c) => c.year))].map((year) => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Quarter */}
        <Select value={filterQuarter || "all"} onValueChange={(v) => setFilterQuarter(v === "all" ? null : v)}>
          <SelectTrigger className="w-[200px]">Filter by Quarter</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quarters</SelectItem>
            {quarters.map((q) => (
              <SelectItem key={q} value={q.toString()}>Q{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Status */}
        <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? null : v)}>
          <SelectTrigger className="w-[200px]">Filter by Status</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {[...new Set(claimDUSPData?.map((c) => c.claim_status.name))].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Payment Status */}
        <Select value={filterPaymentStatus || "all"} onValueChange={(v) => setFilterPaymentStatus(v === "all" ? null : v)}>
          <SelectTrigger className="w-[200px]">Filter by Payment Status</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Statuses</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">No.</TableHead>
            <TableHead sortable sorted={sortField === "tp" ? sortOrder : null} onSort={() => handleSort("tp")}>TP Name</TableHead>
            <TableHead sortable sorted={sortField === "ref_no" ? sortOrder : null} onSort={() => handleSort("ref_no")}>Reference Number</TableHead>
            <TableHead sortable sorted={sortField === "year" ? sortOrder : null} onSort={() => handleSort("year")}>Year</TableHead>
            <TableHead sortable sorted={sortField === "quarter" ? sortOrder : null} onSort={() => handleSort("quarter")}>Quarter</TableHead>
            <TableHead sortable sorted={sortField === "status" ? sortOrder : null} onSort={() => handleSort("status")}>Status</TableHead>
            <TableHead sortable sorted={sortField === "payment_status" ? sortOrder : null} onSort={() => handleSort("payment_status")}>Payment Status</TableHead>
            <TableHead sortable sorted={sortField === "updated_at" ? sortOrder : null} onSort={() => handleSort("updated_at")}>Updated At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedClaims?.length ? (
            paginatedClaims.map((claim, idx) => (
              <TableRow key={claim.id}>
                <TableCell className="text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                <TableCell>{claim.tp_dusp_id.name}</TableCell>
                <TableCell>{claim.ref_no}</TableCell>
                <TableCell>{claim.year}</TableCell>
                <TableCell>{claim.quarter ? `Q${claim.quarter}` : "N/A"}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Badge className="min-w-[6rem] text-center" variant={getStatusBadgeVariant(claim.claim_status.name)}>{claim.claim_status.name}</Badge>
                  <Button size="sm" variant="outline" className="rounded-full p-0 w-6 h-6 flex items-center justify-center" onClick={() => handleOpenDescriptionDialog(claim.claim_status.name)}>i</Button>
                </TableCell>
                <TableCell>
                  <Badge variant={claim.payment_status ? "success" : "warning"}>{claim.payment_status ? "Paid" : "Unpaid"}</Badge>
                </TableCell>
                <TableCell>
                  {claim?.updated_at
                    ? new Date(new Date(claim.updated_at).getTime() + 8 * 60 * 60 * 1000).toLocaleString("en-GB")
                    : "N/A"}
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
              <TableCell colSpan={9} className="text-center">No data available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredClaims.length} />
      )}

      <ClaimStatusDescriptionDialog isOpen={isDescriptionDialogOpen} onClose={() => setIsDescriptionDialogOpen(false)} status={selectedStatus} />
    </div>
  );
}
