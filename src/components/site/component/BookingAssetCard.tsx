import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bell, Building, CalendarIcon, CircleDot, Clock, FolderX, LockIcon, Pen, Plus, PowerOff, RefreshCcw, Server, SquarePen, Unlock, User } from "lucide-react";
import { BulkActionButtons } from "./BulkActionButtons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { NoBookingFound } from "./NoBookingFound";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import RemotePcStream from "./RemotePcStream";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormField, Form } from "@/components/ui/form";
import { useBookingMutation } from "@/hooks/booking/use-booking-mutation";
import { MaintenanceRequest, MaintenanceStatus } from "@/types/maintenance";
import { useUserId } from "@/hooks/use-user";
import { useBookingQueries } from "@/hooks/booking/use-booking-queries";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useMemberSiteId, useTpManagerSiteId } from "@/hooks/use-site-id";
import { bookingClient } from "@/hooks/booking/booking-client";
import { stringToDateWithTime } from "../utils/stringToDateWithTime";
import { Booking } from "@/types/booking";
import { SiteSpace } from "@/types/site";

interface BookingAssetCardProps {
    id: string;
    assetName: string;
    assetType: string;
    assetSpec: string;
    started?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    requesterName: string;
    spaceName?: string;
    label?: React.ReactNode
    duration?: string;
    status?: string;
    isFacility?: boolean;
    children?: React.ReactNode;
    isMember?: boolean;
    isTpSite?: boolean;
    setBookingsData?: React.Dispatch<React.SetStateAction<Booking[]>>;
    setSelectedFacilitiesData?: React.Dispatch<React.SetStateAction<SiteSpace[]>>;
}

export const BookingAssetCard = ({
    assetType,
    assetSpec,
    started,
    assetName,
    status,
    id,
    isFacility,
    requesterName,
    spaceName,
    duration,
    label,
    icon,
    className,
    children,
    isMember,
    isTpSite,
    setBookingsData,
    setSelectedFacilitiesData
}: BookingAssetCardProps) => {
    const [isOpenMaintenanceForm, setIsOpenMaintenanceForm] = useState(false);
    const [isOpenDialog, setIsOpenDialog] = useState(false);

    const { siteId: memberSiteId, isLoading: memberSiteIdLoading } = useMemberSiteId(isMember);
    const { siteId: tpManagerSiteId, isLoading: tpManagerSiteIdLoading } = useTpManagerSiteId(isTpSite);

    // Member or TP Site Site ID
    const siteId =
        memberSiteId
            ? Number(memberSiteId)
            : tpManagerSiteId
                ? Number(tpManagerSiteId)
                : undefined;

    const { useBookingPcMutation } = useBookingMutation();
    const bookingPcMutation = useBookingPcMutation(!!siteId);

    if (memberSiteIdLoading || tpManagerSiteIdLoading) {
        return <LoadingSpinner />
    }


    const onSubmitFacilityBooking = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        try {

            const { id: spaceId } = await bookingClient.getSpaceByName(assetName, siteId);
            const { data: { user: { id: userId } } } = await supabase.auth.getUser();
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
            const bookingId = crypto.randomUUID();

            const submitedFormData: Booking = {
                site_space_id: spaceId,
                booking_start: startTime.toISOString(),
                booking_end: endTime.toISOString(),
                created_by: userId,
                requester_id: userId,
                id: bookingId,
                created_at: new Date().toISOString(),
                is_active: true,
                site_id: siteId
            }

            const newBookingData = await bookingPcMutation.mutateAsync(submitedFormData);

            setBookingsData((prevBook) => [
                ...prevBook,
                newBookingData
            ])

            setSelectedFacilitiesData((prevFacility) => prevFacility.map((fa) => {
                if (fa.nd_space.eng === assetName) {
                    return {
                        ...fa,
                        nd_booking: [
                            ...fa.nd_booking,
                            newBookingData
                        ]
                    }
                }
            }))

            toast({
                title: "Add new booking success",
                description: `Success request new ${isFacility ? "Facility" : "PC"}: ${assetName}`
            });
        } catch (error) {
            console.log(error);
            toast({
                title: "Add new booking failed",
                description: "Something went wrong when submitting the new booking",
                variant: "destructive"
            });
        }
    }

    return (
        <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
            <DialogTrigger asChild>
                <Card onClick={() => setIsOpenDialog(true)} className={cn("h-full scale-100 transition-transform duration-200 ease-in-out", className)}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className='flex items-center justify-center gap-3'>
                            {icon && <div className="h-4 flex justify-center items-center w-4 text-muted-foreground">{icon}</div>}
                            <CardTitle className="text-lg font-medium truncate">{assetType}</CardTitle>
                        </div>
                        {(label)}
                    </CardHeader>
                    <CardContent className='flex flex-col justify-center items-center gap-1'>
                        <div className="text-xl font-light">{assetName}</div>
                        {assetSpec && (
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                {assetSpec}
                            </CardDescription>
                        )}
                        {spaceName && (
                            <CardDescription className='font-normal text-sms text-muted-foreground'>
                                {spaceName.toUpperCase()}
                            </CardDescription>
                        )}
                        {children}
                        {(requesterName && status === "in-use") && (
                            <CardDescription className='font-semibold text-base mt-2 text-black'>
                                {requesterName}
                            </CardDescription>
                        )}
                    </CardContent>
                    {(isFacility && (isMember || isTpSite)) && (
                        <div className="grid grid-cols-2 gap-1.5 px-6 pb-4">
                            {status === "Available" && (
                                <Button onClick={onSubmitFacilityBooking}><Plus className="size-3" />Reserve Now</Button>
                            )}
                            <Button onClick={(e) => {
                                e.stopPropagation();
                                setIsOpenDialog(true);
                                setIsOpenMaintenanceForm(true);
                            }} className="bg-red-500 hover:bg-red-600s border border-muted"><Pen /> Report Issue</Button>
                        </div>
                    )}
                    {(started !== "-" && duration !== "-" && status === "in-use") && (
                        <CardFooter className="pt-1 flex justify-center items-center text-[10px] font-light text-gray-500">{`Started: ${started} | Duration: ${duration}`}</CardFooter>
                    )}
                </Card>
            </DialogTrigger>
            {!isFacility ? (
                <BookingPcCardDetails
                    id={id}
                    name={assetName}
                    status={status}
                    duration={duration}
                />
            ) : (
                <BookingFacilityCardDetails
                    open={isOpenMaintenanceForm}
                    setOpen={setIsOpenMaintenanceForm}
                    name={assetName}
                    status={status}
                    id={id}
                    assetType={assetType}
                    requesterName={requesterName}
                    duration={duration}
                    started={started}
                />
            )}
        </Dialog>
    );
};

interface BookingPcCardDetailsProps {
    name: string,
    id: string,
    status: string,
    duration: string
}

const BookingPcCardDetails = ({
    name,
    status,
    id,
    duration,
}: BookingPcCardDetailsProps) => {
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);
    const [message, setMessage] = useState<string>("");
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!channelRef.current) {
            channelRef.current = supabase.channel(`remote-${name}`, {
                config: {
                    broadcast: {
                        self: true
                    }
                }
            });

            channelRef.current.on("broadcast", { event: "answer" }, (msg) => {
                console.log("Received message from channel:", msg);
            });

            channelRef.current.subscribe((status) => {
                console.log(`Channel status: ${status}`);
                if (status === 'SUBSCRIBED') {
                    setChannel(channelRef.current);
                }
            });
        }

        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                channelRef.current = null;
                setChannel(null);
            }
        };
    }, [name]);

    async function handleShutDown() {
        await channel.send({
            type: "broadcast",
            event: "answer",
            payload: { command: "shutdown" }
        })
        toast({
            description: `${name} shutdown`
        })
    }

    async function handleLock() {
        await channel.send({
            type: "broadcast",
            event: "answer",
            payload: { command: "lock" }
        })
        toast({
            description: `${name} lock`
        })
    }

    async function handleUnlock() {
        await channel.send({
            type: "broadcast",
            event: "answer",
            payload: { command: "unlock" }
        })
        toast({
            description: `${name} unlock`
        })
    }

    async function handleRestart() {
        await channel.send({
            type: "broadcast",
            event: "answer",
            payload: { command: "restart" }
        })
        toast({
            description: `${name} restart`
        })
    }

    const aboutPc = [
        {
            title: "Time Remaining",
            description: duration === "-" ? "Not In Use" : duration
        },
        {
            title: "Status",
            description: status
        },
        {
            title: "Application History",
            description: "No Application History"
        },
        {
            title: "Network History",
            description: "No Network History"
        },
    ];
    const pcActionButtons = [
        {
            name: "Power Off",
            icon: <PowerOff />,
            value: "Power Off PC",
            customClass: "bg-red-500 hover:bg-red-400",
            action: handleShutDown
        },
        {
            name: "Restart PC",
            icon: <RefreshCcw />,
            value: "Restart PC",
            customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200",
            action: handleRestart
        },
        {
            name: "Lock PC",
            icon: <LockIcon />,
            value: "Lock PC",
            customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200",
            action: handleLock
        },
        {
            name: "Unlock PC",
            icon: <Unlock />,
            value: "Unlock PC",
            customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200",
            action: handleUnlock
        },
    ]

    return (
        <DialogContent className="overflow-x-auto max-w-5xl h-screen max-h-screen overflow-y-auto flex flex-col gap-0 p-4">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold justify-start">
                    <Server />
                    {name}
                </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full grid place-items-center mt-7">
                <TabsList className="w-full bg-white inline-flex h-11 flex-wrap justify-between gap-2 items-center">
                    <TabsTrigger
                        className="flex-grow text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                        key="details"
                        value="details">Details</TabsTrigger>
                    <TabsTrigger
                        className="flex-grow text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                        key="remote-pc"
                        value="remote-pc">Remote PC</TabsTrigger>
                </TabsList>
                <DetailsPc
                    aboutPc={aboutPc}
                    pcActionButtons={pcActionButtons}
                    value="details"
                />
                <RemotePc
                    value="remote-pc"
                />
            </Tabs>
        </DialogContent>
    )
}

interface DetailsPcProps {
    value: string,
    pcActionButtons: {
        name: string,
        icon: React.ReactNode,
        value: string,
        customClass?: string,
        action?: () => void
    }[],
    aboutPc: {
        title: string,
        description: string
    }[]
}

const DetailsPc = ({
    value,
    pcActionButtons,
    aboutPc
}: DetailsPcProps) => {
    return (
        <TabsContent className="w-full space-y-8" value={value}>
            <BulkActionButtons
                buttonsData={pcActionButtons}
                className="flex items-center justify-center mt-3"
                classNameForHeader="font-semibold text-base"
                useHeader={true}
            />
            <div className="grid grid-cols-2 gap-3">
                {aboutPc.map((pc) => (
                    <div className="w-full flex flex-col items-start">
                        <h5 className="font-semibold text-base">{pc.title}:</h5>
                        <Card className={`${pc.description === "in-use" ? "bg-blue-50" : pc.description === "Available" ? "bg-green-50" : ""} w-full min-h-36 flex items-center justify-center px-4 py-3`}>
                            <small className="text-gray-600">{pc.description}</small>
                        </Card>
                    </div>
                ))}
            </div>
        </TabsContent>
    )
}

const RemotePc = ({ value }) => {
    return (
        <TabsContent className="w-full" value={value}>
            <RemotePcStream />
        </TabsContent>
    )
}

interface BookingFacilityCardDetailsProps {
    name: string,
    status: string,
    id: string,
    assetType?: string,
    requesterName?: string,
    duration?: string,
    started?: React.ReactNode,
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const BookingFacilityCardDetails = ({
    name,
    status,
    id,
    assetType,
    requesterName,
    duration,
    started,
    open,
    setOpen
}: BookingFacilityCardDetailsProps) => {
    const [nextMaintenance, setNextMaintenance] = useState<string | null>(null);
    const [lastMaintenance, setLastMaintenance] = useState<string | null>(null);

    return (
        <DialogContent className="max-w-5xl h-screen max-h-screen overflow-y-auto flex flex-col gap-0 p-4">
            <header className="space-y-3">
                <h1 className="w-full flex items-center gap-3 justify-start text-2xl font-bold">
                    <Building />
                    {name}
                </h1>
                <p className="text-gray-500">Control Panel and Facility Information</p>
            </header>
            <Tabs defaultValue={open ? "Maintenance" : "Details"} className="w-full grid place-items-center mt-7">
                <TabsList className="w-full bg-white inline-flex h-11 flex-wrap justify-between gap-2 items-center">
                    <TabsTrigger
                        className="flex-grow text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                        key="Details"
                        value="Details">Details</TabsTrigger>
                    <TabsTrigger
                        className="flex-grow text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                        key="Maintenance"
                        value="Maintenance">Maintenance</TabsTrigger>
                    <TabsTrigger
                        className="flex-grow text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                        key="Settings"
                        value="Settings">Settings</TabsTrigger>
                </TabsList>
                <DetailsFacility
                    status={status}
                    value="Details"
                    id={id}
                    type={assetType}
                    requesterName={requesterName}
                    duration={duration}
                    started={started}
                    nextMaintenance={nextMaintenance}
                    lastMaintenance={lastMaintenance}
                />
                <Maintenance
                    value="Maintenance"
                    id={id}
                    open={open}
                    setOpen={setOpen}
                    setNextMaintenance={setNextMaintenance}
                    setLastMaintenance={setLastMaintenance}
                    nextMaintenance={nextMaintenance}
                />
                <Settings
                    value="Settings"
                />
            </Tabs>
        </DialogContent>
    )
}

interface DetailsFacilityProps {
    value: string
    status: string
    id: string
    type: string
    requesterName?: string
    duration?: string
    started?: React.ReactNode
    nextMaintenance: string;
    lastMaintenance: string;
}

const DetailsFacility = ({
    value,
    status,
    id,
    type,
    requesterName,
    duration,
    started,
    lastMaintenance,
    nextMaintenance
}: DetailsFacilityProps) => {

    return (
        <TabsContent className="w-full flex items-start gap-4" value={value}>
            <section className="py-5 space-y-4 w-[40%]">
                <div className="space-y-2">
                    <h1 className="font-medium">Status</h1>
                    <Card className={`${status === 'Available' ? 'bg-green-50' : status === 'in-use' ? 'bg-blue-50' : 'bg-red-50'} px-4 py-3 space-y-2`}>
                        {status === "Available" ? (
                            <h2 className="flex items-center gap-2">
                                <CircleDot className="size-4" />
                                {status}
                            </h2>
                        ) : (
                            <>
                                <h2 className="flex items-center gap-2">
                                    <CircleDot className="size-4" />
                                    {status}
                                </h2>
                                <h3 className="font-semibold">{requesterName}</h3>
                                <p className="text-sm text-gray-500">Time: {started} | Duration: {duration}</p>
                            </>
                        )}
                    </Card>
                </div>
                <div className="space-y-2">
                    <h1 className="font-medium">Today's Statistics</h1>
                    <Card className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <p>Total Bookings: </p>
                            <p>-</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p>Utilization: </p>
                            <p>-</p>
                        </div>
                    </Card>
                </div>
            </section>
            <section className="py-5 space-y-4 flex-grow">
                <div className="space-y-2">
                    <h1 className="font-medium">Facility Details</h1>
                    <Card className="px-5 py-3 flex items-center justify-between">
                        <div className="flex flex-col items-start gap-3">
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">ID: </p>
                                <p>{id ? id : "-"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Next Maintenance: </p>
                                <p>{nextMaintenance ? nextMaintenance : "-"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Type: </p>
                                <p>{type ? type : "-"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Last Maintenance: </p>
                                <p>{lastMaintenance ? lastMaintenance : "-"}</p>
                            </div>
                        </div>
                    </Card>
                </div>
                <div>
                    <h1 className="font-medium">Upcoming Bookings</h1>
                    <Card className="px-5 py-3">
                        <p>No Upcoming Booking</p>
                    </Card>
                </div>
            </section>
        </TabsContent>
    )
}

interface MaintenanceFormInput {
    maintenanceDate: Date
    no_docket: string
    notes: string
}

interface MaintenanceProps {
    value: string
    id: string
    setNextMaintenance: (value: string) => void
    setLastMaintenance: (value: string) => void
    nextMaintenance: string;
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Maintenance = ({
    value,
    id,
    setNextMaintenance,
    setLastMaintenance,
    nextMaintenance,
    open,
    setOpen
}: MaintenanceProps) => {
    const { useSpaceMaintenanceById } = useBookingQueries();
    const { fetchUserBySupabaseAuth } = useUserId();

    const [date, setDate] = useState<Date>();
    const form = useForm<MaintenanceFormInput>({});
    const { data: spaceMaintenanceData, isLoading: spaceMaintenanceDataLoading, refetch } = useSpaceMaintenanceById(Number(id));
    const { useMaintenanceSpaceMutation } = useBookingMutation();
    const maintenanceSpaceMutation = useMaintenanceSpaceMutation();

    useEffect(() => {
        if (spaceMaintenanceData && spaceMaintenanceData.length > 0) {
            const today = new Date();

            const futureMaintenance = spaceMaintenanceData
                .filter(space => new Date(space.maintenance_date) > today)
                .sort((a, b) =>
                    new Date(a.maintenance_date).getTime() -
                    new Date(b.maintenance_date).getTime()
                );

            if (futureMaintenance.length > 0) {
                setNextMaintenance(futureMaintenance[0].maintenance_date);
            }

            const latestMaintenance = spaceMaintenanceData[spaceMaintenanceData.length - 1].maintenance_date;
            setLastMaintenance(latestMaintenance);
        }
    }, [spaceMaintenanceData])

    const onSubmitSpaceMaintenance: SubmitHandler<MaintenanceFormInput> = async (data) => {
        const userId = await fetchUserBySupabaseAuth();
        const status: MaintenanceStatus = MaintenanceStatus.Submitted;
        const maintenance_date = new Date(data.maintenanceDate).toISOString().split('T')[0];
        const space_id = Number(id);
        const no_docket = data.no_docket;
        const created_at = new Date().toISOString();
        const created_by = userId;
        try {
            const toSubmitSpaceMaintenanceData: MaintenanceRequest = {
                requester_by: userId,
                description: data.notes,
                status,
                maintenance_date,
                space_id,
                no_docket,
                created_at,
                created_by
            }

            const maintenanceSubmitted = await maintenanceSpaceMutation.mutateAsync(toSubmitSpaceMaintenanceData);

            toast({
                title: "Space maintenance scheduled",
                variant: "success"
            });

            refetch();
        } catch (error) {
            console.error(error);
            toast({
                title: "Failed to schedule space maintenance",
                variant: "destructive"
            })
        }
    };

    if (spaceMaintenanceDataLoading) {
        return <LoadingSpinner />
    }

    return (
        <TabsContent className="w-full space-y-4" value={value}>
            <header className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Maintenance History</h1>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setOpen(true)} className="flex items-center gap-3">
                            <Clock />
                            Schedule Maintenance
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Schedule Maintenance</SheetTitle>
                            <SheetDescription>
                                Set a date for scheduled maintenance of this facility.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex flex-col space-y-6 py-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmitSpaceMaintenance)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="maintenanceDate"
                                        render={({ field }) => (
                                            <div className="flex flex-col items-start gap-4">
                                                <Label htmlFor="maintenanceDate" className="text-right">
                                                    Maintenance Date
                                                </Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[240px] justify-start text-left font-normal",
                                                                !date && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon />
                                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={date}
                                                            onSelect={(date) => {
                                                                setDate(date);
                                                                field.onChange(date);
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="no_docket"
                                        render={({ field }) => (
                                            <div className="flex flex-col items-start gap-4">
                                                <Label htmlFor="no_docket" className="text-right">
                                                    No Docket
                                                </Label>
                                                <Input
                                                    id="no_docket"
                                                    placeholder="Enter no. docket"
                                                    {...field}
                                                />
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <div className="flex flex-col items-start gap-4">
                                                <Label htmlFor="notes" className="text-right">
                                                    Notes
                                                </Label>
                                                <Input
                                                    id="notes"
                                                    placeholder="Enter maintenance details"
                                                    {...field}
                                                />
                                            </div>
                                        )}
                                    />
                                    <SheetFooter>
                                        <SheetClose asChild>
                                            <Button className="w-full" type="submit">Schedule</Button>
                                        </SheetClose>
                                    </SheetFooter>
                                </form>
                            </Form>
                        </div>
                    </SheetContent>
                </Sheet>
            </header>
            <Card className="p-5">
                {spaceMaintenanceData && spaceMaintenanceData.length !== 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                        {spaceMaintenanceData.map((spaceMaintenance) => (
                            <Card key={spaceMaintenance.id} className="p-2 text-center bg-gray-200">
                                {spaceMaintenance?.maintenance_date}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <NoBookingFound
                        title="No Maintenance History"
                        description="This facility has no maintenance history"
                        icon={(<FolderX />)}
                    />
                )}
            </Card>
        </TabsContent>
    )
}

const Settings = ({ value }) => {
    const settingsData = [
        {
            header: "Booking Notification",
            description: "Get notified about new bookings for this facility"
        },
        {
            header: "Maintenance Alert",
            description: "Receive alerts about upcoming maintenance"
        }
    ];

    return (
        <TabsContent className="w-full space-y-2" value={value}>
            <h1 className="text-xl font-bold">Notification Settings</h1>
            <Card className="p-4">
                {settingsData.map((set, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-center py-3">
                            <div className="">
                                <h1 className="text-lg font-semibold">{set.header}</h1>
                                <p>{set.description}</p>
                            </div>
                            <Button className="bg-white hover:bg-gray-50 text-black border border-gray-300 ring-gray-300">Enabled</Button>
                        </div>
                        {index === settingsData.length - 1 ? null : <hr />}
                    </div>
                ))}
            </Card>
        </TabsContent>
    )
}

export default BookingAssetCard;