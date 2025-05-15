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
import { useUserId } from "@/hooks/use-user-id";
import { toast } from "@/hooks/use-toast";
import { stringToDateWithTime } from "../utils/stringToDateWithTime";

interface BookingPcFormInput {
    pc: string,
    userName: string,
    date: Date,
    startTime: string,
    endTime: string,
    purpose: string,
}

interface BookingFormProps {
    pcsName: string[],
    setBookingCalendarData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setBookingsData: React.Dispatch<React.SetStateAction<Booking[]>>,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const BookingForm = ({
    pcsName,
    setBookingCalendarData,
    setOpen
}: BookingFormProps) => {
    const form = useForm<BookingPcFormInput>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { useBookingPcMutation } = useBookingMutation();
    const bookingPcMutation = useBookingPcMutation();

    const { fetchUserByName } = useUserId();

    const onSubmit: SubmitHandler<BookingPcFormInput> = async (formData) => {
        // SOON: new booking request
        setIsSubmitting(true);

        try {
            const { id: assetId } = await assetClient.fetchAssetByName(formData.pc);
            const { id: userId } = await fetchUserByName(formData.userName);
            console.log("submiited requester id", userId)
            const startTime = stringToDateWithTime(formData.startTime);
            const endTime = stringToDateWithTime(formData.endTime);
            const bookingId = crypto.randomUUID();

            const submitedFormData: Booking = {
                asset_id: assetId,
                booking_start: startTime.toISOString(),
                booking_end: endTime.toISOString(),
                created_by: userId,
                requester_id: userId,
                id: bookingId,
                created_at: new Date().toISOString(),
                is_using: true
            }

            const newBookingData = await bookingPcMutation.mutateAsync(submitedFormData);
            console.log(newBookingData)

            setBookingCalendarData((prevBook) => [
                ...prevBook,
                newBookingData
            ])

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
                description: `${error.message}`
            });
        } finally {
            setIsSubmitting(false);
        }


    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="pc"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>PC</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a PC" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {
                                                pcsName.map((pc) => (
                                                    <SelectItem key={pc} value={pc}>{pc}</SelectItem>
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
                                <Input {...field} placeholder="Enter user name" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    className="w-full rounded-md border shadow"
                                />
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