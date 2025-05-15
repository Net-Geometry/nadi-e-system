import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CircleCheckBig, RotateCcwSquare, Server } from "lucide-react";
import { StatsCard } from "../dashboard/StatsCard";
import FilterBar from "./component/FilterBar";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { useAssets } from "@/hooks/use-assets";
import { BookingListsTable } from "./component/BookingListTable";
import { BookingCalendar } from "./component/BookingCalendar";
import { useBookingQueries } from "@/hooks/booking/use-booking-queries";
import { Booking } from "@/types/booking";
import { toTwentyFourFormat } from "./utils/dateTimeConverter";
import { getDuration } from "./utils/duration";
import { Asset } from "@/types/asset";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { EmptyCard } from "./component/EmptyCard";
import BookingAssetCard from "./component/BookingAssetCard";
import { CircleDot } from "lucide-react";
import { Site } from "@/types/site";
import { TpAdminDashBoard } from "./component/TpAdminDashboard";
import { Button } from "../ui/button";

type FilterParams = {
    pcAvailability: string,
    pcTypeTabs: string,
    searchQuery?: string
};

const tabsMenu = ["PC Bookings", "PC Calendar", "Facility Bookings", "Facility Calendar"];

export const BookingManagementDetail = () => {
    // Set UI content based on role access modifier
    const userMetadata = useUserMetadata();
    const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
    const organizationId =
        parsedMetadata?.user_type !== "super_admin" &&
            parsedMetadata?.user_group_name === "TP" &&
            !!parsedMetadata?.organization_name &&
            parsedMetadata?.organization_id
            ? parsedMetadata.organization_id
            : null;

    const tpSiteOrganizationId =
        parsedMetadata?.user_type !== "super_admin" &&
            parsedMetadata?.user_group_name === "Site" &&
            !!parsedMetadata?.organization_name &&
            parsedMetadata?.user_group_name === "Site" &&
            parsedMetadata?.organization_id
            ? parsedMetadata.organization_id
            : null;

    const isTpAdminAndTpOrganization = !!organizationId;
    const isTpSite = !!tpSiteOrganizationId;

    console.log(`Setting visibility UI for ${isTpSite ? "TP site" : "TP admin"}`);

    const { useAssetsByTypeQuery, useAssetsInTpsSites } = useAssets();
    const { useBookingQuery, useTpsSites, useBookingAssetInTpsSites } = useBookingQueries();

    const { data: tpsSites, isLoading: isTpsSitesLoading } = useTpsSites(tpSiteOrganizationId ?? organizationId);
    const tpsSiteIds = tpsSites?.map(tp => tp.id) ?? [];
    console.log("tps sites", tpsSites)

    const pcIdAsset = 1;

    const { data: memberSitePcs, isLoading: isMemberSitePcsLoading } = useAssetsByTypeQuery(pcIdAsset);

    const { data: tpsSitesPcs, isLoading: isAssetTpsSitesLoading } = useAssetsInTpsSites(
        tpsSiteIds,
        pcIdAsset
    );

    const { data: pcsBooking, isLoading: isBookingLoading } = useBookingQuery(pcIdAsset);

    const { data: tpsSitesPcsBookings, isLoading: isTpsSitesPcsBookingsLoading } = useBookingAssetInTpsSites(
        tpsSiteIds,
        pcIdAsset
    );

    const [bookingsData, setBookingsData] = useState([]);

    useEffect(() => {
        const sourcePcBooking =
            (isTpAdminAndTpOrganization || isTpSite)
                ? tpsSitesPcsBookings
                : pcsBooking;

        if (sourcePcBooking) {
            setBookingsData(sourcePcBooking);
        }
    }, [pcsBooking, tpsSitesPcsBookings, isTpAdminAndTpOrganization, isTpSite]);

    const [selectedSite, setSelectedSite] = useState<Site | null>();
    console.log("selected site", selectedSite)

    if (
        isMemberSitePcsLoading ||
        isAssetTpsSitesLoading ||
        isBookingLoading ||
        isTpsSitesLoading ||
        isTpsSitesPcsBookingsLoading ||
        !parsedMetadata
        // (!organizationId && !tpSiteOrganizationId)
    ) {
        return <LoadingSpinner />;
    }

    function handleResetselectedSite () {
        setSelectedSite(null);
    }

    return (
        <>
            {(isTpAdminAndTpOrganization && selectedSite === null) ? (
                <TpAdminDashBoard
                    selectedSite={selectedSite}
                    setSelecTedSite={setSelectedSite}
                    tpsSites={tpsSites}
                />
            ) : (
                <>
                    { isTpAdminAndTpOrganization && (
                        <Button onClick={handleResetselectedSite}>Choose other Site</Button>
                    )}
                    <BookingHeader />
                    <BookingContent
                        bookingsData={bookingsData}
                        isTpAdminAndTpOrganization={isTpAdminAndTpOrganization}
                        isTpSite={isTpSite}
                        memberSitePcs={memberSitePcs}
                        pcsBooking={pcsBooking}
                        setBookingsData={setBookingsData}
                        tpsSitesPcs={tpsSitesPcs}
                        tpsSitesPcsBookings={tpsSitesPcsBookings}
                        isBookingLoading={isBookingLoading}
                    />
                </>
            )}
        </>
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
    isTpAdminAndTpOrganization: boolean
    isTpSite: boolean
    tpsSitesPcs: Asset[]
    memberSitePcs: Asset[]
    tpsSitesPcsBookings: Booking[]
    pcsBooking: Booking[]
    bookingsData: Booking[]
    isBookingLoading: boolean
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
}

const BookingContent = ({
    isTpAdminAndTpOrganization,
    isTpSite,
    memberSitePcs,
    pcsBooking,
    bookingsData,
    setBookingsData,
    tpsSitesPcs,
    tpsSitesPcsBookings,
    isBookingLoading
}: BookingContentProps) => {


    const tpsSitespcsAvailibility = tpsSitesPcs?.map((pc) => {
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
                {
                    tabsMenu.map((menu) => (
                        <TabsTrigger className="text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap" key={menu} value={menu}>{menu}</TabsTrigger>
                    ))
                }
            </TabsList>
            <PcBookings
                value="PC Bookings"
                pcStats={{
                    totalPcs: isTpAdminAndTpOrganization || isTpSite ? tpsSitesPcs.length : memberSitePcs.length,
                    pcInUse: isTpAdminAndTpOrganization || isTpSite ? tpsSitespcsAvailibility.filter(pc => pc.is_using).length : memberSitePcs.filter(pc => pc.is_active).length,
                    pcAvailable: isTpAdminAndTpOrganization || isTpSite ? tpsSitespcsAvailibility.filter(pc => !pc.is_using).length : memberSitePcs.filter(pc => !pc.is_active).length
                }}
                pcsData={isTpAdminAndTpOrganization || isTpSite ? tpsSitesPcs : memberSitePcs}
                bookingsData={bookingsData}
                setBookingsData={setBookingsData}
                isLoading={isBookingLoading}
            />
            <PcCalender
                value="PC Calendar"
                pcsData={isTpAdminAndTpOrganization || isTpSite ? tpsSitesPcs.map((pc) => pc.name) : memberSitePcs.map((pc) => pc.name)}
                bookingsData={isTpAdminAndTpOrganization || isTpSite && !!tpsSitesPcsBookings ? tpsSitesPcsBookings : pcsBooking}
                setBookingsData={setBookingsData}
                isLoading={isBookingLoading}
            />
            <FacilityBooking
                value="Facility Bookings"
            />
            <FacilityCalender
                value="Facility Calendar"
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
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    bookingsData: Booking[],
    isLoading: boolean
}

const PcBookings = ({
    value,
    pcStats,
    pcsData,
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
            iconBgColor: "bg-red-100",
            iconTextColor: "text-red-500",
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
            />
        </TabsContent>
    )
}

interface PcMainContentProps {
    bookingsData: Booking[]
    pcsData: Asset[]
    isLoading: boolean
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
}

export const PcMainContent = ({
    bookingsData,
    setBookingsData,
    pcsData,
    isLoading
}: PcMainContentProps) => {
    const headTable = ["User", "PC", "Start Time", "End Time", "Duration"];

    const recentBookings = bookingsData.map((booking) => {
        return {
            userName: booking.profiles.full_name,
            bookingAssetTypeName: booking.nd_asset.name,
            startTime: toTwentyFourFormat(new Date(booking.booking_start)),
            endTime: toTwentyFourFormat(new Date(booking.booking_end)),
            duration: getDuration(booking.booking_start, booking.booking_end),
            ...booking
        }
    }).filter((booking) => booking.is_using === true)

    return (
        <section className="mt-6 flex flex-col" id="pc status">
            <PcStatus
                pcsData={pcsData}
                isLoading={isLoading}
            />
            <BookingListsTable
                headTable={headTable}
                bodyTableData={recentBookings}
            />
        </section>
    )
}

interface PcCalenderProps {
    value: string,
    pcsData: string[],
    bookingsData: Booking[],
    isLoading: boolean,
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>
}

export const PcCalender = ({
    value,
    pcsData,
    bookingsData,
    setBookingsData,
    isLoading
}: PcCalenderProps) => {

    const [bookingCalendarData, setBookingCalendarData] = useState([]);

    const onChangeFilter = (date: Date, assetTypeName: string) => {
        let filteredBooking = bookingsData.filter((booking) => new Date(booking.created_at).getDay() === date.getDay())

        if (assetTypeName !== "all pc") {
            filteredBooking = filteredBooking.filter((booking) => booking.nd_asset.name.toLowerCase() === assetTypeName.toLowerCase())
        }

        setBookingCalendarData(filteredBooking)
    }

    return (
        <TabsContent className="w-full" value={value}>
            <BookingCalendar
                assetTypeNames={[
                    "all pc",
                    ...pcsData
                ]}
                bookingType="pc"
                bookingData={bookingCalendarData}
                setBookingCalendarData={setBookingCalendarData}
                isLoading={isLoading}
                setBookingsData={setBookingsData}
                onChangeFilter={onChangeFilter}
            />
        </TabsContent>
    )
}

const FacilityBooking = ({ value }) => {
    return (
        <TabsContent value={value}>
            {/* just for an example content */}
            <h1>{`${value} content`}</h1>
        </TabsContent>
    )
}

const FacilityCalender = ({ value }) => {
    return (
        <TabsContent value={value}>
            {/* just for an example content */}
            <h1>{`${value} content`}</h1>
        </TabsContent>
    )
}

interface PcStatusProps {
    pcsData: Asset[]
    isLoading: boolean
}

const PcStatus = ({
    pcsData,
    isLoading
}: PcStatusProps) => {

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

    const pcsAvailibility = pcsData?.map((pc) => {
        const currentBooking = pc.nd_booking?.find((b) => {
            const now = new Date();
            return new Date(b.booking_start) <= now && new Date(b.booking_end) >= now;
        });

        const fallbackBooking = pc.nd_booking?.at(-1);

        const booking = currentBooking || fallbackBooking || null;

        const isBooking = !!booking;
        const startDate = (start: string) => {
            if (isBooking && start) {
                return new Date(booking.booking_start).toLocaleTimeString();
            } else {
                return "-"
            }
        }

        return {
            status: booking?.is_using ? "in-use" : "Available",
            type: pc.nd_brand?.brand_type,
            name: pc.name,
            spec: pc.nd_brand?.name,
            staffName: isBooking ? booking.created_by : "-",
            startDate: startDate(booking?.booking_start),
            duration: isBooking && getDuration(booking?.booking_start, booking?.booking_end),
            icon: <Server />,
            bgCustomClass: !isBooking
                ? "bg-green-100 hover:bg-muted border-gray-300"
                : "bg-blue-100 hover:bg-muted border-gray-300",
            customClass: !isBooking
                ? "bg-green-200 text-green-600 hover:bg-green-300 font-semibold"
                : "bg-blue-200 text-blue-600 hover:bg-blue-300 font-semibold",
        };
    });

    const [pcs, setPcs] = useState([]);

    function onFilterChange({ pcAvailability, pcTypeTabs, searchQuery }: FilterParams) {
        let filtered = pcsAvailibility;

        if (pcAvailability !== "all") {
            filtered = filtered.filter((pc) => pc.status === pcAvailability);
        }

        if (pcTypeTabs !== "all") {
            filtered = filtered.filter((pc) => pc.type === pcTypeTabs);
        }

        if (!!searchQuery) {
            filtered = filtered.filter((pc) => pc.name.includes(searchQuery));
        }

        setPcs(filtered);
    }

    useEffect(() => {
        onFilterChange({ pcAvailability: "all", pcTypeTabs: "all" })
    }, [])


    return (
        <>
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">PC Status</h1>
                <div className="flex gap-2">
                    {statusBadges.map(({ name, customClass }) => (
                        <Badge key={name} className={`${customClass}`}>{name}</Badge>
                    ))}
                </div>
            </div>
            <div>
                <FilterBar className="flex mt-6 justify-between" onFilterChange={onFilterChange} showDateRange={false} showRegion={false} showCenterType={false} showPcBookingFilter={true} />
                {
                    pcs.length === 0 ? (
                        <EmptyCard message="There are no PC in your sites" className="mt-6 py-40" />
                    ) : (
                        <div className="grid grid-cols-4 gap-5 mt-4">
                            {
                                pcs.map((pc, i) => (
                                    <BookingAssetCard
                                        assetSpec={pc.spec}
                                        assetType={pc.type}
                                        requesterName={pc.staffName}
                                        AssetName={pc.name}
                                        icon={pc.icon}
                                        label={(<Badge className={`${pc.customClass} mt-0 flex items-center gap-1`}>
                                            <CircleDot className="size-3" />
                                            {pc.status}
                                        </Badge>)}
                                        started={pc.startDate}
                                        duration={pc.duration}
                                        className={`hover:scale-105 hover:shadow-sm hover:shadow-blue-300 ${pc.bgCustomClass}`}
                                    />
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </>
    )
}