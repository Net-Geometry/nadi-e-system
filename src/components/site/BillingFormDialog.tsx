import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from '@/components/ui/file-upload';

interface BillingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
}

const BillingFormDialog: React.FC<BillingFormDialogProps> = ({ open, onOpenChange, siteId }) => {
  const [formState, setFormState] = useState({
    type_id: '',
    date_issued: '',
    reference_no: '',
    amount_bill: '',
    remark: '',
  });

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      try {
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', { ...formState, site_id: siteId });
    onOpenChange(false);
  };

  const setField = (field: string, value: any) => {
    setFormState((prevState) => ({ ...prevState, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Billing</DialogTitle>
          <DialogDescription>Enter billing details and upload a file.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="type_id">Type ID</label>
            <Input id="type_id" name="type_id" value={formState.type_id} onChange={(e) => setField('type_id', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="date_issued">Date Issued</label>
            <Input id="date_issued" name="date_issued" type="date" value={formState.date_issued} onChange={(e) => setField('date_issued', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="reference_no">Reference No</label>
            <Input id="reference_no" name="reference_no" value={formState.reference_no} onChange={(e) => setField('reference_no', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="amount_bill">Amount Bill</label>
            <Input id="amount_bill" name="amount_bill" type="number" value={formState.amount_bill} onChange={(e) => setField('amount_bill', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="remark">Remark</label>
            <Textarea id="remark" name="remark" value={formState.remark} onChange={(e) => setField('remark', e.target.value)} />
          </div>
          <FileUpload
            maxFiles={1}
            acceptedFileTypes=".jpg,.png,.pdf"
            maxSizeInMB={2}
            buttonText="Choose File"
            onFilesSelected={handleFilesSelected}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" >Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillingFormDialog;