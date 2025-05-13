import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, SubmitHandler } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { TimePicker } from "@/components/ui/time-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface BookingPcFormInput {
    pc: string,
    userName: string,
    date: Date,
    startTime: Date,
    endTime: Date,
    purpose: string
}

interface BookingFormDialogProps {
    pcsName: string[]
}

export const BookingFormDialog = ({
    pcsName
}: BookingFormDialogProps) => {
    const form = useForm<BookingPcFormInput>({

    });

    const onSubmit: SubmitHandler<BookingPcFormInput> = (formData) => {

    }

    return (
        <DialogContent className="h-screen overflow-auto [&::-webkit-scrollbar]:hidden scrollbar-hide">
            <DialogHeader>
                <DialogTitle>Create New PC Booking</DialogTitle>
            </DialogHeader>
            <Form { ...form }>
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
                                            <SelectValue placeholder="Select a PC"/>
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
                                    <Input {...field} placeholder="Enter user name"/>
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
                                        <TimePicker/>
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
                                        <TimePicker/>
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
                                    <Input {...field} placeholder="Enter purpose"/>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button className="w-full" type="submit">Create Boooking</Button>
                </form>
            </Form>
        </DialogContent>
    )
}