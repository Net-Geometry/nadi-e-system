import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Booking } from "@/types/booking";
import { lazy, Suspense, useEffect, useState } from "react";
import { LoadingFormSkeleton } from "./LoadingFormSkeleton";

const BookingForm = lazy(() => import('./BookingForm'));

interface BookingFormDialogProps {
    assetsName: string[],
    isLoading: boolean,
    open: boolean,
    isFacility?: boolean,
    isMember: boolean,
    isTpSite: boolean,
    setBookingCalendarData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const BookingFormDialog = ({
    assetsName,
    isMember,
    isTpSite,
    isLoading,
    isFacility,
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
        <DialogContent className="h-fit max-h-screen overflow-auto [&::-webkit-scrollbar]:hidden scrollbar-hide">
            {
                !showForm ?
                    <LoadingFormSkeleton 
                        inputSum={5}
                    /> :
                    (
                        <Suspense fallback={<LoadingFormSkeleton 
                            inputSum={5}
                        />}>
                            <DialogHeader>
                                <DialogTitle>Create New PC Booking</DialogTitle>
                            </DialogHeader>
                            <BookingForm
                                isTpSite={isTpSite}
                                isMember={isMember}
                                isFacility={isFacility}
                                setOpen={setOpen}
                                assetsName={assetsName}
                                setBookingsData={setBookingsData}
                                setBookingCalendarData={setBookingCalendarData}
                            />
                        </Suspense>
                    )
            }
        </DialogContent>
    )
}