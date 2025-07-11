import { Input } from "@/components/ui/input";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import React, { useEffect, useState } from "react";
import { useFinanceQueries } from "@/hooks/finance/use-finance-queries";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ComboBoxFilterFinance } from "./ComboBoxFilterFinance";
import { useUserOrgId } from "../utils/useUserOrgId";

export interface Filter {
    status: string;
    month: string;
    year: string;
    phase: string;
    region: string;
}

interface FilterFinanceProps {
    selectedFilter: Filter,
    setSelectedFilter: React.Dispatch<React.SetStateAction<Filter>>
    setSearch: React.Dispatch<React.SetStateAction<string>>
}

export const FilterFinance = ({
    selectedFilter,
    setSelectedFilter,
    setSearch
}: FilterFinanceProps) => {
    const {
        useSiteReportStatusQuery,
        useTwelveMonthNamesQuery,
        useYearsFromTwentyTwenty,
        useAllRegion,
        useAllPhases
    } = useFinanceQueries();
    const {
        isTpSite
    } = useUserOrgId();
    const {
        data: financeStatusQueries,
        isLoading: isLoadingFinanceStatusQueries
    } = useSiteReportStatusQuery();
    const {
        data: twelveMonthNames,
        isLoading: isLoadingTwelveMonthNames
    } = useTwelveMonthNamesQuery();
    const {
        data: yearsFromTwentyTwenty,
        isLoading: isLoadingYearsFromTwentyTwenty
    } = useYearsFromTwentyTwenty();
    const {
        data: allRegion,
        isLoading: isLoadingAllRegion
    } = useAllRegion();
    const {
        data: allPhases,
        isLoading: isLoadingAllPhases
    } = useAllPhases();

    const [status, setStatus] = useState(selectedFilter.status);
    const [month, setMonth] = useState(selectedFilter.month);
    const [year, setYear] = useState(selectedFilter.year);
    const [phase, setPhase] = useState(selectedFilter.phase);
    const [region, setRegion] = useState(selectedFilter.region);

    useEffect(() => {
        setStatus(selectedFilter.status);
        setMonth(selectedFilter.month);
        setYear(selectedFilter.year);
        setPhase(selectedFilter.phase);
        setRegion(selectedFilter.region);
    }, [selectedFilter]);

    useEffect(() => {
        setSelectedFilter({
            status,
            month,
            year,
            phase,
            region
        });
    }, [status, month, year, phase, region]);

    const handleResetFilter = () => {
        setSelectedFilter({
            status: "",
            month: "",
            year: "",
            phase: "",
            region: ""
        });
    }

    if (
        isLoadingFinanceStatusQueries ||
        isLoadingTwelveMonthNames ||
        isLoadingYearsFromTwentyTwenty ||
        isLoadingAllRegion ||
        isLoadingAllPhases
    ) {
        return <LoadingSpinner />;
    }

    return (
        <section className="flex flex-col gap-4 p-5 bg-white border border-gray-200 rounded-md">
            <div className="flex items-center gap-2">
                {!isTpSite && (
                    <>
                        <div
                            className="flex items-center flex-grow gap-2 border border-gray-200 rounded-md transition px-3 py-2 ring-0 focus-within:ring-2 focus-within:ring-gray-300 hover:ring-2 hover:ring-gray-200"
                            id="search"
                        >
                            <Search className="w-4 h-4 text-gray-500" />
                            <input
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0"
                                type="search"
                                placeholder="Search site name..."
                            />
                        </div>
                        <Button onClick={handleResetFilter} className="flex items-center gap-2">
                            <RotateCcw />
                            Reset Filter
                        </Button>
                    </>
                )}
            </div>
            <div className="flex items-center justify-between gap-3">
                <ComboBoxFilterFinance
                    filterValues={financeStatusQueries.map((status) => status.status)}
                    label="Status"
                    key="status"
                    setValue={setStatus}
                    value={status}
                    className="flex-grow"
                />
                <ComboBoxFilterFinance
                    filterValues={twelveMonthNames}
                    label="Month"
                    key="month"
                    setValue={setMonth}
                    value={month}
                    className="flex-grow"
                />
                <ComboBoxFilterFinance
                    filterValues={yearsFromTwentyTwenty}
                    label="Year"
                    key="year"
                    setValue={setYear}
                    value={year}
                    className="flex-grow"
                />
                {isTpSite && (
                    <Button onClick={handleResetFilter} className="flex items-center gap-2">
                        <RotateCcw />
                        Reset Filter
                    </Button>
                )}
                {!isTpSite && (
                    <>
                        <ComboBoxFilterFinance
                            filterValues={allRegion.map((region) => region.eng)}
                            label="Region"
                            key="region"
                            setValue={setRegion}
                            value={region}
                            className="flex-grow"
                        />
                        <ComboBoxFilterFinance
                            filterValues={allPhases.map((phase) => phase.name)}
                            label="Phase"
                            key="phase"
                            setValue={setPhase}
                            value={phase}
                            className="flex-grow"
                        />
                    </>
                )}
            </div>
        </section>
    );
};