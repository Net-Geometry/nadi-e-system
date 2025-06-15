"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import TimeInput from "@/components/ui/TimePicker";
import { useBookingMutation } from "@/hooks/booking/use-booking-mutation";
import { useState } from "react";
import { Booking } from "@/types/booking";
import { assetClient } from "@/hooks/assets/asset-client";
import { useUserId } from "@/hooks/use-user";
import { toast } from "@/hooks/use-toast";
import { stringToDateWithTime } from "../utils/stringToDateWithTime";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronRight, Mail, Phone, UserRound } from "lucide-react";
import { format } from "date-fns";
import { useMemberSiteId, useTpManagerSiteId } from "@/hooks/use-site-id";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { bookingClient } from "@/hooks/booking/booking-client";
import { useDebounce } from "@/hooks/use-debounce";
import { useBookingQueries } from "@/hooks/booking/use-booking-queries";
import { Card } from "@/components/ui/card";
import { SiteSpace } from "@/types/site";
import { Asset } from "@/types/asset";
import { formatToISO } from "../utils/formatToIso";

interface BookingFormInput {
    pc?: string,
    facility?: string,
    userName: string,
    date: Date,
    startTime: string,
    endTime: string,
    purpose: string,
}

interface BookingFormProps {
    assetsName: string[],
    isMember: boolean,
    isTpSite: boolean,
    isFacility?: boolean,
    setBookingCalendarData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedFacilitiesData?: React.Dispatch<React.SetStateAction<SiteSpace[]>>
    setSeletedPcsData?: React.Dispatch<React.SetStateAction<Asset[]>>
}

const BookingForm = ({
    assetsName,
    isMember,
    isTpSite,
    isFacility,
    setBookingCalendarData,
    setBookingsData,
    setOpen,
    setSelectedFacilitiesData,
    setSeletedPcsData
}: BookingFormProps) => {
    const [userName, setUserName] = useState("");
    const debouncedUserName = useDebounce(userName, 600);
    const { useUserProfileByName } = useBookingQueries();
    const { data: userProfile, isLoading: isUserProfileLoading } = useUserProfileByName(debouncedUserName);
    const { siteId: memberSiteId, isLoading: memberSiteIdLoading } = useMemberSiteId(isMember);
    const { siteId: tpManagerSiteId, isLoading: tpManagerSiteIdLoading } = useTpManagerSiteId(isTpSite);

    // Member or TP Site Site ID
    const siteId =
        memberSiteId
            ? Number(memberSiteId)
            : tpManagerSiteId
                ? Number(tpManagerSiteId)
                : undefined;

    const form = useForm<BookingFormInput>({});
    const { setValue } = form;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { useBookingPcMutation } = useBookingMutation();
    const bookingPcMutation = useBookingPcMutation(!!siteId);

    const { fetchUserByName } = useUserId();

    const onSubmitPcBooking: SubmitHandler<BookingFormInput> = async (formData) => {
        setIsSubmitting(true);

        try {
            const { id: assetId } = await assetClient.fetchAssetByName(formData.pc, siteId);
            const { id: userId } = await fetchUserByName(formData.userName);
            const startTime = stringToDateWithTime(formData.startTime, formData.date);
            const endTime = stringToDateWithTime(formData.endTime, formData.date);
            const bookingId = crypto.randomUUID();

            const submittedFormData: Booking = {
                asset_id: assetId,
                booking_start: formatToISO(startTime),
                booking_end: formatToISO(endTime),
                created_by: userId,
                requester_id: userId,
                id: bookingId,
                created_at: new Date().toISOString(),
                is_active: true,
                purpose: formData.purpose,
                site_id: siteId
            }

            const newBookingData = await bookingPcMutation.mutateAsync(submittedFormData);

            setBookingCalendarData((prevBook) => [
                ...prevBook,
                newBookingData
            ])

            setBookingsData((prevBook) => [
                ...prevBook,
                newBookingData
            ]);

            setSeletedPcsData?.((prevPcs) => prevPcs.map((pc) => {
                if (pc.name === formData.pc) {
                    return {
                        ...pc,
                        nd_booking: [
                            ...pc.nd_booking,
                            newBookingData
                        ]
                    }
                }
                return pc;
            }));


            setOpen(false);
            toast({
                title: "Add new booking success",
                description: `Success request new PC: ${formData.pc}`
            });
        } catch (error) {
            console.log(error);
            setOpen(false);
            toast({
                title: "Add new booking failed",
                description: "Something went wrong when submitting the new booking",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }


    }

    const onSubmitFacilityBooking: SubmitHandler<BookingFormInput> = async (formData) => {
        setIsSubmitting(true);

        try {
            const { id: spaceId } = await bookingClient.getSpaceByName(formData.facility, siteId);
            const { id: userId } = await fetchUserByName(formData.userName);
            const startTime = stringToDateWithTime(formData.startTime);
            const endTime = stringToDateWithTime(formData.endTime);
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

            setBookingCalendarData((prevBook) => [
                ...prevBook,
                newBookingData
            ])

            setBookingsData((prevBook) => [
                ...prevBook,
                newBookingData
            ])

            setOpen(false);
            toast({
                title: "Add new booking success",
                description: `Success request new ${isFacility ? "Facility" : "PC"}: ${formData.facility}`
            });
        } catch (error) {
            console.log(error);
            setOpen(false);
            toast({
                title: "Add new booking failed",
                description: "Something went wrong when submitting the new booking",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }


    }

    const onSubmit: SubmitHandler<BookingFormInput> = (formData) => {
        if (isFacility) {
            onSubmitFacilityBooking(formData);
        } else {
            onSubmitPcBooking(formData)
        }
    }

    if (
        memberSiteIdLoading ||
        tpManagerSiteIdLoading
    ) {
        return <LoadingSpinner />
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name={isFacility ? "facility" : "pc"}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isFacility ? "Facility" : "PC"}</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} >
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select a ${isFacility ? "Facility" : "PC"}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {
                                                assetsName.map((asset) => (
                                                    <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                                                ))
                                            }
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>User Name</FormLabel>
                            <FormControl>
                                <Input {...field} onChange={(e) => {
                                    setUserName(e.target.value)
                                    field.onChange(e)
                                }} placeholder="Enter user name" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {isUserProfileLoading ? (
                    <LoadingSpinner />
                ) : userProfile?.map((user) => (
                    <Card onClick={() => {
                        setValue("userName", user.full_name);
                        setUserName("");
                    }}
                        className="w-full px-3 py-2 flex flex-col justify-between items-start cursor-pointer"
                        key={user.id}
                    >
                        <header className="w-full flex items-center justify-between">
                            <h1 className="text-base font-medium">{user.full_name}</h1>
                            <small className="flex items-center">
                                Select
                                <ChevronRight className="size-4" />
                            </small>
                        </header>
                        <small className="text-gray-600"> {user.email}</small>
                        <small className="text-gray-600">{user.phone_number}</small>
                    </Card>
                ))}
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] border border-gray-200 justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon />
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="flex justify-between">
                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <TimeInput
                                        onChange={field.onChange}
                                        id="startTime"
                                        className="w-56"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                    <TimeInput
                                        onChange={field.onChange}
                                        id="endTime"
                                        className="w-56"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Purpose</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter purpose" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Create Boooking"}</Button>
            </form>
        </Form>
    )
}

export default BookingForm;