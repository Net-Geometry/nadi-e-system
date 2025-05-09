import { Button } from "@/components/ui/button";
import { useMaintenance } from "@/hooks/use-maintenance";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { MaintenanceRequest, MaintenanceStatus } from "@/types/maintenance";
import { Download, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { PaginationComponent } from "../ui/PaginationComponent";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ViewMaintenanceDetailsDialog } from "./ViewMaintenanceDetailsDialog";

interface MaintenanceListProps {
  maintenanceRequests: MaintenanceRequest[];
  isLoadingMaintenanceRequests: boolean;
  refetch: () => void;
}
export const MaintenanceList = ({
  maintenanceRequests,
  isLoadingMaintenanceRequests,
  refetch,
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

  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaintenanceRequest | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isViewDetailsDialogOpen) refetch();
  }, [isViewDetailsDialogOpen, refetch]);

  const { useMaintenanceTypesQuery, useSLACategoriesQuery } = useMaintenance();

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
    );

  const paginatedInventories = filteredMaintenanceRequests.slice(
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

  // const exportAssetsAsCSV = (maintenanceRequests: MaintenanceRequest[]) => {
  //   if (!maintenanceRequests || maintenanceRequests.length === 0) {
  //     console.warn("No maintenanceRequests to export.");
  //     return;
  //   }

  //   const headers = [
  //     "No.",
  //     "Name",
  //     "Type",
  //     "Price",
  //     "Quantity",
  //     "Description",
  //     "NADI Centre",
  //   ];

  //   if (isSuperAdmin) {
  //     const insertIndex = headers.indexOf("NADI Centre");
  //     headers.splice(insertIndex, 0, "TP (DUSP)");
  //   }

  //   // Convert maintenanceRequests to rows
  //   const rows = maintenanceRequests.map((maintenanceRequest, index) => {
  //     const row = [
  //       index + 1,
  //       maintenanceRequest.name,
  //       maintenanceRequest.type?.name ?? "",
  //       maintenanceRequest.price ?? "",
  //       maintenanceRequest.quantity ?? "",
  //       maintenanceRequest.description ?? "",
  //       // we'll insert "TP (DUSP)" before sitename if isSuperAdmin is true
  //       maintenanceRequest.site?.sitename ?? "",
  //     ];

  //     if (isSuperAdmin) {
  //       const insertIndex = row.length - 1; // before "NADI Centre"
  //       row.splice(
  //         insertIndex,
  //         0,
  //         maintenanceRequest.site?.dusp_tp_id_display ?? ""
  //       );
  //     }

  //     return row;
  //   });
  //   const csvContent = [headers, ...rows]
  //     .map((e) => e.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
  //     .join("\n");

  //   return csvContent;
  // };

  const handleExportMaintenances = () => {
    // const csvContent = exportAssetsAsCSV(filteredMaintenanceRequests);
    // const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement("a");
    // link.setAttribute("href", url);
    // link.setAttribute("download", "maintenanceRequests.csv");
    // link.style.display = "none";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
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
                {status.charAt(0).toUpperCase() + status.slice(1)}{" "}
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
                <TableHead>SLA</TableHead>
                <TableHead>Estimate Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action By/Date</TableHead>
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
                <TableHead>SLA</TableHead>
                <TableHead>Estimate Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action By/Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInventories &&
                paginatedInventories.map((maintenanceRequest, index) => {
                  const requestDate = maintenanceRequest.updated_at
                    ? (() => {
                        const parts =
                          maintenanceRequest.updated_at.split(/[- :T]/);
                        const year = Number(parts[0]);
                        const month = Number(parts[1]) - 1;
                        const day = Number(parts[2]);
                        const hour = Number(parts[3]);
                        const minute = Number(parts[4]);
                        const utcDate = new Date(
                          Date.UTC(year, month, day, hour, minute)
                        );

                        const localDate = new Date(utcDate);

                        const localDay = String(localDate.getDate()).padStart(
                          2,
                          "0"
                        );
                        const localMonth = String(
                          localDate.getMonth() + 1
                        ).padStart(2, "0");
                        const localYear = localDate.getFullYear();
                        let localHours = localDate.getHours();
                        const localMinutes = String(
                          localDate.getMinutes()
                        ).padStart(2, "0");
                        const ampm = localHours >= 12 ? "PM" : "AM";
                        localHours = localHours % 12 || 12; // 0 => 12

                        return `${localDay}/${localMonth}/${localYear} ${localHours}:${localMinutes} ${ampm}`;
                      })()
                    : "";

                  const estimatedDate =
                    maintenanceRequest.created_at && maintenanceRequest.sla
                      ? (() => {
                          const plusedDate = new Date(
                            new Date(maintenanceRequest.created_at).getTime() +
                              maintenanceRequest.sla.max_day *
                                24 *
                                60 *
                                60 *
                                1000
                          );

                          const localDay = String(
                            plusedDate.getDate()
                          ).padStart(2, "0");
                          const localMonth = String(
                            plusedDate.getMonth() + 1
                          ).padStart(2, "0");
                          const localYear = plusedDate.getFullYear();

                          return `${localDay}/${localMonth}/${localYear}`;
                        })()
                      : "Not set";

                  return (
                    <TableRow key={maintenanceRequest.id}>
                      <TableCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{maintenanceRequest?.no_docket}</TableCell>
                      <TableCell>
                        {maintenanceRequest?.type?.name || ""}
                      </TableCell>
                      <TableCell>
                        {maintenanceRequest?.sla?.name || "Not set"}
                      </TableCell>
                      <TableCell>{estimatedDate || ""}</TableCell>
                      <TableCell>
                        {maintenanceRequest?.status || "Pending"}
                      </TableCell>
                      <TableCell>{requestDate || ""}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setSelectedItem(maintenanceRequest);
                              setIsViewDetailsDialogOpen(true);
                            }}
                            className="flex items-center"
                          >
                            View Details
                          </Button>
                          <Button
                            onClick={() => {}}
                            className="flex items-center"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            View Report
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        open={isViewDetailsDialogOpen}
        onOpenChange={setIsViewDetailsDialogOpen}
        maintenanceRequest={selectedItem}
        userMetadata={parsedMetadata}
      />
    </div>
  );
};
