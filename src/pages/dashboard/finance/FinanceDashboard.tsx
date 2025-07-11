import {
  BookOpenText,
  CircleDot,
  Download,
  Eye,
  File,
  Plus,
  SquareChartGantt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterFinance } from "./reusables/FilterFinance";
import { useEffect, useState } from "react";
import { PaginationTableServer } from "@/components/site/component/PaginationTableServer";
import { useFinanceQueries } from "@/hooks/finance/use-finance-queries";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useDebounce } from "@/hooks/use-debounce";
import { FinaceStats } from "./reusables/FinanceStats";
import { Link } from "react-router-dom";
import { useUserOrgId } from "./utils/useUserOrgId";
import { useTpManagerSiteId } from "@/hooks/use-site-id";
import { useBookingQueries } from "@/hooks/booking/use-booking-queries";
import { getMonthNameByNumber } from "./utils/getMonthNameByNumber";
import { FinanceReport, FinanceReportItem } from "@/types/finance";
import { exportToPdf } from "./utils/exportToPdf";
import { toast } from "@/hooks/use-toast";
import { exportToCSV } from "@/utils/export-utils";
import { DollarSign } from "lucide-react";
import { financeClient } from "@/hooks/finance/finance-client";

interface FinanceDashboardProps {
  isDashBoardPage?: boolean
  isExportEnabled?: boolean
  title?: string
  description?: string
  isRevExp?: boolean
}
const FinanceDashboard = ({
  isDashBoardPage = true,
  title = "Finance Dashboard",
  description = "View and export financial statements by month.",
  isExportEnabled = false,
  isRevExp = false
}: FinanceDashboardProps) => {
  const {
    tpFinanceOrganizationId,
    tpAdminOrganizationId,
    tpOperationsOrganizationId,
    tpSiteOrganizationId,
    isSuperAdmin,
    isMember,
    isTpSite,
    isTpAdmin,
    isTpOperations,
    isTpFinance,
    isDusp,
    duspOrganizationId
  } = useUserOrgId();
  // Tp manager site
  const { siteId: tpManagerSiteId, isLoading: tpManagerSiteIdLoading } = useTpManagerSiteId(isTpSite, tpSiteOrganizationId);
  // Tp admin sites
  const selectedTpOrgId = isTpAdmin
    ? tpAdminOrganizationId
    : isTpOperations
      ? tpOperationsOrganizationId
      : isTpFinance
        ? tpFinanceOrganizationId
        : isDusp
          ? duspOrganizationId
          : null;

  const { useTpsSites } = useBookingQueries();
  const { data: tpsSites, isLoading: isTpsSitesLoading } = useTpsSites(selectedTpOrgId, isDusp);
  const tpSiteIds = tpsSites?.map(tp => tp.id) ?? [];
  
  const {
    useFinanceReportWithFilterAndPagination,
    useAllFinanceReports
  } = useFinanceQueries();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search, 300);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [bodyTableData, setBodyTableData] = useState([]);
  const getCurrentYear = new Date().getFullYear();
  const getCurrentMonth = new Date().getMonth() + 1;
  const [selectedFilter, setSelectedFilter] = useState({
    status: "",
    month: getMonthNameByNumber(getCurrentMonth),
    year: String(getCurrentYear),
    phase: "",
    region: "",
  });
  const maxItemPerPage = 10;
  const {
    data: allFinanceReports,
    isLoading: allFinanceReportsLoading
  } = useAllFinanceReports(tpSiteIds, Number(tpManagerSiteId));
  const {
    data: financeReportWithFilterAndPagination,
    isLoading: financeReportWithFilterAndPaginationLoading,
    refetch: refetchFinanceReportWithFilterAndPagination
  } = useFinanceReportWithFilterAndPagination(
    selectedFilter.year,
    selectedFilter.month,
    searchDebounce,
    selectedFilter.status,
    selectedFilter.phase,
    selectedFilter.region,
    page,
    maxItemPerPage,
    tpSiteIds,
    Number(tpManagerSiteId)
  );

  useEffect(() => {
    const formattedToTableBodyData = financeReportWithFilterAndPagination?.map((report: FinanceReport, i) => {
      return {
        no: i + 1,
        siteName: report.nd_site_profile.sitename,
        month: report.month,
        year: report.year,
        phase: report.nd_site_profile.nd_phases.name,
        region: report.nd_site_profile.nd_region.eng,
        status: report.nd_finance_report_status.status,
        income: report.nd_finance_report_item.reduce((prev, curr) => prev + curr.debit, 0).toFixed(2),
        expense: report.nd_finance_report_item.reduce((prev, curr) => prev + curr.credit, 0).toFixed(2),
        profit: report.nd_finance_report_item.reduce((prev, curr) => prev + curr.debit - curr.credit, 0).toFixed(2),
        action: (<Link to={`/finance/reports/${report.id}`}>
          <Button className="flex items-center gap-1">
            <Eye />
          </Button>
        </Link>),
      };
    });
    setBodyTableData(formattedToTableBodyData || []);
  }, [financeReportWithFilterAndPagination]);

  const headTable = [
    { key: "no", label: "No" },
    { key: "siteName", label: "Site Name" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
    { key: "phase", label: "Phase" },
    { key: "region", label: "Region" },
    { key: "status", label: "Status" },
    { key: "income", label: "Income" },
    { key: "expense", label: "Expense" },
    { key: "profit", label: "Profit" },
    { key: "action", label: "Action" }
  ];

  const financeReportStatus = {
    editing: allFinanceReports?.filter((report: any) => report.nd_finance_report_status.status === "editing").length,
    submitted: allFinanceReports?.filter((report: any) => report.nd_finance_report_status.status === "submitted").length,
    verified: allFinanceReports?.filter((report: any) => report.nd_finance_report_status.status === "verified").length,
    closed: allFinanceReports?.filter((report: any) => report.nd_finance_report_status.status === "closed").length,
  }

  const statsData = [
    {
      title: "Editing",
      value: String(financeReportStatus.editing),
      icon: CircleDot,
      description: "",
      iconBgColor: "bg-blue-200",
      iconTextColor: "text-blue-500",
    },
    {
      title: "Submitted",
      value: String(financeReportStatus.submitted),
      icon: CircleDot,
      description: "",
      iconBgColor: "bg-yellow-100",
      iconTextColor: "text-yellow-500",
    },
    {
      title: "Verified",
      value: String(financeReportStatus.verified),
      icon: CircleDot,
      description: "",
      iconBgColor: "bg-green-100",
      iconTextColor: "text-green-500",
    },
    {
      title: "Closed",
      value: String(financeReportStatus.closed),
      icon: CircleDot,
      description: "",
      iconBgColor: "bg-gray-100",
      iconTextColor: "text-gray-500",
    },
  ];

  const monthlyFinancialSummary = [
    {
      title: "Total BF",
      value: String("RM" + financeReportWithFilterAndPagination?.reduce((prev, curr) => prev + curr?.balance_forward, 0).toFixed(2)),
      icon: DollarSign,
      description: "",
      iconBgColor: "bg-blue-200",
      iconTextColor: "text-blue-500",
    },
    {
      title: "Total Debit",
      value: String("RM" + financeReportWithFilterAndPagination?.reduce((prev, curr) => prev + curr?.nd_finance_report_item?.reduce((prev, curr) => prev + curr.debit, 0), 0).toFixed(2)),
      icon: DollarSign,
      description: "",
      iconBgColor: "bg-yellow-100",
      iconTextColor: "text-yellow-500",
    },
    {
      title: "Total Credit",
      value: String("RM" + financeReportWithFilterAndPagination?.reduce((prev, curr) => prev + curr?.nd_finance_report_item?.reduce((prev, curr) => prev + curr.credit, 0), 0).toFixed(2)),
      icon: DollarSign,
      description: "",
      iconBgColor: "bg-green-100",
      iconTextColor: "text-green-500",
    },
    {
      title: "Total Bank In",
      value: String("RM" + financeReportWithFilterAndPagination?.filter((report: FinanceReport) => report?.nd_finance_report_item?.some((item: FinanceReportItem) => item?.nd_finance_expense_type?.name === "Bank In"))?.reduce((prev, curr) => prev + curr.nd_finance_item?.reduce((prev, curr) => prev + curr.debit, 0), 0).toFixed(2)),
      icon: DollarSign,
      description: "",
      iconBgColor: "bg-purple-100",
      iconTextColor: "text-purple-500",
    },
    {
      title: "Total Balance",
      value: String("RM" + financeReportWithFilterAndPagination?.reduce((prev, curr) => prev + curr?.nd_finance_report_item?.reduce((prev, curr) => prev + curr.balance, 0), 0).toFixed(2)),
      icon: DollarSign,
      description: "",
      iconBgColor: "bg-gray-100",
      iconTextColor: "text-gray-500",
    },
  ];

  const revenueExpensesSummary = [
    {
      title: "Total Revenue",
      value: String("RM" + financeReportWithFilterAndPagination?.reduce((prev, curr) => prev + curr?.nd_finance_report_item?.reduce((prev, curr) => prev + curr.debit, 0), 0).toFixed(2)),
      icon: DollarSign,
      description: "",
      iconBgColor: "bg-blue-200",
      iconTextColor: "text-blue-500",
    },
    {
      title: "Total Expenses",
      value: String("RM" + financeReportWithFilterAndPagination?.reduce((prev, curr) => prev + curr?.nd_finance_report_item?.reduce((prev, curr) => prev + curr.credit, 0), 0).toFixed(2)),
      icon: DollarSign,
      description: "",
      iconBgColor: "bg-yellow-100",
      iconTextColor: "text-yellow-500",
    },
    {
      title: "Net Profit",
      value: String("RM" + financeReportWithFilterAndPagination?.reduce((prev, curr) => prev + curr?.nd_finance_report_item?.reduce((prev, curr) => prev + curr.balance, 0), 0).toFixed(2)),
      icon: DollarSign,
      description: "",
      iconBgColor: "bg-gray-100",
      iconTextColor: "text-gray-500",
    },
  ]

  if (
    allFinanceReportsLoading ||
    tpManagerSiteIdLoading ||
    isTpsSitesLoading
  ) {
    return <LoadingSpinner />
  }

  return (
    <section className="space-y-6">
      {isDashBoardPage ?
        <HeaderDashBoard
          title={title}
          description={description}
          bodyTableData={bodyTableData}
          isTpSite={isTpSite}
          siteId={Number(tpManagerSiteId)}
          refetch={refetchFinanceReportWithFilterAndPagination}
        /> :
        <HeaderDashBoard
          isDashBoardPage={false}
          isExportEnabled={isExportEnabled}
          bodyTableData={bodyTableData}
          title={title}
          description={description}
        />
      }
      <FilterFinance
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        setSearch={setSearch}
      />
      {isDashBoardPage ? (
        <FinaceStats
          statsData={statsData}
        />
      ) : isExportEnabled ? (
        <FinaceStats
          statsData={monthlyFinancialSummary}
          className="grid-cols-5"
        />
      ) : isRevExp ? (
        <FinaceStats
          statsData={revenueExpensesSummary}
          className="grid-cols-3"
        />
      ) : null
      }
      <PaginationTableServer
        page={page}
        setPage={setPage}
        totalPages={Math.ceil(allFinanceReports.length / maxItemPerPage)}
        contentResult={bodyTableData}
        handleSelectedSite={setSelectedSiteId}
        headTable={headTable}
        isLoading={financeReportWithFilterAndPaginationLoading}
      />
    </section>
  )
};

interface HeaderDashBoardProps {
  isDashBoardPage?: boolean;
  title: string;
  description: string;
  isTpSite?: boolean;
  isExportEnabled?: boolean;
  bodyTableData?: any[];
  siteId?: number;
  refetch?: () => void
}

export const HeaderDashBoard = ({
  isDashBoardPage = true,
  title,
  description,
  isTpSite,
  isExportEnabled = false,
  bodyTableData = [],
  siteId,
  refetch
}: HeaderDashBoardProps) => {
  const handleExportToPdf = () => {
    const formattedTable = bodyTableData.map(item => {
      const { receipt, action, ...rest } = item;
      return rest;
    });
    try {
      exportToPdf({ data: formattedTable, title: `Finance Report ${description.replace(/\s+/g, "_")}` });
      toast({
        title: "Success",
        description: "Successfully exported to PDF",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export to PDF. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleExportToCsv = () => {
    const formattedTable = bodyTableData.map(item => {
      const { receipt, action, ...rest } = item;
      return rest;
    });
    try {
      exportToCSV(formattedTable, `Finance Report ${description.replace(/\s+/g, "_")}`);
      toast({
        title: "Success",
        description: "Successfully exported to CSV",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export to CSV. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleAddTransaction = async () => {
    try {
      const today = new Date();
      const year = String(today.getFullYear());
      const month = getMonthNameByNumber(today.getMonth() + 1);
      const dataToPost: FinanceReport = {
        status_id: 1,
        site_id: siteId,
        year,
        month,
        balance_forward: 0,
        created_at: new Date(Date.now() + (7 * 60 * 60 * 1000)).toISOString()
      };

      await financeClient.addNewTransactionReport(dataToPost);
      refetch();
      toast({
        title: "Success",
        description: "Successfully added transaction",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <section className="flex justify-between items-center">
      <div className="">
        <h1 className="text-4xl font-extrabold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      {isDashBoardPage && (
        <div className="flex items-center gap-2">
          <Link to="/finance/yearly-report">
            <Button className="bg-white text-black border border-gray-200 hover:bg-gray-200">
              <SquareChartGantt />
              By Year Report
            </Button>
          </Link>
          <Link to="/finance/monthly-statements">
            <Button className="bg-white text-black border border-gray-200 hover:bg-gray-200">
              <BookOpenText />
              Montly Statements
            </Button>
          </Link>
          {(isTpSite && bodyTableData && bodyTableData.length < 1) && (
            <Button onClick={handleAddTransaction} className="bg-green-500 text-white  hover:bg-green-600">
              <Plus />
              Add Transaction
            </Button>
          )}
        </div>
      )}
      {isExportEnabled && (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportToPdf}
            className="bg-blue-100 text-blue-500 border border-blue-500 hover:bg-blue-200"
          >
            <File />
            Export PDF
          </Button>
          <Button
            onClick={handleExportToCsv}
            className="bg-green-100 text-green-500 border border-green-500 hover:bg-green-200"
          >
            <Download />
            Export CSV
          </Button>
        </div>
      )}
    </section>
  );
};

export default FinanceDashboard;
