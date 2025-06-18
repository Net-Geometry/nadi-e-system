import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, CircleCheckBig, FolderXIcon, MonitorCheck, RotateCcwSquare, Server, UserCheck } from "lucide-react";
import { StatsCard } from "../dashboard/StatsCard";
import FilterBar from "./component/FilterBar";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { useAssets } from "@/hooks/use-assets";
import { BookingCalendar } from "./component/BookingCalendar";
import { useBookingQueries } from "@/hooks/booking/use-booking-queries";
import { Booking } from "@/types/booking";
import { toTwentyFourFormat } from "./utils/dateTimeConverter";
import { getDuration } from "./utils/duration";
import { Asset } from "@/types/asset";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { SiteSpace } from "@/types/site";
import { NoBookingFound } from "./component/NoBookingFound";
import { useUserName } from "@/hooks/use-user";
import { BulkActionButtons } from "./component/BulkActionButtons";
import { DateRange } from "react-day-picker";
import { bookingClient } from "@/hooks/booking/booking-client";
import { useMemberSiteId, useSiteId, useTpManagerSiteId } from "@/hooks/use-site-id";
import { PaginationCard } from "./component/PaginationCard";
import { PaginationTable } from "./component/PaginationTable";
import SiteDashboard from "@/pages/dashboard/site/SiteDashboard";
import { Button } from "../ui/button";
import { space } from "postcss/lib/list";

type FilterParams = {
    availability: string,
    typeTabs: string,
    searchQuery?: string,
    spaceName?: string,
};

export const BookingManagementDetail = () => {
    // Set UI content based on role access modifier
    const userMetadata = useUserMetadata();
    const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
    const tpAdminOrganizationId =
        parsedMetadata?.user_type !== "super_admin" &&
            parsedMetadata?.user_group_name === "TP" &&
            parsedMetadata?.user_type === "tp_admin" &&
            !!parsedMetadata?.organization_name &&
            parsedMetadata?.organization_id
            ? parsedMetadata.organization_id
            : null;
    const tpSiteOrganizationId =
        parsedMetadata?.user_group === 9 &&
            parsedMetadata?.user_group_name === "Site" &&
            parsedMetadata?.user_type === "tp_site" &&
            parsedMetadata?.organization_id
            ? parsedMetadata.organization_id
            : null;

    const isTpAdmin = !!tpAdminOrganizationId;
    const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
    const isTpSite = !!tpSiteOrganizationId;
    const isMember = parsedMetadata?.user_group === 7;

    const { siteId: memberSiteId, isLoading: memberSiteIdLoading } = useMemberSiteId(isMember);
    const { siteId: tpManagerSiteId, isLoading: tpManagerSiteIdLoading } = useTpManagerSiteId(isTpSite);

    const {
        useAssetsByTypeQuery,
        useAssetBySite,
        useAssetsInTpsSites
    } = useAssets();
    const {
        useBookingQuery,
        useTpsSites,
        useBookingAssetInTpsSites,
        useSitesSpaces,
        usesitesSpacesBookings,
        useBookingSpacesInTpsSites,
        useSpacesBySite
    } = useBookingQueries();

    const { data: tpsSites, isLoading: isTpsSitesLoading } = useTpsSites(tpAdminOrganizationId);
    const tpsSiteIds = tpsSites?.map(tp => tp.id) ?? [];

    // Member or TP Site Site ID
    const siteId = memberSiteId ? Number(memberSiteId) : tpManagerSiteId ? Number(tpManagerSiteId) : undefined;

    // All pcs and pcs booking data
    const { data: sitesPcs, isLoading: isSitesPcsLoading } = useAssetsByTypeQuery(siteId);
    const { data: pcsBooking, isLoading: isBookingLoading } = useBookingQuery(siteId);
    const { data: tpsSitesPcsBookings, isLoading: isTpsSitesPcsBookingsLoading } = useBookingAssetInTpsSites(tpsSiteIds);

    // All Facilities and facilies data
    const { data: sitesFacilities, isLoading: isSitesFacilities } = useSitesSpaces(siteId);
    const { data: facilitiesBooking, isLoading: isFacilitiesBooking } = usesitesSpacesBookings(siteId);
    const { data: tpsSitesFacilitiesBookings, isLoading: isTpsSitesFacilitiesBookingsLoading } = useBookingSpacesInTpsSites(tpsSiteIds);

    // All PC in tp admin sites
    const { data: pcsInTpsAdminSites, isLoading: pcsInTpsAdminSitesLoading } = useAssetsInTpsSites(tpAdminOrganizationId);

    // State to share to the TP admin dashboard (choosing a site)
    const [selectedSiteId, setSelectedSiteId] = useState<number | null>();
    const { data: tpsSitePcs, isLoading: isAssetTpsSiteLoading } = useAssetBySite(selectedSiteId);
    const { data: tpsSitesFacilities, isLoading: isTpsSitesFacilities } = useSpacesBySite(selectedSiteId);

    function handleResetselectedSite() {
        setSelectedSiteId(null);
    }

    const filterededBookingInTpSite = (!!tpsSitesPcsBookings ? tpsSitesPcsBookings : tpsSitesFacilitiesBookings)
        ?.filter((pcBooking) => pcBooking?.nd_asset?.site_id === selectedSiteId)

    // State to share to the pc calendar component (UI update when submitted a form)
    const [pcsBookingsData, setPcsBookingsData] = useState([]);
    const [facilitiesBookingsData, setFacilitiesBookingsData] = useState([]);

    useEffect(() => {
        const sourcePcBooking =
            (isTpAdmin || isSuperAdmin)
                ? filterededBookingInTpSite
                : pcsBooking;

        const sourceFacilitiesBooking =
            (isTpAdmin || isSuperAdmin)
                ? filterededBookingInTpSite
                : facilitiesBooking;

        if (sourcePcBooking) {
            setPcsBookingsData(sourcePcBooking);
        }
        if (sourceFacilitiesBooking) {
            setFacilitiesBookingsData(sourceFacilitiesBooking)
        }
    }, [
        pcsBooking,
        facilitiesBooking,
        tpsSitesPcsBookings,
        tpsSitesFacilitiesBookings,
        selectedSiteId,
        isSuperAdmin,
        isTpAdmin
    ]);

    // State to share to the PC and Faility status to update the availability
    const [selectedPcsData, setSelectedPcsData] = useState<Asset[]>([]);
    const [selectedFacilitiesData, setSelectedFacilitiesData] = useState<SiteSpace[]>([]);
    useEffect(() => {
        const sourcePcsData =
            (isTpAdmin || isSuperAdmin)
                ? tpsSitePcs
                : sitesPcs;

        const sourceFacilitiesData =
            (isTpAdmin || isSuperAdmin)
                ? tpsSitesFacilities
                : sitesFacilities;

        if (sourcePcsData) {
            setSelectedPcsData(sourcePcsData);
        }
        if (sourceFacilitiesData) {
            setSelectedFacilitiesData(sourceFacilitiesData);
        }
    }, [
        pcsInTpsAdminSites,
        sitesPcs,
        tpsSitesFacilities,
        tpsSitePcs,
        sitesFacilities,
        isTpAdmin,
        isSuperAdmin
    ]);


    if (
        isSitesPcsLoading ||
        isAssetTpsSiteLoading ||
        isBookingLoading ||
        isTpsSitesLoading ||
        isTpsSitesPcsBookingsLoading ||
        isSitesFacilities ||
        isFacilitiesBooking ||
        isTpsSitesFacilitiesBookingsLoading ||
        isTpsSitesFacilities ||
        !parsedMetadata ||
        memberSiteIdLoading ||
        pcsInTpsAdminSitesLoading ||
        tpManagerSiteIdLoading
    ) {
        return <LoadingSpinner />;
    }

    if (
        (isTpAdmin || isSuperAdmin) &&
        !selectedSiteId
    ) {
        return (
            <SiteDashboard
                isBookingsEnabled={true}
                setSelectedSiteId={setSelectedSiteId}
            />
        );
    }

    console.log("selcted pcs data", selectedPcsData);

    return (
        <div className="relative">

            <>
                {(isTpAdmin || isSuperAdmin) && (
                    <Button className="absolute top-0 left-0 items-center gap-2 font-medium text-base" onClick={handleResetselectedSite}>
                        <ChevronLeft className="h-32" />
                        Choose Other Site
                    </Button>
                )}
                <BookingHeader />
                <BookingContent
                    isTpSite={isTpSite}
                    isMember={isMember}
                    pcsBooking={pcsBookingsData}
                    facilitiesBooking={facilitiesBookingsData}
                    pcsData={selectedPcsData}
                    facilitiesData={selectedFacilitiesData}
                    setPcsBookingsData={setPcsBookingsData}
                    setFacilitiesBookingsData={setFacilitiesBookingsData}
                    isBookingLoading={isBookingLoading}
                    isTpAdmin={isTpAdmin}
                    setSelectedPcsData={setSelectedPcsData}
                    setSelectedFacilitiesData={setSelectedFacilitiesData}
                />
            </>
        </div>
    )
}

const BookingHeader = () => {
    return (
        <section className="flex flex-col justify-center items-center">
            <h1 className="text-4xl font-extrabold">PC Booking Management</h1>
            <p className="text-muted-foreground mt-2">Monitor and manage PC usage</p>
        </section>
    )
}

interface BookingContentProps {
    isTpSite: boolean
    isMember: boolean
    pcsData: Asset[]
    facilitiesData: SiteSpace[]
    pcsBooking: Booking[]
    facilitiesBooking: Booking[]
    isTpAdmin?: boolean
    isBookingLoading: boolean
    setPcsBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setFacilitiesBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setSelectedPcsData?: React.Dispatch<React.SetStateAction<Asset[]>>,
    setSelectedFacilitiesData?: React.Dispatch<React.SetStateAction<SiteSpace[]>>
}

const BookingContent = ({
    pcsData,
    pcsBooking,
    isMember,
    isTpSite,
    isTpAdmin,
    setSelectedPcsData,
    setSelectedFacilitiesData,
    setPcsBookingsData,
    setFacilitiesBookingsData,
    isBookingLoading,
    facilitiesBooking,
    facilitiesData
}: BookingContentProps) => {
    const now = new Date().getTime();

    const totalPcs = pcsData.length;
    const pcInUse = pcsData.filter((pc) => pc.nd_booking.find(
                        (b) => new Date(b.booking_start).getTime() <= now && new Date(b.booking_end).getTime() >= now && b.is_active
                    )).length;
    const pcAvailable = totalPcs - pcInUse;

    return (
        <Tabs defaultValue="PC Bookings" className="w-full grid place-items-center mt-7">
            <TabsList className="bg-white inline-flex h-11 flex-wrap justify-center gap-2 items-center">
                <TabsTrigger
                    className="text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                    key="PC Bookings"
                    value="PC Bookings">PC Bookings</TabsTrigger>
                <TabsTrigger
                    className="text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                    key="PC Calendar"
                    value="PC Calendar">PC Calendar</TabsTrigger>
                {!isMember && (
                    <>
                        <TabsTrigger
                            className="text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                            key="Facility Bookings"
                            value="Facility Bookings">Facility Bookings</TabsTrigger>
                        <TabsTrigger
                            className="text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                            key="Facility Calendar"
                            value="Facility Calendar">Facility Calendar</TabsTrigger>
                    </>
                )}
            </TabsList>
            <PcBookings
                value="PC Bookings"
                pcStats={{
                    totalPcs: pcsData.length,
                    pcInUse: pcInUse,
                    pcAvailable: pcAvailable
                }}
                pcsData={pcsData}
                isTpAdmin={isTpAdmin}
                isTpSite={isTpSite}
                bookingsData={pcsBooking}
                setBookingsData={setPcsBookingsData}
                isLoading={isBookingLoading}
            />
            <PcCalender
                isTpAdmin={isTpAdmin}
                isMember={isMember}
                isTpSite={isTpSite}
                value="PC Calendar"
                pcsData={pcsData.map((pc) => pc.name)}
                bookingsData={pcsBooking}
                setBookingsData={setPcsBookingsData}
                isLoading={isBookingLoading}
                setSelectedPcsData={setSelectedPcsData}
            />
            <FacilityBooking
                value="Facility Bookings"
                facilitiesData={facilitiesData}
                isTpSite={isTpSite}
                isMember={isMember}
                setBookingsData={setFacilitiesBookingsData}
                setSelectedFacilitiesData={setSelectedFacilitiesData}
            />
            <FacilityCalender
                isMember={isMember}
                isTpSite={isTpSite}
                value="Facility Calendar"
                bookingsData={facilitiesBooking}
                facilitiesData={facilitiesData.map(facility => facility?.nd_space?.eng)}
                isTpAdmin={isTpAdmin}
                setBookingsData={setFacilitiesBookingsData}
                setSelectedFacilitiesData={setSelectedFacilitiesData}
            />
        </Tabs>
    )
}

interface PcBookingProps {
    value: string,
    pcStats: {
        totalPcs: number | string,
        pcInUse: number | string,
        pcAvailable: number | string
    }
    pcsData: Asset[],
    isTpAdmin: boolean,
    isTpSite: boolean,
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    bookingsData: Booking[],
    isLoading: boolean
}

const PcBookings = ({
    value,
    pcStats,
    pcsData,
    isTpSite,
    isTpAdmin,
    setBookingsData,
    bookingsData,
    isLoading
}: PcBookingProps) => {

    const statsItems = [
        {
            title: "Total PCs",
            value: String(pcStats.totalPcs),
            icon: Server,
            description: "",
            iconBgColor: "bg-gray-200",
            iconTextColor: "text-black",
        },
        {
            title: "In Use",
            value: String(pcStats.pcInUse),
            icon: RotateCcwSquare,
            description: "",
            iconBgColor: "bg-blue-100",
            iconTextColor: "text-blue-500",
        }, {
            title: "Available",
            value: String(pcStats.pcAvailable),
            icon: CircleCheckBig,
            description: "",
            iconBgColor: "bg-green-100",
            iconTextColor: "text-green-500",
        },
    ]

    return (
        <TabsContent className="w-full mt-6" value={value}>
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {
                    statsItems.map((item) => (
                        <StatsCard key={item.title} {...item} />
                    ))
                }
            </section>
            <PcMainContent
                isTpSite={isTpSite}
                pcsData={pcsData}
                bookingsData={bookingsData}
                setBookingsData={setBookingsData}
                isLoading={isLoading}
                isTpAdmin={isTpAdmin}
            />
        </TabsContent>
    )
}

interface PcMainContentProps {
    bookingsData: Booking[]
    pcsData: Asset[]
    isLoading: boolean
    isTpAdmin: boolean
    isTpSite: boolean
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
}

export const PcMainContent = ({
    bookingsData,
    setBookingsData,
    pcsData,
    isTpSite,
    isTpAdmin,
    isLoading
}: PcMainContentProps) => {
    //"User", "PC", "Start Time", "End Time", "Duration"
    const headTable = [
        { key: "userName", label: "User" },
        { key: "bookingAssetTypeName", label: "PC" },
        { key: "startTime", label: "Start Time" },
        { key: "endTime", label: "End Time" },
        { key: "duration", label: "Duration" },
    ];

    const recentBookings = bookingsData?.map((booking: Booking) => {
        return {
            userName: booking.profiles?.full_name,
            bookingAssetTypeName: booking?.nd_asset?.name,
            startTime: toTwentyFourFormat(new Date(booking.booking_start)),
            endTime: toTwentyFourFormat(new Date(booking.booking_end)),
            duration: getDuration(booking.booking_start, booking.booking_end),
            ...booking
        }
    }).filter((booking) => booking.is_active === true)

    return (
        <section className="mt-6 flex flex-col" id="pc status">
            {isTpSite && <BulkActionButtons />}
            <AssetStatus
                assetData={pcsData}
                header="PC Status"
                isLoading={isLoading}
            />
            <PaginationTable
                headTable={headTable}
                bodyTableData={recentBookings}
                header="Recent Booking"
            />
        </section>
    )
}

interface PcCalenderProps {
    value: string,
    isMember: boolean,
    isTpSite: boolean,
    isTpAdmin: boolean,
    pcsData: string[],
    bookingsData: Booking[],
    isLoading: boolean,
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>
    setSelectedPcsData?: React.Dispatch<React.SetStateAction<Asset[]>>
}

export const PcCalender = ({
    value,
    pcsData,
    isMember,
    isTpSite,
    bookingsData,
    isTpAdmin,
    setBookingsData,
    setSelectedPcsData,
    isLoading
}: PcCalenderProps) => {
    const [bookingCalendarData, setBookingCalendarData] = useState<Booking[]>([]);
    const [rawBookingCalendarData, setRawBookingCalendarData] = useState([]);
    const [date, setDate] = useState<DateRange | null>(null);

    useEffect(() => {
        function filterByDateRange(bookingData: Booking[], range: DateRange): Booking[] {
            if (!range?.from || !range?.to) return bookingData;

            const { from, to } = range;

            return bookingData.filter(item => {
                const itemDate = new Date(item.created_at);
                if (from && to) return itemDate >= from && itemDate <= to;
                if (from) return itemDate >= from;
                if (to) return itemDate <= to;
                return true;
            });
        }

        const filteredRawData = filterByDateRange(bookingsData, date);
        setRawBookingCalendarData(filteredRawData);
        setBookingCalendarData(filteredRawData);
    }, [bookingsData, date]);

    const onChangeFilter = (
        assetTypeName: string,
        searchInput: string = ""
    ) => {
        let filtered = rawBookingCalendarData;

        if (assetTypeName.toLowerCase() !== "all pc") {
            filtered = filtered.filter((booking) =>
                booking.nd_asset.name.toLowerCase() === assetTypeName.toLowerCase()
            );
        }

        if (searchInput.trim() !== "") {
            filtered = filtered.filter((booking) =>
                booking.nd_asset.name.toLowerCase().includes(searchInput.toLowerCase())
            );
        }

        setBookingCalendarData(filtered);
    };

    return (
        <TabsContent className="w-full" value={value}>
            <BookingCalendar
                isMember={isMember}
                isTpSite={isTpSite}
                assetTypeNames={[
                    "All PC",
                    ...pcsData
                ]}
                date={date}
                setDate={setDate}
                bookingType="pc"
                bookingData={bookingCalendarData}
                setBookingCalendarData={setBookingCalendarData}
                isLoading={isLoading}
                setBookingsData={setBookingsData}
                isTpAdmin={isTpAdmin}
                onChangeFilter={onChangeFilter}
                setSeletedPcsData={setSelectedPcsData}
            />
        </TabsContent>
    )
}

interface FacilityBookingProps {
    value: string,
    facilitiesData: SiteSpace[]
    isTpSite?: boolean
    isMember?: boolean
    setBookingsData?: React.Dispatch<React.SetStateAction<Booking[]>>
    setSelectedFacilitiesData?: React.Dispatch<React.SetStateAction<SiteSpace[]>>
}

const FacilityBooking = ({
    value,
    facilitiesData,
    isTpSite,
    isMember,
    setBookingsData,
    setSelectedFacilitiesData
}: FacilityBookingProps) => {
    return (
        <TabsContent className="w-full" value={value}>
            <AssetStatus
                header="Facility Status"
                spaceData={facilitiesData}
                isTpSite={isTpSite}
                isMember={isMember}
                setSelectedFacilitiesData={setSelectedFacilitiesData}
                setBookingsData={setBookingsData}
            />
        </TabsContent>
    )
}

interface FacilityCalendarProps {
    value: string;
    facilitiesData: string[];
    bookingsData: Booking[];
    setBookingsData: React.Dispatch<Booking[]>;
    isLoading?: boolean;
    isMember: boolean;
    isTpSite: boolean;
    isTpAdmin: boolean;
    setSelectedFacilitiesData?: React.Dispatch<React.SetStateAction<SiteSpace[]>>
}

const FacilityCalender = ({
    value,
    isMember,
    isTpSite,
    facilitiesData,
    isTpAdmin,
    bookingsData,
    setBookingsData,
    setSelectedFacilitiesData
}: FacilityCalendarProps) => {
    const [bookingCalendarData, setBookingCalendarData] = useState<Booking[]>([]);
    const [rawBookingCalendarData, setRawBookingCalendarData] = useState([]);
    const [date, setDate] = useState<DateRange | null>(null);

    useEffect(() => {
        function filterByDateRange(bookingData: Booking[], range: DateRange): Booking[] {
            if (!range?.from || !range?.to) return bookingData;

            const { from, to } = range;
            return bookingData.filter(item => {
                const itemDate = new Date(item.created_at);
                if (from && to) return itemDate >= from && itemDate <= to;
                if (from) return itemDate >= from;
                if (to) return itemDate <= to;
                return true;
            });
        }

        const filteredRawData = filterByDateRange(bookingsData, date);
        setRawBookingCalendarData(filteredRawData);
        setBookingCalendarData(filteredRawData);
    }, [bookingsData, date]);

    const onChangeFilter = (
        assetTypeName: string,
        searchInput: string = ""
    ) => {
        let filtered = rawBookingCalendarData;

        if (assetTypeName.toLowerCase() !== "all facilities") {
            filtered = filtered.filter((booking) =>
                booking.nd_site_space.nd_space.eng.toLowerCase() === assetTypeName.toLowerCase()
            );
        }

        if (searchInput.trim() !== "") {
            filtered = filtered.filter((booking) =>
                booking.nd_site_space.nd_space.eng.toLowerCase().includes(searchInput.toLowerCase())
            );
        }

        setBookingCalendarData(filtered);
    };

    return (
        <TabsContent className="w-full mt-6 space-y-6" value={value}>
            <BookingCalendar
                assetTypeNames={[
                    "All Facilities",
                    ...facilitiesData
                ]}
                isMember={isMember}
                isTpSite={isTpSite}
                date={date}
                setDate={setDate}
                isFacility={true}
                bookingType="facilities"
                bookingData={bookingCalendarData}
                setBookingCalendarData={setBookingCalendarData}
                setBookingsData={setBookingsData}
                isTpAdmin={isTpAdmin}
                onChangeFilter={onChangeFilter}
                setSelectedFacilitiesData={setSelectedFacilitiesData}
            />
        </TabsContent>
    )
}

interface AssetStatusProps {
    assetData?: Asset[]
    spaceData?: SiteSpace[]
    isLoading?: boolean
    header?: string
    isTpSite?: boolean
    isMember?: boolean
    setBookingsData?: React.Dispatch<React.SetStateAction<Booking[]>>
    setSelectedFacilitiesData?: React.Dispatch<React.SetStateAction<SiteSpace[]>>
}

const AssetStatus = ({
    assetData,
    spaceData,
    isLoading,
    header,
    isTpSite,
    isMember,
    setBookingsData,
    setSelectedFacilitiesData
}: AssetStatusProps) => {
    const { useSpaces } = useBookingQueries();
    const { data: spaces, isLoading: allSpacesLoading } = useSpaces();
    const { fetchUserById } = useUserName();

    const [rawPcsData, setRawPcsData] = useState([]);
    const [pcs, setPcs] = useState([]);

    const [rawFacilitiesData, setRawFacilitiesData] = useState([]);
    const [facilities, setFacilities] = useState([]);

    const statusBadges = [
        {
            name: "Available",
            customClass: "bg-green-200 text-green-600 hover:bg-green-300 font-semibold"
        },
        {
            name: "In Use",
            customClass: "bg-blue-200 text-blue-600 hover:bg-blue-300 font-semibold"
        },
        {
            name: "Maintenance",
            customClass: "bg-red-200 text-red-600 hover:bg-red-300 font-semibold"
        }
    ];

    useEffect(() => {
        let isActive = true;

        async function preparePcData(currentFilteredFacilitiesData: SiteSpace[]) {

            if (!currentFilteredFacilitiesData || currentFilteredFacilitiesData.length === 0) {
                setRawFacilitiesData([]);
                setFacilities([]);
                return;
            }

            const processedFacilities = await Promise.all(
                currentFilteredFacilitiesData.map((facility) => {
                    const booking = facility.nd_booking.filter((booking) => booking.site_space_id === facility.id && booking.is_active);
                    const now = new Date().getTime();
                    const currentActiveBooking = booking.find(
                        (booking) => new Date(booking.booking_start).getTime() <= now && new Date(booking.booking_end).getTime() >= now
                    ) || null;
                    const isActiveBooking = !!currentActiveBooking;
                    return {
                        id: facility.id,
                        status: currentActiveBooking ? "in-use" : "Available",
                        type: facility.nd_space?.eng,
                        name: facility.nd_space?.eng,
                        spec: facility?.nd_site_profile?.sitename,
                        staffName: isActiveBooking ? currentActiveBooking.profiles?.full_name : "-",
                        startDate: isActiveBooking ? new Date(currentActiveBooking.booking_start).toLocaleTimeString() : "-",
                        duration: isActiveBooking ? getDuration(currentActiveBooking.booking_start, currentActiveBooking.booking_end) : "-",
                        icon: <Server />,
                        bgCustomClass: isActiveBooking
                            ? "bg-blue-100 hover:bg-muted border-gray-300"
                            : "bg-green-100 hover:bg-muted border-gray-300",
                        customClass: isActiveBooking
                            ? "bg-blue-200 text-blue-600 hover:bg-blue-300 font-semibold"
                            : "bg-green-200 text-green-600 hover:bg-green-300 font-semibold",
                    };
                })
            )

            if (isActive) {
                setRawFacilitiesData(processedFacilities);
                setFacilities(processedFacilities)
            }
        }
        preparePcData(spaceData);

        return () => {
            isActive = false;
        };
    }, [spaceData])

    useEffect(() => {
        let isActive = true;

        async function preparePcData(currentFilteredPcsData: Asset[]) {
            if (!currentFilteredPcsData || currentFilteredPcsData.length === 0) {
                setRawPcsData([]);
                setPcs([]);
                return;
            }

            const processedPcs = await Promise.all(
                currentFilteredPcsData.map(async (pc) => {
                    const now = new Date().getTime();
                    const currentBooking = pc.nd_booking?.find(
                        (b) => new Date(b.booking_start).getTime() <= now && new Date(b.booking_end).getTime() >= now && b.is_active
                    );
                    const booking = currentBooking || null;
                    let isBooking = !!booking;
                    let full_name = "-";
                    if (booking?.created_by) {
                        const user = await fetchUserById(booking.created_by);
                        full_name = user.full_name;
                    }
                    
                    return {
                        id: pc.id,
                        status: isBooking ? "in-use" : "Available",
                        type: pc.nd_brand?.nd_brand_type?.name,
                        name: pc.name,
                        spaceName: pc?.nd_space?.eng,
                        spec: pc?.nd_brand.name,
                        staffName: isBooking ? full_name : "-",
                        startDate: isBooking ? new Date(booking.booking_start).toLocaleTimeString() : "-",
                        duration: isBooking ? getDuration(booking.booking_start, booking.booking_end) : "-",
                        icon: <Server />,
                        bgCustomClass: isBooking
                            ? "bg-blue-100 hover:bg-muted border-gray-300"
                            : "bg-green-100 hover:bg-muted border-gray-300",
                        customClass: isBooking
                            ? "bg-blue-200 text-blue-600 hover:bg-blue-300 font-semibold"
                            : "bg-green-200 text-green-600 hover:bg-green-300 font-semibold",
                    };
                })
            );

            if (isActive) {
                setRawPcsData(processedPcs)
                setPcs(processedPcs)
            }

        }
        preparePcData(assetData);

        return () => {
            isActive = false;
        };
    }, [assetData])

    function onPcsFilterChange({ availability, typeTabs, searchQuery, spaceName }: FilterParams) {
        if (rawPcsData.length === 0) return;

        let filtered = [...rawPcsData];

        // Filter by availability
        if (availability && availability !== "all") {
            filtered = filtered.filter((pc) =>
                pc.status?.toLowerCase() === availability.toLowerCase()
            );
        }

        // Filter by type
        if (typeTabs && typeTabs !== "all") {
            filtered = filtered.filter((pc) =>
                pc.type?.toLowerCase() === typeTabs.toLowerCase()
            );
        }

        // Filter by search query
        if (searchQuery?.trim()) {
            filtered = filtered.filter((pc) =>
                pc.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by space
        if (spaceName && spaceName !== "All Spaces") {
            filtered = filtered.filter((pc) =>
                pc.spaceName?.toLowerCase().includes(spaceName.toLowerCase())
            );
        }

        setPcs(filtered);
    }

    // Sama untuk Facilities
    function onSpacesFilterChange({ availability, typeTabs, searchQuery }: FilterParams) {
        if (rawFacilitiesData.length === 0) return;

        let filtered = [...rawFacilitiesData];

        if (availability && availability !== "all") {
            filtered = filtered.filter((facility) =>
                facility.status?.toLowerCase() === availability.toLowerCase()
            );
        }

        if (typeTabs && typeTabs !== "all") {
            filtered = filtered.filter((facility) =>
                facility.type?.toLowerCase() === typeTabs.toLowerCase()
            );
        }

        if (searchQuery?.trim()) {
            filtered = filtered.filter((facility) =>
                facility.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFacilities(filtered);
    }

    function handleFilterChange(filterParams: FilterParams) {
        const hasAssets = assetData && assetData.length > 0;
        const hasFacilities = spaceData && spaceData.length > 0;

        if (hasAssets) {
            onPcsFilterChange(filterParams);
        } else if (hasFacilities) {
            onSpacesFilterChange(filterParams);
        }
    }

    if (allSpacesLoading) {
        return <LoadingSpinner />;
    }

    const allSpaces = [
        ...spaces,
        {
            id: 0,
            eng: "All Spaces"
        }
    ]

    return (
        <>
            <div className="flex justify-between">
                {!!header && (
                    <>
                        <h1 className="text-2xl font-bold">{header}</h1>
                        <div className="flex gap-2">
                            {statusBadges.map(({ name, customClass }) => (
                                <Badge key={name} className={`${customClass}`}>{name}</Badge>
                            ))}
                        </div>
                    </>

                )}
            </div>
            <div>
                {
                    assetData ? (
                        pcs.length === 0 ? (
                            <>
                                <FilterBar
                                    className="flex mt-6 justify-between"
                                    onFilterChange={handleFilterChange}
                                    showDateRange={false}
                                    showRegion={false}
                                    isFacility={false}
                                    showCenterType={false}
                                    showPcBookingFilter={true}
                                    allSpaces={allSpaces}
                                />
                                <NoBookingFound
                                    description="There are no PCs in this site"
                                    icon={<FolderXIcon className="mx-auto mb-2 h-10 w-10 text-gray-500" />}
                                    title="No PC"
                                    className="w-full bg-white rounded-md py-6 border border-gray-300"
                                />
                            </>
                        ) : (
                            <>
                                <FilterBar
                                    className="flex mt-6 justify-between"
                                    onFilterChange={handleFilterChange}
                                    showDateRange={false}
                                    showRegion={false}
                                    isFacility={false}
                                    showCenterType={false}
                                    showPcBookingFilter={true}
                                    allSpaces={allSpaces}
                                />
                                <PaginationCard
                                    items={pcs}
                                    isFacility={false}
                                />
                            </>
                        )
                    ) : spaceData ? (
                        facilities.length === 0 ? (
                            <>
                                <FilterBar
                                    className="flex mt-6 justify-between"
                                    onFilterChange={handleFilterChange}
                                    showDateRange={false}
                                    showRegion={false}
                                    isFacility={true}
                                    showCenterType={false}
                                    showPcBookingFilter={true}
                                />
                                <NoBookingFound
                                    description="There are no Facilities in this site"
                                    icon={<FolderXIcon className="mx-auto mb-2 h-10 w-10 text-gray-500" />}
                                    title="No Facility"
                                    className="w-full bg-white rounded-md py-6 border border-gray-300"
                                />
                            </>
                        ) : (
                            <>
                                <FilterBar
                                    className="flex mt-6 justify-between"
                                    onFilterChange={handleFilterChange}
                                    showDateRange={false}
                                    showRegion={false}
                                    isFacility={true}
                                    showCenterType={false}
                                    showPcBookingFilter={true}
                                />
                                <PaginationCard
                                    items={facilities}
                                    isFacility={true}
                                    setBookingsData={setBookingsData}
                                    isTpSite={isTpSite}
                                    isMember={isMember}
                                    setSelectedFacilitiesData={setSelectedFacilitiesData}
                                />
                            </>

                        )
                    ) : null
                }
            </div>
        </>
    )
}