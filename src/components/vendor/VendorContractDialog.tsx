
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CheckCircle, XCircle, Clock, FileText } from "lucide-react";

interface VendorContract {
  id?: number;
  registration_number: string;
  contract_start?: string;
  contract_end?: string;
  duration?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface VendorContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendorCompany: {
    id: number;
    business_name: string;
    registration_number: string;
  } | null;
  onContractUpdated: () => void;
}

interface ContractFormData {
  contract_start: string;
  contract_end: string;
  duration: number;
}

const VendorContractDialog: React.FC<VendorContractDialogProps> = ({
  isOpen,
  onClose,
  vendorCompany,
  onContractUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [existingContract, setExistingContract] = useState<VendorContract | null>(null);
  const { toast } = useToast();

  const form = useForm<ContractFormData>({
    defaultValues: {
      contract_start: "",
      contract_end: "",
      duration: 12,
    },
  });

  useEffect(() => {
    if (isOpen && vendorCompany) {
      fetchExistingContract();
    }
  }, [isOpen, vendorCompany]);

  const fetchExistingContract = async () => {
    if (!vendorCompany) return;

    try {
      const { data, error } = await supabase
        .from("nd_vendor_contract")
        .select("*")
        .eq("registration_number", vendorCompany.registration_number)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingContract(data);
        form.reset({
          contract_start: data.contract_start || "",
          contract_end: data.contract_end || "",
          duration: data.duration || 12,
        });
      } else {
        setExistingContract(null);
        form.reset({
          contract_start: "",
          contract_end: "",
          duration: 12,
        });
      }
    } catch (error: any) {
      console.error("Error fetching contract:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contract details",
        variant: "destructive",
      });
    }
  };

  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  const onSubmit = async (data: ContractFormData) => {
    if (!vendorCompany) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const contractData = {
        registration_number: vendorCompany.registration_number,
        contract_start: data.contract_start || null,
        contract_end: data.contract_end || null,
        duration: data.duration,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      };

      let result;
      if (existingContract) {
        result = await supabase
          .from("nd_vendor_contract")
          .update(contractData)
          .eq("id", existingContract.id);
      } else {
        result = await supabase
          .from("nd_vendor_contract")
          .insert({
            ...contractData,
            created_at: new Date().toISOString(),
            created_by: user.id,
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Contract ${existingContract ? 'updated' : 'created'} successfully`,
      });

      onContractUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error managing contract:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to manage contract",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    form.setValue("contract_start", startDate);
    
    const endDate = form.getValues("contract_end");
    if (startDate && endDate) {
      const duration = calculateDuration(startDate, endDate);
      form.setValue("duration", duration);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value;
    form.setValue("contract_end", endDate);
    
    const startDate = form.getValues("contract_start");
    if (startDate && endDate) {
      const duration = calculateDuration(startDate, endDate);
      form.setValue("duration", duration);
    }
  };

  const getContractStatus = () => {
    if (!existingContract || !existingContract.contract_start) {
      return { status: "No Contract", icon: XCircle, color: "bg-gray-500" };
    }

    const today = new Date();
    const startDate = new Date(existingContract.contract_start);
    const endDate = existingContract.contract_end ? new Date(existingContract.contract_end) : null;

    if (endDate && today > endDate) {
      return { status: "Expired", icon: XCircle, color: "bg-red-500" };
    } else if (today >= startDate && (!endDate || today <= endDate)) {
      return { status: "Active", icon: CheckCircle, color: "bg-green-500" };
    } else if (today < startDate) {
      return { status: "Pending", icon: Clock, color: "bg-yellow-500" };
    }

    return { status: "Inactive", icon: XCircle, color: "bg-gray-500" };
  };

  if (!vendorCompany) return null;

  const contractStatus = getContractStatus();
  const StatusIcon = contractStatus.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Management - {vendorCompany.business_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-700">Current Status</Label>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon className={`h-4 w-4 text-white`} />
                <Badge className={`${contractStatus.color} text-white`}>
                  {contractStatus.status}
                </Badge>
              </div>
            </div>
            {existingContract && (
              <div className="text-right">
                <Label className="text-sm font-medium text-gray-700">Registration Number</Label>
                <p className="text-sm text-gray-600">{vendorCompany.registration_number}</p>
              </div>
            )}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_start">Contract Start Date</Label>
                <Input
                  id="contract_start"
                  type="date"
                  {...form.register("contract_start")}
                  onChange={handleStartDateChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_end">Contract End Date</Label>
                <Input
                  id="contract_end"
                  type="date"
                  {...form.register("contract_end")}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Months)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...form.register("duration", { valueAsNumber: true })}
                placeholder="Contract duration in months"
              />
            </div>

            {existingContract && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Contract Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Start Date:</span>
                    <p className="text-blue-800">
                      {existingContract.contract_start 
                        ? new Date(existingContract.contract_start).toLocaleDateString()
                        : "Not set"
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">End Date:</span>
                    <p className="text-blue-800">
                      {existingContract.contract_end 
                        ? new Date(existingContract.contract_end).toLocaleDateString()
                        : "Not set"
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Duration:</span>
                    <p className="text-blue-800">{existingContract.duration || 0} months</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Status:</span>
                    <p className="text-blue-800">
                      {existingContract.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (existingContract ? "Update Contract" : "Create Contract")}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorContractDialog;
