import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BookOpenText, SquareChartGantt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationTable } from "@/components/site/component/PaginationTable";
import { useUserOrgId } from "../utils/useUserOrgId";
import { useFinanceQueries } from "@/hooks/finance/use-finance-queries";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTpManagerSiteId } from "@/hooks/use-site-id";
import { useBookingQueries } from "@/hooks/booking/use-booking-queries";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteProfile } from "@/types/site";
import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { exportToCSV } from "@/utils/export-utils";
import { exportToPdf } from "../utils/exportToPdf";
import { toast } from "@/hooks/use-toast";

export const FinanceYearlyContent = () => {
    const {
        tpAdminOrganizationId,
        tpSiteOrganizationId,
        tpFinanceOrganizationId,
        tpOperationsOrganizationId,
        duspOrganizationId,
        isSuperAdmin,
        isMember,
        isTpSite,
        isTpAdmin,
        isTpOperations,
        isTpFinance,
        isDusp
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
    const { data: tpsSites, isLoading: isTpsSitesLoading } = useTpsSites(selectedTpOrgId);
    const tpSiteIds = tpsSites?.map(tp => tp.id) ?? [];
    const [year, setYear] = useState("");
    const [search, setSearch] = useState("");
    const {
        useYearsFromTwentyTwenty,
        useAllSiteReport
    } = useFinanceQueries();
    const { data: yearsFromTwentyTwenty, isLoading: isLoadingYearsFromTwentyTwenty } = useYearsFromTwentyTwenty();
    const { data: allSiteReport, isLoading: isLoadingAllSiteReport } = useAllSiteReport(Number(tpManagerSiteId), tpSiteIds);
    const [filteredAllSiteReport, setFilteredAllSiteReport] = useState([]);

    useEffect(() => {
        if (!allSiteReport) return;

        let filtered = allSiteReport;

        if (search !== "") {
            filtered = filtered.filter((siteReport: SiteProfile) => siteReport.sitename.toLowerCase().includes(search.toLowerCase()));
        } 
        
        if (year !== "") {
            filtered = filtered.filter((siteReport: SiteProfile) => siteReport.nd_finance_report.find((report) => report.year === year));
        }

        setFilteredAllSiteReport(filtered);
    }, [year, search, allSiteReport]);

    const [selectedSiteReport, setSelectedSiteReport] = useState<SiteProfile[] | null>([]);

    if (
        isLoadingYearsFromTwentyTwenty ||
        isTpsSitesLoading ||
        tpManagerSiteIdLoading ||
        isLoadingAllSiteReport
    ) {
        return <LoadingSpinner />;
    }

    const bodyTableDataReportOption = filteredAllSiteReport?.map((siteReport: SiteProfile) => {
        const totalIncome = siteReport.nd_finance_report.reduce((a, b) => a + b.nd_finance_report_item.reduce((a, b) => a + (b.debit ?? 0), 0), 0);
        const totalExpense = siteReport.nd_finance_report.reduce((a, b) => a + b.nd_finance_report_item.reduce((a, b) => a + (b.credit ?? 0), 0), 0);
        const totalProfit = totalIncome - totalExpense;
        return {
            checkBox: <Checkbox checked={selectedSiteReport?.map((site) => site.id).includes(siteReport.id)} onCheckedChange={(checked) => setSelectedSiteReport(checked ? [...selectedSiteReport, siteReport] : selectedSiteReport.filter(report => report.id !== siteReport.id))}/>,
            sitename: siteReport.sitename,
            totalIncome,
            totalExpense,
            totalProfit: totalProfit.toFixed(2)
        };
    });

    const bodyTableDataMonthlyBreakdown = selectedSiteReport?.flatMap((siteReport: SiteProfile) => {
        const monthlyIncome = siteReport.nd_finance_report.reduce((a, b) => {
            const month = b.month as keyof typeof a;
            a[month] = (a[month] ?? 0) + b.nd_finance_report_item.reduce((a, b) => a + (b.debit ?? 0), 0);
            return a;
        }, {} as Record<string, number>);

        const monthlyExpense = siteReport.nd_finance_report.reduce((a, b) => {
            const month = b.month as keyof typeof a;
            a[month] = (a[month] ?? 0) + b.nd_finance_report_item.reduce((a, b) => a + (b.credit ?? 0), 0);
            return a;
        }, {} as Record<string, number>);

        const monthlyProfit = Object.keys(monthlyIncome).reduce((a, month) => {
            a[month] = monthlyIncome[month] - monthlyExpense[month];
            return a;
        }, {} as Record<string, number>);

        return [
            {
                sitename: `${siteReport.sitename} (Income)`,
                jan: (monthlyIncome["January"] ?? 0).toFixed(2),
                feb: (monthlyIncome["February"] ?? 0).toFixed(2),
                mar: (monthlyIncome["March"] ?? 0).toFixed(2),
                apr: (monthlyIncome["April"] ?? 0).toFixed(2),
                may: (monthlyIncome["May"] ?? 0).toFixed(2),
                jun: (monthlyIncome["June"] ?? 0).toFixed(2),
                jul: (monthlyIncome["July"] ?? 0).toFixed(2),
                aug: (monthlyIncome["August"] ?? 0).toFixed(2),
                sep: (monthlyIncome["September"] ?? 0).toFixed(2),
                oct: (monthlyIncome["October"] ?? 0).toFixed(2),
                nov: (monthlyIncome["November"] ?? 0).toFixed(2),
                dec: (monthlyIncome["December"] ?? 0).toFixed(2),
                total: Object.values(monthlyIncome).reduce((a, b) => a + (b ?? 0), 0).toFixed(2)
            },
            {
                sitename: `${siteReport.sitename} (Expense)`,
                jan: (monthlyExpense["January"] ?? 0).toFixed(2),
                feb: (monthlyExpense["February"] ?? 0).toFixed(2),
                mar: (monthlyExpense["March"] ?? 0).toFixed(2),
                apr: (monthlyExpense["April"] ?? 0).toFixed(2),
                may: (monthlyExpense["May"] ?? 0).toFixed(2),
                jun: (monthlyExpense["June"] ?? 0).toFixed(2),
                jul: (monthlyExpense["July"] ?? 0).toFixed(2),
                aug: (monthlyExpense["August"] ?? 0).toFixed(2),
                sep: (monthlyExpense["September"] ?? 0).toFixed(2),
                oct: (monthlyExpense["October"] ?? 0).toFixed(2),
                nov: (monthlyExpense["November"] ?? 0).toFixed(2),
                dec: (monthlyExpense["December"] ?? 0).toFixed(2),
                total: Object.values(monthlyExpense).reduce((a, b) => a + (b ?? 0), 0).toFixed(2)
            },
            {
                sitename: `${siteReport.sitename} (Profit)`,
                jan: (monthlyProfit["January"] ?? 0).toFixed(2),
                feb: (monthlyProfit["February"] ?? 0).toFixed(2),
                mar: (monthlyProfit["March"] ?? 0).toFixed(2),
                apr: (monthlyProfit["April"] ?? 0).toFixed(2),
                may: (monthlyProfit["May"] ?? 0).toFixed(2),
                jun: (monthlyProfit["June"] ?? 0).toFixed(2),
                jul: (monthlyProfit["July"] ?? 0).toFixed(2),
                aug: (monthlyProfit["August"] ?? 0).toFixed(2),
                sep: (monthlyProfit["September"] ?? 0).toFixed(2),
                oct: (monthlyProfit["October"] ?? 0).toFixed(2),
                nov: (monthlyProfit["November"] ?? 0).toFixed(2),
                dec: (monthlyProfit["December"] ?? 0).toFixed(2),
                total: Object.values(monthlyProfit).reduce((a, b) => a + (b ?? 0), 0).toFixed(2)
            }
        ];
    });

    const headTableReportOption = [
        { key: "checkBox", label: <Checkbox checked={selectedSiteReport && selectedSiteReport.length === ((allSiteReport && allSiteReport.length > 0) ? allSiteReport.length : 1)} onCheckedChange={(checked) => setSelectedSiteReport(checked ? ((allSiteReport && allSiteReport.length > 0) ? allSiteReport : [...allSiteReport]) : [])}/> },
        { key: "sitename", label: "Site Name" },
        { key: "totalIncome", label: "Total Income" },
        { key: "totalExpense", label: "Total Expense" },
        { key: "totalProfit", label: "Total Profit" }
    ];

    const headTableMontlyBreakdown = [
        { key: "sitename", label: "Site Name" },
        { key: "jan", label: "Jan" },
        { key: "feb", label: "Feb" },
        { key: "mar", label: "Mar" },
        { key: "apr", label: "Apr" },
        { key: "may", label: "May" },
        { key: "jun", label: "Jun" },
        { key: "jul", label: "Jul" },
        { key: "aug", label: "Aug" },
        { key: "sep", label: "Sep" },
        { key: "oct", label: "Oct" },
        { key: "nov", label: "Nov" },
        { key: "dec", label: "Dec" },
        { key: "total", label: "Total" }
    ];

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleExportToCsv = async () => {
        try {
            exportToCSV(bodyTableDataMonthlyBreakdown, `Finance Report Yearly ${year}`);
            toast({
                title: "Success",
                description: "Successfully exported to CSV",
                variant: "default"
            })
        } catch (error) {
            console.error("Error exporting to CSV:", error);
            toast({
                title: "Error",
                description: "Failed to export to CSV. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleExportToPdf = async () => {
        try {
            exportToPdf({data: bodyTableDataMonthlyBreakdown, title: `Finance Report Yearly ${year}`});
            toast({
                title: "Success",
                description: "Successfully exported to PDF",
                variant: "default"
            })
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            toast({
                title: "Error",
                description: "Failed to export to PDF. Please try again.",
                variant: "destructive"
            })
        }
    }

    return (
        <section className="bg-white rounded-md p-5">
            <div className="flex items-center justify-between border-b border-gray-300 pb-4" id="header">
                <h1 className="text-3xl font-black">Report Option</h1>
                <div className="flex items-center gap-2">
                    { !!selectedTpOrgId && (
                        <Input onChange={handleSearch} className="w-[180px]" placeholder="Search site name" />
                    )}
                    <Select value={year} onValueChange={setYear} defaultValue={year}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Year</SelectLabel>
                                {
                                    yearsFromTwentyTwenty.map((year) => (
                                        <SelectItem key={year.toString()} value={year.toString()}>{year}</SelectItem>
                                    ))
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={handleExportToPdf} 
                        disabled={selectedSiteReport.length < 1} 
                        className="bg-yellow-100 text-yellow-500 border border-yellow-500 hover:bg-yellow-200"
                    >
                        <SquareChartGantt />
                        Export PDF
                    </Button>
                    <Button 
                        onClick={handleExportToCsv} 
                        disabled={selectedSiteReport.length < 1} 
                        className="bg-blue-100 text-blue-500 border border-blue-500 hover:bg-blue-200"
                    >
                        <BookOpenText />
                        Export CSV
                    </Button>
                </div>
            </div>
            <PaginationTable
                headTable={headTableReportOption}
                bodyTableData={bodyTableDataReportOption}
            />
            <h1 className="w-full border-b border-gray-300 pb-4 text-3xl font-bold mt-4">Monthly Breakdown</h1>
            <PaginationTable
                headTable={headTableMontlyBreakdown}
                bodyTableData={bodyTableDataMonthlyBreakdown}
            />
        </section>
    )
}