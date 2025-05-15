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
import { Server } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Dialog } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { BookingFormDialog } from "./BookingFormDialog";

interface BookingCalendarProp {
    bookingType: string,
    assetTypeNames: string[],
    bookingData: Booking[],
    onChangeFilter: (date: Date, assetTypeName: string) => void,
    setBookingCalendarData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    isLoading:  boolean
}

export const BookingCalendar = ({ 
    bookingType, 
    assetTypeNames, 
    bookingData,
    setBookingCalendarData,
    setBookingsData,
    onChangeFilter,
    isLoading
}: BookingCalendarProp) => {
    const [date, setDate] = useState<Date>(new Date());
    const [assetTypeName, setAssetTypeName ] = useState<string>(`all ${bookingType}`);
    const [open, setOpen] = useState(false);

    const handleFilter = (date: Date, assetTypeName: string) => {
        onChangeFilter(date, assetTypeName);
    }

    useEffect(() => {
        handleFilter(date, assetTypeName);
    }, [date, assetTypeName]);

    return (
        <section className="w-full flex gap-4 mt-4">
            <div className="flex flex-col gap-4" id="filter">
                <Select onValueChange={(value) => setAssetTypeName(value)}>
                    <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a pc name" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {
                            assetTypeNames.map((assetName, i) => (
                                <SelectItem key={`assetName${i}`} value={assetName}>{assetName}</SelectItem>
                            ))
                        }
                    </SelectGroup>
                </SelectContent>
                </Select>
                <div className="flex flex-col items-center border-2 p-6 border-gray-300 rounded-lg">
                    <h1 className="text-2xl text-center font-bold">Select Date</h1>
                    <p className="text-gray-500">{`View ${bookingType.toUpperCase()} bookings for a specific date`}</p>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border shadow mt-3"
                    />
                </div>
            </div>
            <div className="flex flex-col items-end gap-4 flex-grow" id="booking-contents">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger >
                        <Button className="text-base font-semibold">
                            +
                            <span>add new booking</span>
                        </Button>
                    </DialogTrigger>
                    <BookingFormDialog 
                        setOpen={setOpen} 
                        open={open} 
                        setBookingCalendarData={setBookingCalendarData}
                        setBookingsData={setBookingsData}
                        isLoading={isLoading} 
                        pcsName={assetTypeNames.filter((name) => name !== "all pc")}
                    />
                </Dialog>
                <div className="w-full border-2 p-6 border-gray-300 rounded-lg flex flex-col gap-5 items-center flex-grow">
                    <header className="flex flex-col items-center">
                        <h1 className="text-2xl text-center font-bold">{`${bookingType.toUpperCase()} for ${date.toDateString()}`}</h1>
                        <p className="text-gray-500">{bookingData.length} bookings scheduled</p>
                    </header>
                    {
                        isLoading ? (
                            <LoadingSpinner />
                        ) : bookingData.length === 0 ? (
                            <NoBookingFound 
                                icon={(<Server className="size-8" />)}
                                title="No bookings found"
                                description="There are no PC bookings scheduled for this date."
                            />
                        ) : bookingData.map((booking) => (
                            <div key={booking.id}>{booking.created_at}</div>
                        ))
                    }
                </div>
            </div>
        </section>
    )
}