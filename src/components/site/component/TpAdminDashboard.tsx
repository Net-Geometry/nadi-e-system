import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import StatsCard from "../../dashboard/StatCard";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Site } from "@/types/site"
import { useEffect, useMemo, useRef, useState } from "react"
import { Download, RefreshCcw } from "lucide-react";
import { exportToCSV } from "@/utils/export-utils";
import { Asset } from "@/types/asset";
import { PaginationTable } from "./PaginationTable";
import type { SiteProfile } from "@/types/site";
import { useBookingQueries } from "@/hooks/booking/use-booking-queries";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useSitePaginationServer } from "@/hooks/useSitePaginationServer";
import { PaginationTableServer } from "./PaginationTableServer";

interface TpAdminDashboardProps {
    pcsInTpsAdminSite: Asset[]
    setSelecTedSite: React.Dispatch<React.SetStateAction<SiteProfile>>
    tpsSites: SiteProfile[]
    tpAdminOrgId: string
}

export const TpAdminDashBoard = ({
    pcsInTpsAdminSite,
    setSelecTedSite,
    tpsSites,
    tpAdminOrgId
}: TpAdminDashboardProps) => {
    const INITIAL_PAGE = 1;
    const PER_PAGE = 8;

    const {
        useAllRegion,
        useAllState
    } = useBookingQueries();
    const [selectedRegion, setSelectedRegion] = useState(0);
    const [selectedState, setSelectedState] = useState(0);
    const {
        data: allRegion,
        isLoading: isAllRegionLoading
    } = useAllRegion(selectedState);
    const {
        data: allState,
        isLoading: isAllStateLoading
    } = useAllState(selectedRegion);
    const {
        page,
        setPage,
        isSiteResultLoading,
        sitesResult,
        filter,
        setFilter
    } = useSitePaginationServer(INITIAL_PAGE, PER_PAGE, tpAdminOrgId);
    const [bodyTableData, setBodyTableData] = useState([]);

    const isLoadingPCs = !pcsInTpsAdminSite || pcsInTpsAdminSite.length === 0;
    const initialTotalSites = useRef(tpsSites?.length);
    const { totalPc, pcInUse } = useMemo(() => {
        const totalPc = pcsInTpsAdminSite.length;
        const pcInUse = pcsInTpsAdminSite.filter(pc => pc?.nd_booking?.some(b => b?.is_using)).length;

        return {
            totalPc,
            pcInUse
        };
    }, [pcsInTpsAdminSite]);

    useEffect(() => {
        let isCanceled = false;

        function formatTableBody() {
            if (sitesResult?.length > 0) {
                const handledBodyTable = handleBodyTableData(sitesResult);

                if (!isCanceled) {
                    setBodyTableData(handledBodyTable);
                }

            }
        }

        formatTableBody();

        return () => {
            isCanceled = true;
        };

    }, [sitesResult]);

    const handleSelectedSite = (siteId: number) => {
        setSelecTedSite(sitesResult?.find(site => site.id === Number(siteId))!);
    }

    const handleBodyTableData = (tpsSites: SiteProfile[]) => {
        const formattedTableData = [];

        for (const site of tpsSites) {
            const totalPcs = site?.nd_site?.reduce((sum, s) => sum + (s.nd_asset?.length || 0), 0);
            let inUse = 0;
            let available = 0;

            for (const repSite of site?.nd_site || []) {
                for (const asset of repSite.nd_asset || []) {
                    const bookings = asset.nd_booking || [];

                    const isInUse = bookings.length > 0 && bookings.some(b => b.is_using === true);
                    const isAvailable = bookings.length === 0 || bookings.every(b => b.is_using === false);

                    if (isInUse) {
                        inUse++;
                    } else if (isAvailable) {
                        available++;
                    }
                }
            }

            formattedTableData.push({
                id: site.id,
                siteName: site?.sitename,
                region: site?.nd_region?.eng,
                state: site?.nd_state?.name,
                totalPcs: totalPcs,
                inUse: inUse,
                available: available,
                maintenance: "0 in Maintenance",
                action: "View"
            });
        }

        return formattedTableData;
    }

    const siteOverView = [
        {
            title: "Total Sites",
            value: String(initialTotalSites.current),
            description: "",
        },
        {
            title: "Total Pcs",
            value: totalPc,
            description: "",
        },
        {
            title: "PCs In Use",
            value: pcInUse,
            description: "",
            customValueColorClass: "text-blue-500"
        },
        {
            title: "Pcs available",
            value: pcsInTpsAdminSite.filter(pc =>
                !pc?.nd_booking?.some(b => b?.is_using)
            ).length.toString(),
            description: "",
            customValueColorClass: "text-green-500"
        },
    ];

    const headTable = [
        { key: "siteName", label: "Site Name" },
        { key: "region", label: "Region" },
        { key: "state", label: "State" },
        { key: "totalPcs", label: "Total PCs" },
        { key: "inUse", label: "In Use" },
        { key: "available", label: "Available" },
        { key: "maintenance", label: "Maintenance" },
        { key: "action", label: "Action" }
    ];

    if (
        isLoadingPCs
    ) {
        return <LoadingSpinner />
    }

    return (
        <>
            <header className="flex flex-col justify-start">
                <h1 className="text-2xl font-bold">TP Admin Dashboard</h1>
                <p className="text-gray-600">Manage Facilities and PCs bookings</p>
            </header>

            <div className="p-6 bg-white rounded-md border border-gray-200 mt-6">
                <h1 className="text-2xl font-semibold mb-3">Overview</h1>
                <div className="flex gap-3 items-center">
                    {siteOverView.map((site, idx) => (
                        <StatsCard
                            key={idx}
                            className="flex-grow border border-gray-200"
                            title={site.title}
                            value={site.value}
                            customValueColorClass={site?.customValueColorClass}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center mt-6">
                <div className="flex items-center gap-3 flex-grow">
                    <Input
                        className="w-[30%]"
                        type="search"
                        placeholder="Search Site..."
                        value={filter.searchInput}
                        onChange={(e) => {
                            setFilter((prev) => ({
                                ...prev,
                                searchInput: e.target.value
                            }))
                        }}
                    />
                    <Select defaultValue={String(selectedRegion)} onValueChange={(value) => {
                        setFilter((prev) => ({
                            ...prev,
                            region: value
                        }))
                        setSelectedRegion(Number(value))
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={`Select Region`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                { isAllRegionLoading ? (<LoadingSpinner />) :
                                    [{ eng: "All Region", id: "0" }, ...allRegion].map((region) => (
                                        <SelectItem key={region.id} value={String(region.id)}>{region.eng}</SelectItem>
                                    ))
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select defaultValue={String(selectedState)} onValueChange={(value) => {
                        setFilter((prev) => ({
                            ...prev,
                            state: value
                        }))
                        setSelectedState(Number(value))
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={`Select State`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                { isAllStateLoading ? (<LoadingSpinner />) :
                                    [{ name: "All State", id: "0" }, ...allState].map((state) => (
                                        <SelectItem key={state.id} value={String(state.id)}>{state.name}</SelectItem>
                                    ))
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => exportToCSV(bodyTableData, "sites")} className="flex gap-2">
                    <Download />
                    Export
                </Button>
            </div>
            <div className="rounded-md">
                <PaginationTableServer
                    isStateLoading={isAllStateLoading}
                    isRegionLoading={isAllRegionLoading}
                    contentResult={bodyTableData}
                    page={page}
                    setPage={setPage}
                    isLoading={isSiteResultLoading}
                    totalPages={initialTotalSites.current}
                    handleSelectedSite={handleSelectedSite}
                    headTable={headTable}
                />
            </div>
        </>
    )
}