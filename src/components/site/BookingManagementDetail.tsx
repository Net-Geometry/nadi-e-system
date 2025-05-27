import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookCheck, ChevronLeft, CircleCheckBig, FolderXIcon, MonitorCheck, RotateCcwSquare, Server, UserCheck } from "lucide-react";
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
import { SiteProfile, SiteSpace } from "@/types/site";
import { TpAdminDashBoard } from "./component/TpAdminDashboard";
import { Button } from "../ui/button";
import { NoBookingFound } from "./component/NoBookingFound";
import { useUserName } from "@/hooks/use-user";
import { BulkActionButtons } from "./component/BulkActionButtons";
import { DateRange } from "react-day-picker";
import FacilityUtilization from "./component/FacilityUtilizationChart";
import ChartCard from "../dashboard/ChartCard";
import FacilityUsageTrend from "./component/FacilityUsageTrendChart";
import { bookingClient } from "@/hooks/booking/booking-client";
import { useMemberSiteId, useSiteId, useTpManagerSiteId } from "@/hooks/use-site-id";
import { addDays } from "date-fns";
import { PaginationCard } from "./component/PaginationCard";
import { PaginationTable } from "./component/PaginationTable";

type FilterParams = {
    availability: string,
    typeTabs: string,
    searchQuery?: string
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
    console.log("tp manager org id", tpSiteOrganizationId)

    const isTpAdmin = !!tpAdminOrganizationId;
    const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
    const isTpSite = !!tpSiteOrganizationId;
    const isMember = parsedMetadata?.user_group === 7;

    console.log("is tp site", isTpSite)

    const { siteId: memberSiteId, isLoading: memberSiteIdLoading } = useMemberSiteId(isMember);
    const { siteId: tpManagerSiteId, isLoading: tpManagerSiteIdLoading } = useTpManagerSiteId(isTpSite);
    console.log("Member site ID", memberSiteId)
    console.log("Tp manager site ID", tpManagerSiteId)

    console.log("tp admin org id", tpAdminOrganizationId)

    const {
        useAssetsByTypeQuery,
        useAssetBySite,
        useAllAssets,
        useAssetsInTpsSites
    } = useAssets();
    const {
        useBookingQuery,
        useTpsSites,
        useBookingAssetInTpsSites,
        useAllBookings,
        useAllSpaces,
        useSitesSpaces,
        useAllSpacesBookings,
        usesitesSpacesBookings,
        useBookingSpacesInTpsSites,
        useSpacesBySite
    } = useBookingQueries();

    const { data: tpsSites, isLoading: isTpsSitesLoading } = useTpsSites(tpAdminOrganizationId);
    const tpsSiteIds = tpsSites?.map(tp => tp.id) ?? [];
    console.log("tps sites", tpsSites)

    // Member or TP Site Site ID
    const siteId = memberSiteId ? Number(memberSiteId) : tpManagerSiteId ? Number(tpManagerSiteId) : undefined;

    // All pcs and pcs booking data
    const { data: allPcs, isLoading: isAllPcsLoading } = useAllAssets(isSuperAdmin);
    const { data: sitesPcs, isLoading: isSitesPcsLoading } = useAssetsByTypeQuery(siteId);
    const { data: allBookingPcs, isLoading: isAllBookingPcsLoading } = useAllBookings(isSuperAdmin);
    const { data: pcsBooking, isLoading: isBookingLoading } = useBookingQuery(siteId);
    const { data: tpsSitesPcsBookings, isLoading: isTpsSitesPcsBookingsLoading } = useBookingAssetInTpsSites(tpsSiteIds);

    // All Facilities and facilies data
    const { data: allFacilies, isLoading: isAllFacilitiesLoading } = useAllSpaces(isSuperAdmin);
    const { data: sitesFacilities, isLoading: isSitesFacilities } = useSitesSpaces(siteId);
    const { data: allBookingFacilities, isLoading: isAllBookingFacilitiesLoading } = useAllSpacesBookings(isSuperAdmin);
    const { data: facilitiesBooking, isLoading: isFacilitiesBooking } = usesitesSpacesBookings(siteId);
    const { data: tpsSitesFacilitiesBookings, isLoading: isTpsSitesFacilitiesBookingsLoading } = useBookingSpacesInTpsSites(
        tpsSiteIds
    );

    // All PC in tp admin sites
    const { data: pcsInTpsAdminSites, isLoading: pcsInTpsAdminSitesLoading } = useAssetsInTpsSites(tpAdminOrganizationId);
    console.log("total pc in tp admin site", pcsInTpsAdminSites)

    // State to share to the TP admin dashboard (choosing a site)
    const [selectedSite, setSelectedSite] = useState<SiteProfile | null>();

    const { data: tpsSitePcs, isLoading: isAssetTpsSiteLoading } = useAssetBySite(
        selectedSite?.id
    );

    const { data: tpsSitesFacilities, isLoading: isTpsSitesFacilities } = useSpacesBySite(
        selectedSite?.id
    );

    function handleResetselectedSite() {
        setSelectedSite(null);
    }

    const filterededBookingInTpSite = (tpsSitesPcsBookings?.length ? tpsSitesPcsBookings : tpsSitesFacilitiesBookings)
        ?.filter((pcBooking) => pcBooking?.nd_asset?.site_id === selectedSite?.id)

    // State to share to the pc calendar component (UI update when submitted a form)
    const [pcsBookingsData, setPcsBookingsData] = useState([]);
    const [facilitiesBookingsData, setFacilitiesBookingsData] = useState([]);

    useEffect(() => {
        const sourcePcBooking =
            isSuperAdmin
                ? allBookingPcs
                : isTpAdmin
                    ? filterededBookingInTpSite
                    : pcsBooking;

        const sourceFacilitiesBooking =
            isSuperAdmin
                ? allBookingFacilities
                : isTpAdmin
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
        allBookingFacilities,
        allBookingPcs,
        tpsSitesPcsBookings,
        tpsSitesFacilitiesBookings,
        selectedSite
    ]);


    if (
        isSitesPcsLoading ||
        isAssetTpsSiteLoading ||
        isBookingLoading ||
        isTpsSitesLoading ||
        isTpsSitesPcsBookingsLoading ||
        isAllPcsLoading ||
        isAllBookingPcsLoading ||
        isAllFacilitiesLoading ||
        isSitesFacilities ||
        isAllBookingFacilitiesLoading ||
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
    // Selected PC
    const selectedPcsData =
        isSuperAdmin
            ? allPcs
            : isTpAdmin
                ? tpsSitePcs
                : sitesPcs;

    // Selected Facility
    const selectedFacilitiesData =
        isSuperAdmin
            ? allFacilies
            : isTpAdmin
                ? tpsSitesFacilities
                : sitesFacilities;

    if (
        isTpAdmin &&
        !selectedSite
    ) {
        return (
            <TpAdminDashBoard
                pcsInTpsAdminSite={pcsInTpsAdminSites}
                tpAdminOrgId={tpAdminOrganizationId}
                setSelecTedSite={setSelectedSite}
                tpsSites={tpsSites}
            />
        );
    }

    return (
        <div className="relative">

            <>
                {isTpAdmin && (
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
}

const BookingContent = ({
    pcsData,
    pcsBooking,
    isMember,
    isTpSite,
    isTpAdmin,
    setPcsBookingsData,
    setFacilitiesBookingsData,
    isBookingLoading,
    facilitiesBooking,
    facilitiesData
}: BookingContentProps) => {

    const tabsMenu = ["PC Bookings", "PC Calendar", "Facility Bookings", "Facility Calendar"];

    const tpsSitespcsAvailibility = pcsData?.map((pc) => {
        const currentBooking = pc.nd_booking?.find((b) => {
            const now = new Date();
            return new Date(b.booking_start) <= now && new Date(b.booking_end) >= now;
        });

        const fallbackBooking = pc.nd_booking?.at(-1);

        const booking = currentBooking || fallbackBooking || null;

        return {
            is_using: !!booking?.is_using
        };
    });

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
                    pcInUse: tpsSitespcsAvailibility.filter(pc => pc.is_using).length,
                    pcAvailable: tpsSitespcsAvailibility.filter(pc => !pc.is_using).length
                }}
                pcsData={pcsData}
                isTpAdmin={isTpAdmin}
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
            />
            <FacilityBooking
                value="Facility Bookings"
                facilitiesData={facilitiesData}
            />
            <FacilityCalender
                isMember={isMember}
                isTpSite={isTpSite}
                value="Facility Calendar"
                bookingsData={facilitiesBooking}
                facilitiesData={facilitiesData.map(facility => facility?.nd_space?.eng)}
                isTpAdmin={isTpAdmin}
                setBookingsData={setFacilitiesBookingsData}
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
    isTpAdmin: boolean
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    bookingsData: Booking[],
    isLoading: boolean
}

const PcBookings = ({
    value,
    pcStats,
    pcsData,
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
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
}

export const PcMainContent = ({
    bookingsData,
    setBookingsData,
    pcsData,
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
            bookingAssetTypeName: booking.nd_asset.name,
            startTime: toTwentyFourFormat(new Date(booking.booking_start)),
            endTime: toTwentyFourFormat(new Date(booking.booking_end)),
            duration: getDuration(booking.booking_start, booking.booking_end),
            ...booking
        }
    }).filter((booking) => booking.is_using === true)

    return (
        <section className="mt-6 flex flex-col" id="pc status">
            {isTpAdmin && <BulkActionButtons />}
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
}

export const PcCalender = ({
    value,
    pcsData,
    isMember,
    isTpSite,
    bookingsData,
    isTpAdmin,
    setBookingsData,
    isLoading
}: PcCalenderProps) => {
    const [bookingCalendarData, setBookingCalendarData] = useState<Booking[]>([]);
    const [rawBookingCalendarData, setRawBookingCalendarData] = useState([]);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 5),
    })

    useEffect(() => {
        function filterByDateRange(bookingData: Booking[], range: DateRange): Booking[] {
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
        date: DateRange,
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
            />
        </TabsContent>
    )
}

interface FacilityBookingProps {
    value: string,
    facilitiesData: SiteSpace[]
}

const FacilityBooking = ({
    value,
    facilitiesData
}: FacilityBookingProps) => {
    return (
        <TabsContent className="w-full mt-6 space-y-6" value={value}>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Facilities Charts</h1>
                <div className="w-full grid grid-cols-2 gap-6">
                    <ChartCard title="Facility Utilization" badge={<Badge className="bg-white border border-gray-300 text-black">Last 30 Days</Badge>}>
                        <FacilityUtilization />
                    </ChartCard>
                    <ChartCard title="Facility Utilization" badge={<Badge className="bg-white border border-gray-300 text-black">Current Week</Badge>}>
                        <FacilityUsageTrend />
                    </ChartCard>
                </div>
            </div>
            <AssetStatus
                spaceData={facilitiesData}
                header="Facility Status"
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
}

const FacilityCalender = ({
    value,
    isMember,
    isTpSite,
    facilitiesData,
    isTpAdmin,
    bookingsData,
    setBookingsData
}: FacilityCalendarProps) => {
    const statsItems = [
        {
            title: "Total Check-ins",
            value: String(23),
            icon: UserCheck,
            description: "",
            iconBgColor: "bg-gray-200",
            iconTextColor: "text-black",
        },
        {
            title: "Computer Lab",
            value: String(12),
            icon: MonitorCheck,
            description: "",
            iconBgColor: "bg-blue-100",
            iconTextColor: "text-blue-500",
        }, {
            title: "Study Room",
            value: String(9),
            icon: BookCheck,
            description: "",
            iconBgColor: "bg-green-100",
            iconTextColor: "text-green-500",
        },
    ];

    const [bookingCalendarData, setBookingCalendarData] = useState<Booking[]>([]);
    const [rawBookingCalendarData, setRawBookingCalendarData] = useState([]);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 5),
    })

    useEffect(() => {
        function filterByDateRange(bookingData: Booking[], range: DateRange): Booking[] {
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
        date: DateRange,
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
        <TabsContent className="w-full mt-6 space-y-6" value={value}>
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {
                    statsItems.map((item) => (
                        <StatsCard key={item.title} {...item} />
                    ))
                }
            </section>
            <BookingCalendar
                assetTypeNames={[
                    "All Facilities",
                    ...facilitiesData
                ]}
                isMember={isMember}
                isTpSite={isTpSite}
                date={date}
                setDate={setDate}
                header="Booking Records"
                isFacility={true}
                bookingType="facilities"
                bookingData={bookingCalendarData}
                setBookingCalendarData={setBookingCalendarData}
                setBookingsData={setBookingsData}
                isTpAdmin={isTpAdmin}
                onChangeFilter={onChangeFilter}
            />
        </TabsContent>
    )
}

interface AssetStatusProps {
    assetData?: Asset[]
    spaceData?: SiteSpace[]
    isLoading?: boolean
    header: string
}

const AssetStatus = ({
    assetData,
    spaceData,
    isLoading,
    header
}: AssetStatusProps) => {

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

    const { fetchUserById } = useUserName();
    const [rawPcsData, setRawPcsData] = useState([]);
    const [pcs, setPcs] = useState([]);

    const [rawFacilitiesData, setRawFacilitiesData] = useState([]);
    const [facilities, setFacilities] = useState([]);

    useEffect(() => {
        let isActive = true;

        async function preparePcData(currentFilteredFacilitiesData: SiteSpace[]) {

            if (!currentFilteredFacilitiesData || currentFilteredFacilitiesData.length === 0) {
                setRawFacilitiesData([]);
                setFacilities([]);
                return;
            }

            const processedFacilities = await Promise.all(
                currentFilteredFacilitiesData.map(async (facility) => {
                    const booking: Booking = await bookingClient.getBookingBySiteSpaceId(facility?.id);

                    return {
                        id: facility.id,
                        status: !booking ? "Available" : "in-use",
                        type: facility.nd_space?.eng,
                        name: facility.nd_space?.eng,
                        spec: facility?.nd_site_profile?.sitename,
                        staffName: booking ? booking.requester_id : "-",
                        startDate: booking ? new Date(booking.booking_start).toLocaleTimeString() : "-",
                        duration: booking ? getDuration(booking.booking_start, booking.booking_end) : "-",
                        icon: <Server />,
                        bgCustomClass: !booking
                            ? "bg-green-100 hover:bg-muted border-gray-300"
                            : "bg-blue-100 hover:bg-muted border-gray-300",
                        customClass: !booking
                            ? "bg-green-200 text-green-600 hover:bg-green-300 font-semibold"
                            : "bg-blue-200 text-blue-600 hover:bg-blue-300 font-semibold",
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
                    const now = new Date();
                    const currentBooking = pc.nd_booking?.find(
                        (b) => new Date(b.booking_start) <= now && new Date(b.booking_end) >= now
                    );
                    const fallbackBooking = pc.nd_booking?.at(-1);
                    const booking = currentBooking || fallbackBooking || null;

                    let full_name = "-";
                    if (booking?.created_by) {
                        const user = await fetchUserById(booking.created_by);
                        full_name = user.full_name;
                    }

                    const isBooking = !!booking;

                    return {
                        id: pc.id,
                        status: booking?.is_using ? "in-use" : "Available",
                        type: pc.nd_brand?.brand_type,
                        name: pc.name,
                        spec: pc?.nd_brand.name,
                        staffName: isBooking ? full_name : "-",
                        startDate: isBooking ? new Date(booking.booking_start).toLocaleTimeString() : "-",
                        duration: isBooking ? getDuration(booking.booking_start, booking.booking_end) : "-",
                        icon: <Server />,
                        bgCustomClass: !isBooking
                            ? "bg-green-100 hover:bg-muted border-gray-300"
                            : "bg-blue-100 hover:bg-muted border-gray-300",
                        customClass: !isBooking
                            ? "bg-green-200 text-green-600 hover:bg-green-300 font-semibold"
                            : "bg-blue-200 text-blue-600 hover:bg-blue-300 font-semibold",
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

    function onPcsFilterChange({ availability, typeTabs, searchQuery }: FilterParams) {
        if (rawPcsData.length === 0) return;

        let filtered = [...rawPcsData];

        if (availability !== "all") {
            filtered = filtered.filter((pc) => pc.status === availability);
        }

        if (typeTabs !== "all") {
            filtered = filtered.filter((pc) => pc.type === typeTabs);
        }

        if (searchQuery) {
            filtered = filtered.filter((pc) => pc.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        setPcs(filtered);
    }


    function onSpacesFilterChange({ availability, typeTabs, searchQuery }: FilterParams) {
        if (rawFacilitiesData.length === 0) return;

        let filtered = [...rawFacilitiesData];

        if (availability !== "all") {
            filtered = filtered.filter((pc) => pc.status === availability);
        }

        if (typeTabs !== "all") {
            filtered = filtered.filter((pc) => pc.type === typeTabs);
        }

        if (searchQuery) {
            filtered = filtered.filter((pc) => pc.name.toLowerCase().includes(searchQuery.toLowerCase()));
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

    return (
        <>
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">{header}</h1>
                <div className="flex gap-2">
                    {statusBadges.map(({ name, customClass }) => (
                        <Badge key={name} className={`${customClass}`}>{name}</Badge>
                    ))}
                </div>
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
                                />
                            </>

                        )
                    ) : null
                }
            </div>
        </>
    )
}