import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from '@/components/ui/file-upload';
import { useFetchUtilityTypes, useInsertBillingData, useUpdateBillingData } from './hook/use-utilities-data';
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BillingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  initialData?: any; // Optional for update
}

const BillingFormDialog: React.FC<BillingFormDialogProps> = ({ open, onOpenChange, siteId, initialData }) => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    type_id: '',
    year: '',
    month: '',
    reference_no: '',
    amount_bill: '',
    remark: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: utilityTypes } = useFetchUtilityTypes();
  const { insertBillingData, loading: insertLoading, error: insertError } = useInsertBillingData();
  const { updateBillingData, loading: updateLoading, error: updateError } = useUpdateBillingData();

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const utilityData = {
      site_id: Number(siteId),
      type_id: Number(formState.type_id),
      year: Number(formState.year),
      month: Number(formState.month),
      reference_no: formState.reference_no,
      amount_bill: Number(formState.amount_bill),
      remark: formState.remark,
    };

    let result;
    if (initialData) {
      result = await updateBillingData(initialData.id, utilityData, selectedFile, utilityTypes, siteId);
    } else {
      result = await insertBillingData(utilityData, selectedFile, utilityTypes, siteId);
    }

    if (result.success) {
      toast({
        title: "Success",
        description: `Billing Form ${initialData ? 'updated' : 'submitted'} successfully.`,
      });
      onOpenChange(false); // Close dialog
    } else {
      toast({
        title: "Error",
        description: `Error ${initialData ? 'updating' : 'submitting'} billing form. Please try again.`,
        variant: "destructive",
      });
      console.error("Error submitting form:", result.error);
    }
  };

  const setField = (field: string, value: any) => {
    setFormState((prevState) => ({ ...prevState, [field]: value }));
  };

  useEffect(() => {
    if (open && initialData) {
      setFormState({
        type_id: initialData.type_id.toString(),
        year: initialData.year.toString(),
        month: initialData.month.toString(),
        reference_no: initialData.reference_no || '',
        amount_bill: initialData.amount_bill ? initialData.amount_bill.toString() : '',
        remark: initialData.remark || '',
      });
    } else if (!open) {
      setFormState({
        type_id: '',
        year: '',
        month: '',
        reference_no: '',
        amount_bill: '',
        remark: '',
      });
      setSelectedFile(null);
    }
  }, [open, initialData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Update Billing' : 'Add Billing'}</DialogTitle>
          <DialogDescription>Enter billing details and upload a file.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type_id">Type</Label>
            <Select
              name="type_id"
              value={formState.type_id}
              onValueChange={(value) => setField('type_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {utilityTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={formState.year}
                onChange={(e) => setField('year', e.target.value)}
                required
              />
            </div>

            <div className="w-1/2">
              <Label htmlFor="month">Month</Label>
              <Select
                name="month"
                value={formState.month}
                onValueChange={(value) => setField('month', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { id: 1, name: "January" }, { id: 2, name: "February" }, { id: 3, name: "March" },
                    { id: 4, name: "April" }, { id: 5, name: "May" }, { id: 6, name: "June" },
                    { id: 7, name: "July" }, { id: 8, name: "August" }, { id: 9, name: "September" },
                    { id: 10, name: "October" }, { id: 11, name: "November" }, { id: 12, name: "December" }
                  ].map((month) => (
                    <SelectItem key={month.id} value={month.id.toString()}>
                      {month.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_no">Reference No</Label>
            <Input id="reference_no" name="reference_no" value={formState.reference_no} onChange={(e) => setField('reference_no', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount_bill">Amount Bill</Label>
            <Input id="amount_bill" name="amount_bill" type="number" value={formState.amount_bill} onChange={(e) => setField('amount_bill', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea id="remark" name="remark" value={formState.remark} onChange={(e) => setField('remark', e.target.value)} />
          </div>
          <FileUpload
            maxFiles={1}
            acceptedFileTypes=".pdf"
            maxSizeInMB={2}
            buttonText="Choose File"
            onFilesSelected={handleFilesSelected}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={insertLoading || updateLoading}>{initialData ? 'Update' : 'Submit'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillingFormDialog;