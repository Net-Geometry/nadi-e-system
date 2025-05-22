import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Building, CircleDot, Plus, Server, SquarePen, User } from "lucide-react";
import { BulkActionButtons } from "./BulkActionButtons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Space } from "@/types/site";
import { Badge } from "@/components/ui/badge";

interface DataCardProps {
    assetType: string;
    assetSpec: string;
    started?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    requesterName: string;
    AssetName?: string;
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
    AssetName,
    status,
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
                        <div className="text-xl font-light">{AssetName}</div>
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
                    name={AssetName}
                    status={status}
                    duration={duration}
                />
            ) : (
                <BookingFacilityCardDetails
                />
            )}
        </Dialog>
    );
};

interface BookingPcCardDetailsProps {
    name: string,
    status: string,
    duration: string,
}

const BookingPcCardDetails = ({
    name,
    status,
    duration
}: BookingPcCardDetailsProps) => {

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

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold justify-start">
                    <Server />
                    {name}
                </DialogTitle>
            </DialogHeader>
            <BulkActionButtons
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
    facilityDetails?: Space
}

const BookingFacilityCardDetails = ({
    facilityDetails
}: BookingFacilityCardDetailsProps) => {

    return (
        <DialogContent className="max-w-5xl max-h-screen overflow-scroll">
            <header className="space-y-3">
                <h1 className="w-full flex items-center gap-3 justify-start text-2xl font-bold">
                    <Building />
                    Meeting Room A
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

const Details = ({value}) => {
    return (
        <TabsContent className="w-full flex items-start gap-4" value={value}>
           <section className="py-5 space-y-4 w-[40%]">
                <div className="space-y-2">
                    <h1 className="font-medium">Quick Action</h1>
                    <BulkActionButtons 
                    className="grid grid-cols-2 my-0"
                    useHeader={false}
                    />
                </div>
                <div className="space-y-2">
                    <h1 className="font-medium">Status</h1>
                    <Card className="px-4 py-3 space-y-2">
                        <h2 className="flex items-center gap-2">
                            <CircleDot />
                            In-Use
                        </h2>
                        <h3 className="font-semibold">Sarah Johnson</h3>
                        <p className="text-sm text-gray-500">Time: 13:00 - Duration: 2h</p>
                        <small className="flex text-gray-500 gap-2 items-center">
                            <User className="size-5"/>
                            8 Attendees
                        </small>
                    </Card>
                </div>
                <div className="space-y-2">
                    <h1 className="font-medium">Today's Statistics</h1>
                    <Card className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <p>Total Bookings: </p>
                            <p>5</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p>Utilization: </p>
                            <p>85%</p>
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
                                <p>F-003</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Capacity: </p>
                                <p>5 Poeple</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Next Maintenance: </p>
                                <p>5</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Type: </p>
                                <p>Study Romm</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500">Last Maintenance: </p>
                                <p>2025-4-16</p>
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

const Bookings = ({value}) => {
    return (
        <TabsContent value={value}>
            <h1>This is {value}</h1>
        </TabsContent>
    )
}

const Maintenance = ({value}) => {
    return (
        <TabsContent value={value}>
            <h1>This is {value}</h1>
        </TabsContent>
    )
}

const Settings = ({value}) => {
    return (
        <TabsContent value={value}>
            <h1>This is {value}</h1>
        </TabsContent>
    )
}

export default BookingAssetCard;