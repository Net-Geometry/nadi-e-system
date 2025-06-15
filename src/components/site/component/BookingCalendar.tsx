import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types/booking";
import { NoBookingFound } from "./NoBookingFound";
import { CircleDot, Download, PcCase, Plus, Search, Server } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { BookingFormDialog } from "./BookingFormDialog";
import { getDuration } from "../utils/duration";
import { useUserName } from "@/hooks/use-user";
import { assetClient } from "@/hooks/assets/asset-client";
import { Asset } from "@/types/asset";
import { BodyTableData, BookingListsTable } from "./BookingListTable";
import { DateRange } from "react-day-picker";
import React from "react";
import { DatePickerWithRange } from "@/components/ui/dateRangePicker";
import { toTwentyFourFormat } from "../utils/dateTimeConverter";
import { Input } from "@/components/ui/input";
import { exportToCSV } from "@/utils/export-utils";
import { SiteSpace } from "@/types/site";

interface BookingCalendarProp {
    bookingType: string,
    assetTypeNames: string[],
    isTpAdmin: boolean,
    date: DateRange,
    setDate: React.Dispatch<React.SetStateAction<DateRange>>,
    header?: string;
    bookingData: Booking[],
    onChangeFilter: (assetTypeName: string, searchInput: string) => void,
    setBookingCalendarData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    isLoading?: boolean,
    isFacility?: boolean,
    setSeletedPcsData?: React.Dispatch<React.SetStateAction<Asset[]>>,
    setSelectedFacilitiesData?: React.Dispatch<React.SetStateAction<SiteSpace[]>>,
    isMember: boolean,
    isTpSite: boolean
}

export const BookingCalendar = ({
    bookingType,
    assetTypeNames,
    isTpAdmin,
    isMember,
    isTpSite,
    header,
    date,
    setDate,
    bookingData,
    isFacility,
    setBookingCalendarData,
    setBookingsData,
    onChangeFilter,
    isLoading,
    setSeletedPcsData,
    setSelectedFacilitiesData
}: BookingCalendarProp) => {
    const [formattedBookingData, setFormattedBookingData] = useState<BodyTableData[]>([]);
    const [assetTypeName, setAssetTypeName] = useState<string>(`all ${bookingType}`);
    const [searchInput, setSearchInput] = useState("");
    const [open, setOpen] = useState(false);
    const setOfAssetName = new Set(assetTypeNames);
    const uniqueAssetNames = [...setOfAssetName];
    const { fetchUserById } = useUserName();

    const pcHeadTable = [
        { key: "userName", label: "User" },
        { key: "bookingAssetTypeName", label: "PC Name" },
        { key: "startTime", label: "Start Time" },
        { key: "endTime", label: "End Time" },
        { key: "duration", label: "Duration" }
    ];

    const facilityHeadTable = [
        { key: "userName", label: "Member ID" },
        { key: "bookingAssetTypeName", label: "Name" },
        { key: "startTime", label: "Time" },
        { key: "endTime", label: "Date" },
        { key: "duration", label: "Facility" }
    ];

    useEffect(() => {
        let isActive = true;

        async function prepareBookingData(currentFilteredBookingData: Booking[]) {
            if (!currentFilteredBookingData || currentFilteredBookingData.length === 0) {
                setFormattedBookingData([]);
                return;
            };

            const processed = await Promise.all(
                currentFilteredBookingData.map(async (booking) => {
                    const user = await fetchUserById(booking.created_by);
                    const full_name = user?.full_name ?? "-";

                    return {
                        userName: full_name,
                        bookingAssetTypeName: !isFacility ? booking.nd_asset?.name : booking.nd_site_space.nd_space.eng,
                        startTime: toTwentyFourFormat(new Date(booking.booking_start)),
                        endTime: toTwentyFourFormat(new Date(booking.booking_end)),
                        duration: getDuration(booking.booking_start, booking.booking_end)
                    };
                })
            );

            if (isActive) {
                setFormattedBookingData(processed);
            }
        }

        prepareBookingData(bookingData);

        return () => {
            isActive = false;
        };
    }, [bookingData]);

    const handleFilter = (assetTypeName: string, searchInput: string) => {
        onChangeFilter(assetTypeName, searchInput);
    }

    useEffect(() => {
        handleFilter(assetTypeName, searchInput);
    }, [assetTypeName, searchInput]);
    
    return (
        <section className="w-full flex flex-col gap-4 mt-4">
            {header && (
                <h1 className="text-2xl font-bold">{header}</h1>
            )}
            <div id="filters" className="flex justify-between">
                <div className="flex gap-2">
                    <div className="relative w-52">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={`Search ${!isFacility ? "PC" : "Facility"} Name...`}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select onValueChange={(value) => setAssetTypeName(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={`Select ${!isFacility ? "PC" : "Facility"} Name`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {
                                    uniqueAssetNames.map((assetName, i) => (
                                        <SelectItem key={`assetName${i}`} value={assetName}>{assetName}</SelectItem>
                                    ))
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <DatePickerWithRange
                        date={date}
                        setDate={setDate}
                    />
                    <Button onClick={() => exportToCSV(formattedBookingData, "pc_booking")} className="flex gap-2">
                        <Download />
                        Export
                    </Button>
                </div>
                {(isTpSite || isMember) && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger >
                            <Button className="text-base font-semibold">
                                <Plus />
                                <span>add new booking</span>
                            </Button>
                        </DialogTrigger>
                        <BookingFormDialog
                            isTpSite={isTpSite}
                            isMember={isMember}
                            isFacility={isFacility}
                            setOpen={setOpen}
                            open={open}
                            setBookingCalendarData={setBookingCalendarData}
                            setBookingsData={setBookingsData}
                            isLoading={isLoading}
                            assetsName={assetTypeNames.filter((name) => name !== "all pc")}
                            setSelectedFacilitiesData={setSelectedFacilitiesData}
                            setSeletedPcsData={setSeletedPcsData}
                        />
                    </Dialog>
                )}
            </div>
            <BookingListsTable
                isFacility={isFacility}
                headTable={isFacility ? facilityHeadTable : pcHeadTable}
                bodyTableData={formattedBookingData}
                withTableTitle={false}
                className="mt-0 border border-gray-100"
            />
        </section>
    )
}