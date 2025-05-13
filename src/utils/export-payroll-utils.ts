import { saveAs } from "file-saver";

// Function to export data to CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.error("No data to export");
    return;
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);

  // Create CSV rows
  const rows = data.map((item) =>
    headers
      .map((header) => {
        // Handle case where the value might contain commas or quotes
        let value =
          item[header] === null || item[header] === undefined
            ? ""
            : item[header];
        value = String(value).replace(/"/g, '""'); // Escape double quotes

        // If value contains commas, newlines, or double quotes, enclose in double quotes
        if (
          value.includes(",") ||
          value.includes("\n") ||
          value.includes('"')
        ) {
          value = `"${value}"`;
        }
        return value;
      })
      .join(",")
  );

  // Add headers as first row
  const csvContent = [headers.join(","), ...rows].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `${filename}.csv`);
};

// Prepare payroll data for export by formatting and standardizing
export const preparePayrollDataForExport = (payrollData: any[]) => {
  return payrollData.map((record) => ({
    "Staff Name": record.name || "",
    Position: record.position || record.role || "",
    "Monthly Payment": record.payment || record.salary || 0,
    Status: record.status || "",
    Center: record.center || "",
    Incentive: record.incentive || 0,
    "Last Paid Date": record.lastPaid || "",
  }));
};

// Export selected payroll data to CSV
export const exportSelectedPayrollToCSV = (
  selectedRecords: any[],
  filename = "payroll-data"
) => {
  if (!selectedRecords || !selectedRecords.length) {
    console.error("No records selected for export");
    return false;
  }

  const formattedData = preparePayrollDataForExport(selectedRecords);
  exportToCSV(formattedData, filename);
  return true;
};

// Function to filter payroll data based on filter criteria
export const filterPayrollData = (
  data: any[],
  searchQuery = "",
  positionFilter = "all",
  statusFilter = "all",
  paymentRangeMin?: number,
  paymentRangeMax?: number
) => {
  return data.filter((record) => {
    // Search query filter
    const matchesSearch =
      searchQuery === "" ||
      (record.name &&
        record.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.position &&
        record.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.role &&
        record.role.toLowerCase().includes(searchQuery.toLowerCase()));

    // Position filter
    const matchesPosition =
      positionFilter === "all" ||
      record.position === positionFilter ||
      record.role === positionFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    // Payment range filter
    const payment = record.payment || record.salary || 0;
    const matchesMinPayment =
      paymentRangeMin === undefined || payment >= paymentRangeMin;
    const matchesMaxPayment =
      paymentRangeMax === undefined || payment <= paymentRangeMax;

    return (
      matchesSearch &&
      matchesPosition &&
      matchesStatus &&
      matchesMinPayment &&
      matchesMaxPayment
    );
  });
};

// Function to filter staff payroll data by date
export const filterStaffPayrollByDate = (
  data: any[],
  searchQuery = "",
  month?: number,
  year?: number
) => {
  return data.filter((record) => {
    // Search query filter
    const matchesSearch =
      searchQuery === "" ||
      (record.name &&
        record.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.details &&
        record.details.toLowerCase().includes(searchQuery.toLowerCase()));

    // Date filter logic
    let matchesDate = true;
    if (record.date) {
      const recordDate = new Date(record.date);

      if (month !== undefined) {
        matchesDate = matchesDate && recordDate.getMonth() === month;
      }

      if (year !== undefined) {
        matchesDate = matchesDate && recordDate.getFullYear() === year;
      }
    }

    return matchesSearch && matchesDate;
  });
};
