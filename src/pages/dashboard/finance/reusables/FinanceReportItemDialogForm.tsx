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
import { CalendarIcon, Plus } from "lucide-react";
import { useFinanceQueries } from "@/hooks/finance/use-finance-queries";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import { useFinanceMuation } from "@/hooks/finance/use-finance-mutation";
import { supabase } from "@/lib/supabase";
import { financeClient } from "@/hooks/finance/finance-client";
import { useUserOrgId } from "../utils/useUserOrgId";
import { toast } from "@/hooks/use-toast";

// ----------------------
// Manual Type
// ----------------------
type FinanceFormValues = {
    type: "income" | "expense";
    date: Date;
    incomeType: string;
    amount: number;
    expenseType: string;
    description: string;
    imageFile?: File;
    docFile?: File;
};

interface FinanceReportItemDialogFormProps {
    financeReportId: string;
    refetchFinanceItem: () => void
    refetchFinanceReport: () => void
}

export const FinanceReportItemDialogForm = ({
    financeReportId,
    refetchFinanceItem,
    refetchFinanceReport
}: FinanceReportItemDialogFormProps) => {
    const { isTpSite } = useUserOrgId();
    const {
        useAllFinanceIncomeTypes,
        useAllFinanceExpenseTypes
    } = useFinanceQueries();
    const {
        useNewReportItemMutation
    } = useFinanceMuation();
    const financeReportItemMutation = useNewReportItemMutation();
    const { data: incomeTypes, isLoading: incomeTypesLoading } = useAllFinanceIncomeTypes();
    const { data: expenseTypes, isLoading: expenseTypesLoading } = useAllFinanceExpenseTypes();

    const [isIncome, setIsIncome] = useState(false);
    const [isExpense, setIsExpense] = useState(false);

    const [open, setOpen] = useState(false);

    const form = useForm<FinanceFormValues>({
        defaultValues: {
            type: "income",
            date: undefined,
            amount: 0,
            incomeType: "",
            expenseType: "",
            description: "",
            imageFile: undefined,
            docFile: undefined
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
            let docPubLicUrl = "";
            if (values.imageFile) {
                imagePubLicUrl = await financeClient.uploadFile(values.imageFile);
            }
            if (values.docFile) {
                docPubLicUrl = await financeClient.uploadFile(values.docFile);
            }
            const debitOrCreditTypeId = values.type === "income" ? values.incomeType : values.expenseType;
            const createdAt = new Date().toISOString();

            const submittedData = {
                description,
                debit: selectedAmountToDebit,
                credit: selectedAmountToCredit,
                balance,
                finance_report_id: financeReportId,
                image_path: imagePubLicUrl,
                doc_path: docPubLicUrl,
                created_at: createdAt,
                debit_type: isIncome ? debitOrCreditTypeId : null,
                credit_type: isExpense ? debitOrCreditTypeId : null,
            };

            await financeReportItemMutation.mutateAsync(submittedData);
            form.reset();
            setOpen(false);
            refetchFinanceItem();
            refetchFinanceReport();
            toast({
                title: "Report Item Created",
                description: "Report item has been created successfully.",
                variant: "success",
            })
        } catch (error: Error | any) {
            console.error("Error creating report item:", error);
            toast({
                title: "Error",
                description: `${error.message}`,
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

    useEffect(() => {
        setIsIncome(true);
        setIsExpense(false);
    }, [])

    if (incomeTypesLoading || expenseTypesLoading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {isTpSite && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="hover:bg-green-600 hover:text-white border-none bg-green-500 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] max-h-screen overflow-y-scroll">
                        <DialogHeader>
                            <DialogTitle>Add New Daily Transaction</DialogTitle>
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
                                            <Select onValueChange={(val) => handleTypeChange(val)} defaultValue="income">
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
                                            <FormLabel>Date</FormLabel>
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
            )}
        </>
    );
}