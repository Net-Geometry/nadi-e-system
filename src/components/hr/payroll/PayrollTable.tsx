import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { useUsers } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  Eye,
  Check,
  Flag,
  Minus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface PayrollTableProps {
  data: any[];
  columns: {
    key: string;
    title: string;
    render?: (value: any, record: any) => React.ReactNode;
  }[];
  onExportSelected?: (selectedRecords: any[]) => void;
  pageSize?: number;
  staffView?: boolean;
}

export function PayrollTable({
  data,
  columns,
  onExportSelected,
  pageSize = 10,
  staffView = false,
}: PayrollTableProps) {
  const { toast } = useToast();
  const { useUsersQuery } = useUsers();
  const userData = useUsersQuery();
  const user_type = userData?.data?.[0]?.user_type || "Guest";
  const isEditable =
    user_type === "Super Admin" || user_type === "staff_manager";

  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState<any[]>([]);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / pageSize);

  // Update paginated data when page or data changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedData(data.slice(startIndex, endIndex));
  }, [data, currentPage, pageSize]);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Reset selected rows when paginated data changes
  useEffect(() => {
    setSelectedRows([]);
  }, [data]);

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
    toast({
      title: `Viewing details for ${record.name || "record"}`,
    });
  };

  const handleApproveRecord = (record: any) => {
    if (record.status === "Pending") {
      toast({
        title: `Approved payment for ${record.name || "record"}`,
        variant: "default",
      });
    } else {
      toast({
        title: `Payment already approved for ${record.name || "record"}`,
        variant: "default",
      });
    }
  };

  const handleFlagRecord = (record: any) => {
    toast({
      title: `Flagged ${record.name || "record"} for review`,
      variant: "destructive",
    });
  };

  const handlePrintRecord = () => {
    if (!selectedRecord) return;
    toast({
      title: `Printing payslip for ${selectedRecord.name}`,
      variant: "default",
    });
  };

  const handleDownloadRecord = () => {
    if (!selectedRecord) return;
    toast({
      title: `Downloading payslip for ${selectedRecord.name}`,
      variant: "default",
    });
  };

  const handleSelectRow = (record: any, isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows([...selectedRows, record]);
    } else {
      setSelectedRows(selectedRows.filter((r) => r.id !== record.id));
    }
  };

  const handleSelectAllRows = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows([...paginatedData]);
    } else {
      setSelectedRows([]);
    }
  };

  const isRowSelected = (record: any) => {
    return selectedRows.some((r) => r.id === record.id);
  };

  const handleExportSelected = () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No records selected",
        description: "Please select at least one record to export.",
        variant: "destructive",
      });
      return;
    }

    if (onExportSelected) {
      onExportSelected(selectedRows);
      toast({
        title: `Exported ${selectedRows.length} records`,
        description: "The file has been downloaded to your device.",
        variant: "default",
      });
    }
  };

  // Helper function to safely format currency values
  const formatCurrency = (value?: number) => {
    return typeof value === "number" ? value.toLocaleString() : "0";
  };

  // Helper function to safely format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-MY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Paid: "bg-green-100 text-green-800 border-green-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-4">
      {!staffView && selectedRows.length > 0 && (
        <div className="flex items-center justify-between bg-muted/20 p-2 rounded-md">
          <span className="text-sm">
            {selectedRows.length}{" "}
            {selectedRows.length === 1 ? "record" : "records"} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportSelected}
            className="gap-2"
          >
            <FileSpreadsheet size={16} />
            Export Selected
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader className="bg-nadi-gray">
            <TableRow>
              {!staffView && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.length === selectedRows.length
                    }
                    onCheckedChange={handleSelectAllRows}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key} className="font-medium">
                  {column.title}
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (staffView ? 1 : 2)}
                  className="h-32 text-center text-muted-foreground"
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((record, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  {!staffView && (
                    <TableCell className="w-12">
                      <Checkbox
                        checked={isRowSelected(record)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(record, !!checked)
                        }
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column.key}`}>
                      {column.render
                        ? column.render(record[column.key], record)
                        : record[column.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewRecord(record)}
                            >
                              <Eye size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {!staffView && isEditable && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={
                                    record.status === "Pending"
                                      ? "text-nadi-purple"
                                      : "text-muted-foreground"
                                  }
                                  onClick={() => handleApproveRecord(record)}
                                  disabled={record.status === "Paid"}
                                >
                                  {record.status === "Paid" ? (
                                    <Minus size={16} />
                                  ) : (
                                    <Check size={16} />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {record.status === "Paid"
                                  ? "Paid"
                                  : "Approve payment"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-nadi-alert"
                                  onClick={() => handleFlagRecord(record)}
                                >
                                  <Flag size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Flag for review</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                      {staffView && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadRecord()}
                              >
                                <Download size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download payslip</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.length > pageSize && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={data.length}
          pageSize={pageSize}
          startItem={(currentPage - 1) * pageSize + 1}
          endItem={Math.min(currentPage * pageSize, data.length)}
        />
      )}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payroll Record Details</DialogTitle>
            <DialogDescription>
              {selectedRecord
                ? `Details for ${selectedRecord.name}`
                : "Loading details..."}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="text-sm text-muted-foreground">Staff Name:</div>
                <div className="text-sm font-medium">
                  {selectedRecord.name || "N/A"}
                </div>

                <div className="text-sm text-muted-foreground">Role:</div>
                <div className="text-sm font-medium">
                  {selectedRecord.role || selectedRecord.position || "N/A"}
                </div>

                <div className="text-sm text-muted-foreground">Center:</div>
                <div className="text-sm font-medium">
                  {selectedRecord.center || "N/A"}
                </div>

                <div className="text-sm text-muted-foreground">
                  Monthly Salary:
                </div>
                <div className="text-sm font-medium">
                  RM{" "}
                  {formatCurrency(
                    selectedRecord.salary || selectedRecord.payment
                  )}
                </div>

                <div className="text-sm text-muted-foreground">Incentive:</div>
                <div className="text-sm font-medium">
                  RM {formatCurrency(selectedRecord.incentive)}
                </div>

                <div className="text-sm text-muted-foreground">
                  Total Monthly:
                </div>
                <div className="text-sm font-medium">
                  RM{" "}
                  {formatCurrency(
                    (typeof selectedRecord.salary === "number"
                      ? selectedRecord.salary
                      : typeof selectedRecord.payment === "number"
                      ? selectedRecord.payment
                      : 0) +
                      (typeof selectedRecord.incentive === "number"
                        ? selectedRecord.incentive
                        : 0)
                  )}
                </div>

                <div className="text-sm text-muted-foreground">Status:</div>
                <div>
                  <Badge
                    variant="outline"
                    className={statusColors[selectedRecord.status]}
                  >
                    {selectedRecord.status || "N/A"}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  Last Paid Date:
                </div>
                <div className="text-sm font-medium">
                  {formatDate(selectedRecord.lastPaid)}
                </div>
              </div>

              {/* <div className="rounded-md bg-muted/50 p-3">
                <h4 className="mb-2 text-sm font-medium">Payment History</h4>
                <div className="text-xs text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>April 2025</span>
                    <span>
                      RM{" "}
                      {formatCurrency(
                        (typeof selectedRecord.salary === "number"
                          ? selectedRecord.salary
                          : typeof selectedRecord.payment === "number"
                          ? selectedRecord.payment
                          : 0) +
                          (typeof selectedRecord.incentive === "number"
                            ? selectedRecord.incentive
                            : 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>March 2025</span>
                    <span>
                      RM{" "}
                      {formatCurrency(
                        (typeof selectedRecord.salary === "number"
                          ? selectedRecord.salary
                          : typeof selectedRecord.payment === "number"
                          ? selectedRecord.payment
                          : 0) +
                          (typeof selectedRecord.incentive === "number"
                            ? selectedRecord.incentive
                            : 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>February 2025</span>
                    <span>
                      RM{" "}
                      {formatCurrency(
                        (typeof selectedRecord.salary === "number"
                          ? selectedRecord.salary
                          : typeof selectedRecord.payment === "number"
                          ? selectedRecord.payment
                          : 0) +
                          (typeof selectedRecord.incentive === "number"
                            ? selectedRecord.incentive
                            : 0)
                      )}
                    </span>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadRecord}
                className="gap-2"
              >
                <Download size={16} />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintRecord}
                className="gap-2"
              >
                <Printer size={16} />
                Print
              </Button>
            </div>
            <Button
              size="sm"
              className="bg-nadi-purple hover:bg-nadi-purple/90"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
