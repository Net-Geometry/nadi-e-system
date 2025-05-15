import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMaintenance } from "@/hooks/use-maintenance";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import {
  getMaintenanceStatus,
  humanizeMaintenanceStatus,
  MaintenanceRequest,
  MaintenanceStatus,
} from "@/types/maintenance";
import { format } from "date-fns";
import { Download, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getMaintenanceStatusClass,
  getMaintenanceStatusIcon,
  getSLACategoryClass,
} from "./MaintenanceStatusBadge";
import { ViewMaintenanceDetailsDialog } from "./ViewMaintenanceDetailsDialog";
import { ViewMaintenanceDetailsDialogPM } from "./ViewMaintenanceDetailsDialogPM";

interface MaintenanceListProps {
  maintenanceRequests: MaintenanceRequest[];
  isLoadingMaintenanceRequests: boolean;
  refetch: () => void;
  type?: string;
}
export const MaintenanceList = ({
  maintenanceRequests,
  isLoadingMaintenanceRequests,
  refetch,
  type,
}: MaintenanceListProps) => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
  const isTPUser =
    parsedMetadata?.user_group_name === "TP" &&
    !!parsedMetadata?.organization_id;
  const isDUSPUser =
    parsedMetadata?.user_group_name === "DUSP" &&
    !!parsedMetadata?.organization_id;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    (isTPUser || isDUSPUser) &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;

  const [isViewDetailsDialogCMOpen, setIsViewDetailsDialogCMOpen] =
    useState(false);
  const [isViewDetailsDialogPMOpen, setIsViewDetailsDialogPMOpen] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState<MaintenanceRequest | null>(
    null
  );

  useEffect(() => {
    if (!isViewDetailsDialogCMOpen) refetch();
  }, [isViewDetailsDialogCMOpen, refetch]);

  const { useMaintenanceTypesQuery } = useMaintenance();

  const { data: maintenanceTypes = [], isLoading: isLoadingMaintenanceTypes } =
    useMaintenanceTypesQuery();

  const statuses = Object.values(MaintenanceStatus);

  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (isLoadingMaintenanceRequests || isLoadingMaintenanceTypes) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const filteredMaintenanceRequests = (maintenanceRequests ?? [])
    .filter((maintenanceRequest) =>
      maintenanceRequest.description
        .toLowerCase()
        .includes(filter.toLowerCase())
    )
    .filter((maintenanceRequest) =>
      typeFilter
        ? String(maintenanceRequest?.type.id) === String(typeFilter)
        : true
    )
    .filter((maintenanceRequest) =>
      statusFilter ? maintenanceRequest.status === statusFilter : true
    );

  const paginatedMaintenanceRequests = filteredMaintenanceRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(
    filteredMaintenanceRequests.length / itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredMaintenanceRequests.length
  );

  const exportRequestsAsCSV = (maintenanceRequests: MaintenanceRequest[]) => {
    if (!maintenanceRequests || maintenanceRequests.length === 0) {
      console.warn("No maintenanceRequests to export.");
      return;
    }

    const headers = ["No.", "Docket No.", "Description", "Type", "Status"];

    if (type === "cm") {
      const insertIndex = headers.indexOf("Status");
      headers.splice(insertIndex, 0, "SLA");
    }

    // Convert maintenanceRequests to rows
    const rows = maintenanceRequests.map((maintenanceRequest, index) => {
      const row = [
        index + 1,
        String(maintenanceRequest.no_docket),
        maintenanceRequest.description ?? "",
        maintenanceRequest.type?.name ?? "",
        // insert "SLA" before status if type === "cm"
        maintenanceRequest.status,
      ];

      if (type === "cm") {
        const insertIndex = row.length - 1; // before "Status"
        row.splice(insertIndex, 0, maintenanceRequest.sla.name ?? "");
      }

      return row;
    });
    const csvContent = [headers, ...rows]
      .map((e) => e.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return csvContent;
  };

  const handleExportMaintenances = () => {
    const csvContent = exportRequestsAsCSV(filteredMaintenanceRequests);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "maintenance_requests.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="relative mb-4 flex space-x-4">
        <Input
          placeholder="Search maintenance requests..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Types</option>
            {maintenanceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Statuses</option>
            {statuses.map((status, index) => (
              <option key={index} value={status}>
                {humanizeMaintenanceStatus(status)}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Button
            disabled={isLoadingMaintenanceTypes}
            onClick={handleExportMaintenances}
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        {isLoadingMaintenanceRequests ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Docket No.</TableHead>
                <TableHead>Type</TableHead>
                {type === "cm" && (
                  <>
                    <TableHead>SLA</TableHead>
                    <TableHead>Estimate Date</TableHead>
                  </>
                )}
                <TableHead>Status</TableHead>
                <TableHead>Last Action</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Docket No.</TableHead>
                <TableHead>Type</TableHead>
                {type === "cm" && (
                  <>
                    <TableHead>SLA</TableHead>
                    <TableHead>Estimate Date</TableHead>
                  </>
                )}
                <TableHead>Status</TableHead>
                <TableHead>Last Action</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMaintenanceRequests.length > 0 ? (
                paginatedMaintenanceRequests.map(
                  (maintenanceRequest, index) => {
                    return (
                      <TableRow key={maintenanceRequest.id}>
                        <TableCell>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>{maintenanceRequest?.no_docket}</TableCell>
                        <TableCell>
                          {maintenanceRequest?.type?.name || ""}
                        </TableCell>
                        {type === "cm" && (
                          <>
                            <TableCell>
                              <Badge
                                className={getSLACategoryClass(
                                  maintenanceRequest?.sla
                                )}
                              >
                                {maintenanceRequest?.sla?.name || "Not set"}{" "}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {(maintenanceRequest?.maintenance_date &&
                                format(
                                  maintenanceRequest?.maintenance_date,
                                  "dd/MM/yyyy"
                                )) ||
                                "Not set"}
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div>
                              {getMaintenanceStatusIcon(
                                getMaintenanceStatus(maintenanceRequest?.status)
                              )}
                            </div>
                            <Badge
                              className={getMaintenanceStatusClass(
                                getMaintenanceStatus(maintenanceRequest?.status)
                              )}
                            >
                              {maintenanceRequest?.status
                                ? humanizeMaintenanceStatus(
                                    maintenanceRequest?.status
                                  )
                                : "No status"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(maintenanceRequest?.updated_at &&
                            format(
                              maintenanceRequest.updated_at,
                              "dd/MM/yyyy h:mm a"
                            )) ||
                            ""}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Details"
                            onClick={() => {
                              setSelectedItem(maintenanceRequest);
                              if (type === "cm") {
                                setIsViewDetailsDialogCMOpen(true);
                              } else {
                                setIsViewDetailsDialogPMOpen(true);
                              }
                            }}
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No maintenance requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {totalPages > 1 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startItem={startItem}
          endItem={endItem}
          totalItems={filteredMaintenanceRequests.length}
        />
      )}
      <ViewMaintenanceDetailsDialog
        open={isViewDetailsDialogCMOpen}
        onOpenChange={setIsViewDetailsDialogCMOpen}
        maintenanceRequest={selectedItem}
        userMetadata={parsedMetadata}
      />
      <ViewMaintenanceDetailsDialogPM
        open={isViewDetailsDialogPMOpen}
        onOpenChange={setIsViewDetailsDialogPMOpen}
        maintenanceRequest={selectedItem}
        userMetadata={parsedMetadata}
      />
    </div>
  );
};
