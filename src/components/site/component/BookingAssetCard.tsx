import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bell, Building, CalendarIcon, CircleDot, Clock, FolderX, LockIcon, Plus, PowerOff, RefreshCcw, Server, SquarePen, Unlock, User } from "lucide-react";
import { BulkActionButtons } from "./BulkActionButtons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { NoBookingFound } from "./NoBookingFound";
import { useAssetQueries } from "@/hooks/assets/use-asset-queries";
import { toast } from "@/hooks/use-toast";
import { Action } from "@radix-ui/react-toast";

interface DataCardProps {
    id: string;
    assetName: string;
    assetType: string;
    assetSpec: string;
    started?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    requesterName: string;
    label?: React.ReactNode
    duration?: string;
    status?: string;
    isFacility?: boolean;
    children?: React.ReactNode;
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
    duration,
    label,
    icon,
    className,
    children,
}: DataCardProps) => {
    return (
        <Dialog>
            <DialogTrigger>
                <Card className={cn("h-full scale-100 transition-transform duration-200 ease-in-out", className)}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className='flex items-center justify-center gap-3'>
                            {icon && <div className="h-4 flex justify-center items-center w-4 text-muted-foreground">{icon}</div>}
                            <CardTitle className="text-lg font-medium">{assetType}</CardTitle>
                        </div>
                        {(label)}
                    </CardHeader>
                    <CardContent className='flex flex-col justify-center items-center'>
                        <div className="text-xl font-light">{assetName}</div>
                        {assetSpec && (
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                {assetSpec}
                            </CardDescription>
                        )}
                        {requesterName && (
                            <CardDescription className='font-semibold text-base mt-2 text-black'>
                                {requesterName}
                            </CardDescription>
                        )}
                        {children}
                        {isFacility && (
                            <div className="w-full flex items-center justify-between gap-1 mt-3">
                                {status === "in-use" || status === "Maintenance" ? (
                                    <Button size="sm" className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-2 py-0.5 flex items-center text-[11px] gap-1 w-fit">
                                        <SquarePen className="h-2 w-2" />
                                        Report Issue
                                    </Button>
                                ) : (
                                    <>
                                        <Button size="sm" className="flex flex-grow items-center px-2 py-0.5 text-[11px] gap-1 w-fit">
                                            <Plus className="h-2 w-2" />
                                            Reserve Now
                                        </Button>
                                        <Button size="sm" className="bg-white flex-grow hover:bg-gray-50 text-gray-700 border border-gray-300 px-2 py-0.5 flex items-center text-[11px] gap-1 w-fit">
                                            <SquarePen className="h-2 w-2" />
                                            Report Issue
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                    {(started !== "-" && duration !== "-") && <CardFooter className="pt-1 flex justify-center items-center text-[10px] font-light text-gray-500">{`Started: ${started} | Duration: ${duration}`}</CardFooter>}
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
                    name={assetName}
                    status={status}
                />
            )}
        </Dialog>
    );
};

interface BookingPcCardDetailsProps {
    name: string,
    id: string,
    status: string,
    duration: string,
}

const BookingPcCardDetails = ({
    name,
    status,
    id,
    duration
}: BookingPcCardDetailsProps) => {
    const { useToggleAssetStatus } = useAssetQueries();
    const toggleAsset = useToggleAssetStatus(id, status === "Available" ? true : false);

    const handlePcStatus = async () => {
        try {
            await toggleAsset.mutateAsync();
            toast({
                title: `PC ${name} shut down`
            })
        } catch (error) {
            toast({
                title: `Failed to shut down the ${name}`
            })
        }
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
            action: handlePcStatus
        },
        {
            name: "Restart PC",
            icon: <RefreshCcw />,
            value: "Restart PC",
            customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200",
            Action: () => console.log("Clicked")
        },
        {
            name: "Lock PC",
            icon: <LockIcon />,
            value: "Lock PC",
            customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200",
            Action: () => console.log("Clicked")
        },
        {
            name: "Unlock PC",
            icon: <Unlock />,
            value: "Unlock PC",
            customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200",
            Action: () => console.log("Clicked")
        },
    ]

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold justify-start">
                    <Server />
                    {name}
                </DialogTitle>
            </DialogHeader>
            <BulkActionButtons
                buttonsData={pcActionButtons}
                className="grid grid-cols-2 mt-0"
                useHeader={false}
            />
            <div className="flex flex-col gap-4">
                {aboutPc.map((pc) => (
                    <div className="flex flex-col items-start">
                        <h5 className="font-semibold text-base">{pc.title}:</h5>
                        <small className="text-gray-600">{pc.description}</small>
                    </div>
                ))}
            </div>
        </DialogContent>
    )
}

interface BookingFacilityCardDetailsProps {
    name: string,
    status: string
}

const BookingFacilityCardDetails = ({
    name,
    status
}: BookingFacilityCardDetailsProps) => {

    return (
        <DialogContent className="max-w-5xl max-h-screen overflow-y-scroll">
            <header className="space-y-3">
                <h1 className="w-full flex items-center gap-3 justify-start text-2xl font-bold">
                    <Building />
                    {name}
                </h1>
                <p className="text-gray-500">Control Panel and Facility Information</p>
            </header>
            <Tabs defaultValue="Details" className="w-full grid place-items-center mt-7">
                <TabsList className="w-full bg-white inline-flex h-11 flex-wrap justify-between gap-2 items-center">
                    <TabsTrigger
                        className="flex-grow text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                        key="Details"
                        value="Details">Details</TabsTrigger>
                    <TabsTrigger
                        className="flex-grow text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                        key="Bookings"
                        value="Bookings">Bookings</TabsTrigger>
                    <TabsTrigger
                        className="flex-grow text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                        key="Maintenance"
                        value="Maintenance">Maintenance</TabsTrigger>
                    <TabsTrigger
                        className="flex-grow text-md px-2 py-1 min-w-max data-[state=active]:bg-muted rounded whitespace-nowrap"
                        key="Settings"
                        value="Settings">Settings</TabsTrigger>
                </TabsList>
                <Details
                    status={status}
                    value="Details"
                />
                <Bookings
                    value="Bookings"
                />
                <Maintenance
                    value="Maintenance"
                />
                <Settings
                    value="Settings"
                />
            </Tabs>
        </DialogContent>
    )
}

interface detailsPprops {
    value: string
    status: string
}

const Details = ({
    value,
    status
}) => {

    // Query for upcoming facility booking.
    // and other facility booking information
    const facilityActionButtons = [
        {
            name: "Close Room",
            icon: <PowerOff />,
            value: "Close Room",
            customClass: "bg-red-500 hover:bg-red-400"
        },
        {
            name: "Notify Me",
            icon: <Bell />,
            value: "Notify Me",
            customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200"
        },
        {
            name: "Lock Room",
            icon: <LockIcon />,
            value: "Lock Room",
            customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200"
        },
        {
            name: "Unlock Room",
            icon: <Unlock />,
            value: "Unlock Room",
            customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200"
        },
    ]
    return (
        <TabsContent className="w-full flex items-start gap-4" value={value}>
            <section className="py-5 space-y-4 w-[40%]">
                <div className="space-y-2">
                    <h1 className="font-medium">Quick Action</h1>
                    <BulkActionButtons
                        buttonsData={facilityActionButtons}
                        className="grid grid-cols-2 my-0"
                        useHeader={false}
                    />
                </div>
                <div className="space-y-2">
                    <h1 className="font-medium">Status</h1>
                    <Card className="px-4 py-3 space-y-2">
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
                                <h3 className="font-semibold">Sarah Johnson</h3>
                                <p className="text-sm text-gray-500">Time: 13:00 - Duration: 2h</p>
                                <small className="flex text-gray-500 gap-2 items-center">
                                    <User className="size-5" />
                                    8 Attendees
                                </small>
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
                                <p>-</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Capacity: </p>
                                <p>-</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Next Maintenance: </p>
                                <p>-</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Type: </p>
                                <p>-</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Last Maintenance: </p>
                                <p>-</p>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="space-y-2">
                    <h1 className="font-medium">Equipment and Amenities</h1>
                    <Card className="px-5 py-3 space-y-2">
                        <div className="flex flex-col justify-center">
                            <h1>Equipment:</h1>
                            <div className="flex items-center gap-2">
                                <Badge>Small Whiteboard</Badge>
                                <Badge>Monitor</Badge>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1>Amenties: </h1>
                            <div className="flex items-center gap-2">
                                <Badge>Air Conditioning</Badge>
                                <Badge>WiFi</Badge>
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

const Bookings = ({ value }) => {
    return (
        <TabsContent className="w-full space-y-4" value={value}>
            <header className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Manage Booking</h1>
                <Button className="flex items-center gap-3">
                    <Plus />
                    Add Booking
                </Button>
            </header>
            <Card className="px-5 py-4">
                <div className="flex justify-between">
                    <div>
                        <p className="text-lg font-medium">John Smith</p>
                        <small className="text-gray-600">14:00 | 2h</small>
                    </div>
                    <div className="space-x-3">
                        <Button className="bg-white  hover:bg-gray-100 border border-gray-300 text-black">Edit</Button>
                        <Button className="bg-red-500 hover:bg-red-400">Cancel</Button>
                    </div>
                </div>
            </Card>
            <header className="text-start">
                <h1 className="text-xl font-semibold">Recurring Bookings</h1>
            </header>
            <Card className="flex flex-col items-center justify-center px-5 py-7 space-y-5">
                <p className="text-gray-500">Set up recurring bookings for this facility</p>
                <Button>Configure Recurring Schedule</Button>
            </Card>
        </TabsContent>
    )
}

const Maintenance = ({ value }) => {
    const [date, setDate] = useState<Date>();
    return (
        <TabsContent className="w-full space-y-4" value={value}>
            <header className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Maintenance History</h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="flex items-center gap-3">
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
                            <div className="flex flex-col items-start gap-4">
                                <Label htmlFor="name" className="text-right">
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
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-col items-start gap-4">
                                <Label htmlFor="maintenance" className="text-right">
                                    Notes
                                </Label>
                                <Input id="maintenance" className="col-span-3" placeholder="Enter maintenance details" />
                            </div>
                        </div>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button className="w-full" type="submit">Schedule</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </header>
            <Card className="p-5">
                <NoBookingFound
                    title="No Maintenance History"
                    description="This facility has no maintenance history"
                    icon={(<FolderX />)}
                />
            </Card>
        </TabsContent>
    )
}

const Settings = ({ value }) => {
    return (
        <TabsContent value={value}>
            <h1>This is {value}</h1>
        </TabsContent>
    )
}

export default BookingAssetCard;