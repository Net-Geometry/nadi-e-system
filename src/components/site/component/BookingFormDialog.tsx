import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Booking } from "@/types/booking";
import { lazy, Suspense, useEffect, useState } from "react";

const BookingForm =  lazy(() => import('./BookingForm'));

interface BookingFormDialogProps {
    pcsName: string[],
    isLoading: boolean,
    open: boolean,
    setBookingCalendarData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const BookingFormDialog = ({
    pcsName,
    isLoading,
    setBookingCalendarData,
    setBookingsData,
    setOpen,
    open
}: BookingFormDialogProps) => {
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (open) {
            setShowForm(false);
            const timer = setTimeout(() => {
                setShowForm(true);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setShowForm(false);
        }
    }, [open]);
    
    return (
        <DialogContent className="h-screen overflow-auto [&::-webkit-scrollbar]:hidden scrollbar-hide">
            <DialogHeader>
                <DialogTitle>Create New PC Booking</DialogTitle>
            </DialogHeader>
            { 
                !showForm ? 
                <div>Loading form...</div> :
                // <FormLoadingSkeleton />:
                (
                    <Suspense fallback={<div>Loading form...</div>}>
                        <BookingForm 
                            setOpen={setOpen} 
                            pcsName={pcsName}
                            setBookingsData={setBookingsData}
                            setBookingCalendarData={setBookingCalendarData}
                        />
                    </Suspense>
                )
            }
        </DialogContent>
    )
}