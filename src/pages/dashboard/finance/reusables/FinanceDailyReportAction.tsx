import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { CalendarIcon, Edit, Plus, Trash } from "lucide-react";
import { useFinanceQueries } from "@/hooks/finance/use-finance-queries";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import { useFinanceMuation } from "@/hooks/finance/use-finance-mutation";
import { financeClient } from "@/hooks/finance/finance-client";
import { toast } from "@/hooks/use-toast";

// ----------------------
// Manual Type
// ----------------------
type FinanceFormValues = {
    type: "income" | "expense";
    date: Date;
    incomeType?: string;
    amount: number;
    expenseType?: string;
    description?: string;
    imageFile?: File;
    docFile?: File;
};

interface FinanceDailyReportActionProps {
    financeReportItemId: string;
    refetchFinanceItem: () => void;
    refetchFinanceReport: () => void;
    formDefaultValues?: FinanceFormValues
}

export const FinanceDailyReportAction = ({
    financeReportItemId,
    refetchFinanceItem,
    refetchFinanceReport,
    formDefaultValues
}: FinanceDailyReportActionProps) => {
    const {
        useAllFinanceIncomeTypes,
        useAllFinanceExpenseTypes
    } = useFinanceQueries();
    const {
        useEditFinanceReportItemMutation,
        useDeleteFinanceItemReport
    } = useFinanceMuation();
    const editFinanceReportItemMutation = useEditFinanceReportItemMutation(financeReportItemId);
    const deleteFinanceItemReport = useDeleteFinanceItemReport(financeReportItemId);
    const { data: incomeTypes, isLoading: incomeTypesLoading } = useAllFinanceIncomeTypes();
    const { data: expenseTypes, isLoading: expenseTypesLoading } = useAllFinanceExpenseTypes();

    const [isIncome, setIsIncome] = useState(false);
    const [isExpense, setIsExpense] = useState(false);

    const [open, setOpen] = useState(false);

    const form = useForm<FinanceFormValues>({
        defaultValues: {
            type: formDefaultValues?.type || "income",
            date: formDefaultValues?.date || new Date(),
            amount: formDefaultValues?.amount || 0,
            incomeType: formDefaultValues?.incomeType || "",
            expenseType: formDefaultValues?.expenseType || "",
            description: formDefaultValues?.description || "",
            imageFile: formDefaultValues?.imageFile || null,
            docFile: formDefaultValues?.docFile || null
        },
    });

    const onSubmit = async (values: FinanceFormValues) => {
        try {
            if (!values.docFile && !values.imageFile) {
                throw new Error("Please upload a file");
            }
            const description = values.description ? values.description : "";
            const selectedAmountToDebit = values.type === "income" ? values.amount : 0;
            const selectedAmountToCredit = values.type === "expense" ? values.amount : 0;
            const balance = selectedAmountToDebit - selectedAmountToCredit;
            let imagePubLicUrl = "";
            let docPuclicUrl = "";
            if (values.imageFile) {
                imagePubLicUrl = await financeClient.uploadFile(values.imageFile);
            }
            if (values.docFile) {
                docPuclicUrl = await financeClient.uploadFile(values.docFile);
            }
            const debitOrCreditTypeId = values.type === "income" ? values.incomeType : values.expenseType;
            const createdAt = new Date().toISOString();

            const submittedData = {
                description,
                debit: selectedAmountToDebit,
                credit: selectedAmountToCredit,
                balance,
                image_path: imagePubLicUrl,
                doc_path: docPuclicUrl,
                created_at: createdAt,
                debit_type: isIncome ? debitOrCreditTypeId : null,
                credit_type: isExpense ? debitOrCreditTypeId : null,
            };

            await editFinanceReportItemMutation.mutateAsync(submittedData);
            form.reset();
            setOpen(false);
            refetchFinanceItem();
            refetchFinanceReport();
            toast({
                title: "Report Item Updated",
                description: "Report item has been updated successfully.",
                variant: "success",
            })
        } catch (error) {
            console.error("Error updating report item:", error);
            toast({
                title: "Error",
                description: "Failed to update report item. Please try again.",
                variant: "destructive",
            })
        }
    };

    const handleTypeChange = (value: string) => {
        form.setValue("type", value as "income" | "expense");
        setIsIncome(value === "income");
        setIsExpense(value === "expense");
    };

    const handleOtherTypeChange = (value: string) => {
        if (value === "0") {
            setIsIncome(false);
            setIsExpense(false);
        }
    };

    const handleDeleteFinanceReportItem = async () => {
        try {
            await deleteFinanceItemReport.mutateAsync();
            setOpen(false);
            refetchFinanceItem();
            refetchFinanceReport();
        } catch (error) {
            console.error("Error deleting report item:", error);
        }
    };

    useEffect(() => {
        if (formDefaultValues?.type === "income") {
            setIsIncome(true);
        } else if (formDefaultValues?.type === "expense") {
            setIsExpense(true);
        } else {
            setIsIncome(false);
            setIsExpense(false);
        }
    }, [formDefaultValues?.type]);

    if (incomeTypesLoading || expenseTypesLoading) {
        return <LoadingSpinner />;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex justify-center gap-1">
                <DialogTrigger asChild>
                    <Button className="bg-white text-yellow-700 border border-yellow-700 hover:bg-yellow-200"><Edit /></Button>
                </DialogTrigger>
                <Button onClick={handleDeleteFinanceReportItem} className="bg-white text-red-700 border border-red-700 hover:bg-red-200 mx-2"><Trash /></Button>
            </div>
            <DialogContent className="sm:max-w-[425px] h-screen overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>Edit Daily Transaction</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="type"
                            rules={{ required: "Type is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={(val) => handleTypeChange(val)} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select transaction type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Type</SelectLabel>
                                                <SelectItem value="income">Income</SelectItem>
                                                <SelectItem value="expense">Expense</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            rules={{ required: "Amount is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (RM)</FormLabel>
                                    <Input type="number" {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            rules={{ required: "Date is required" }}
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of birth</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                captionLayout="dropdown"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />

                        {isIncome && (
                            <FormField
                                control={form.control}
                                name="incomeType"
                                rules={{ required: "Income Type is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Income Type</FormLabel>
                                        <Select onValueChange={(val) => {
                                            field.onChange(val);
                                            handleOtherTypeChange(val);
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select income type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Income Type</SelectLabel>
                                                    {[...incomeTypes, { id: 0, name: "Other" }].map((incomeType) => (
                                                        <SelectItem key={incomeType.id} value={incomeType.id}>
                                                            {incomeType.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {isExpense && (
                            <FormField
                                control={form.control}
                                name="expenseType"
                                rules={{ required: "Expense Type is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expense Type</FormLabel>
                                        <Select onValueChange={(val) => {
                                            field.onChange(val);
                                            handleOtherTypeChange(val);
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select expense type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Expense Type</SelectLabel>
                                                    {[...expenseTypes, { id: 0, name: "Other" }].map((expenseType) => (
                                                        <SelectItem key={expenseType.id} value={expenseType.id}>
                                                            {expenseType.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {(!isIncome && !isExpense) && (
                            <FormField
                                control={form.control}
                                name="description"
                                rules={{ required: "Description is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Other Type Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Other Type" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="imageFile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Upload Image</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    field.onChange(file);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="docFile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Upload Document (PDF)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    field.onChange(file);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Submit</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}