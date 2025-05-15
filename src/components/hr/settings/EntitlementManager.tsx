import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface LeaveType {
  id: number;
  name: string;
  code: string;
  color_code: string;
  total: number;
  attachment: boolean;
}

interface ContractType {
  id: number;
  name: string;
}

interface LeaveEntitlement {
  id: number;
  contract_type_id: number;
  annual_leave_day: number;
  pro_rate_formula: string;
}

const leaveTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  colorCode: z.string().min(1, "Color code is required"),
  total: z.coerce.number().min(0, "Total must be a positive number"),
  attachment: z.boolean().default(false),
});

const entitlementSchema = z.object({
  contractTypeId: z.coerce.number(),
  annualLeaveDays: z.coerce
    .number()
    .min(0, "Leave days must be a positive number"),
  proRateFormula: z.string().optional(),
});

type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;
type EntitlementFormValues = z.infer<typeof entitlementSchema>;

export const EntitlementManager = () => {
  const [leaveTypeDialog, setLeaveTypeDialog] = useState(false);
  const [entitlementDialog, setEntitlementDialog] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(
    null
  );
  const [selectedEntitlement, setSelectedEntitlement] =
    useState<LeaveEntitlement | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const leaveTypeForm = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: "",
      code: "",
      colorCode: "#6E41E2",
      total: 0,
      attachment: false,
    },
  });

  const entitlementForm = useForm<EntitlementFormValues>({
    resolver: zodResolver(entitlementSchema),
    defaultValues: {
      contractTypeId: 0,
      annualLeaveDays: 0,
      proRateFormula: "",
    },
  });

  // Fetch leave types
  const { data: leaveTypes, isLoading: loadingLeaveTypes } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_leave_type")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      return data as LeaveType[];
    },
  });

  // Fetch contract types
  const { data: contractTypes, isLoading: loadingContractTypes } = useQuery({
    queryKey: ["contractTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_contract_type")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      return data as ContractType[];
    },
  });

  // Fetch leave entitlements
  const { data: entitlements, isLoading: loadingEntitlements } = useQuery({
    queryKey: ["leaveEntitlements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nd_leave_entitlement")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      return data as LeaveEntitlement[];
    },
  });

  // Create new leave type
  const createLeaveType = useMutation({
    mutationFn: async (values: LeaveTypeFormValues) => {
      const { data, error } = await supabase.from("nd_leave_type").insert([
        {
          name: values.name,
          code: values.code,
          color_code: values.colorCode,
          total: values.total,
          attachment: values.attachment,
        },
      ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      toast({
        title: "Success",
        description: "Leave type has been added successfully",
      });
      setLeaveTypeDialog(false);
      leaveTypeForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add leave type: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update existing leave type
  const updateLeaveType = useMutation({
    mutationFn: async (values: LeaveTypeFormValues & { id: number }) => {
      const { data, error } = await supabase
        .from("nd_leave_type")
        .update({
          name: values.name,
          code: values.code,
          color_code: values.colorCode,
          total: values.total,
          attachment: values.attachment,
        })
        .eq("id", values.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      toast({
        title: "Success",
        description: "Leave type has been updated successfully",
      });
      setLeaveTypeDialog(false);
      leaveTypeForm.reset();
      setSelectedLeaveType(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update leave type: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete leave type
  const deleteLeaveType = useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await supabase
        .from("nd_leave_type")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      toast({
        title: "Success",
        description: "Leave type has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete leave type: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Create new entitlement
  const createEntitlement = useMutation({
    mutationFn: async (values: EntitlementFormValues) => {
      const { data, error } = await supabase
        .from("nd_leave_entitlement")
        .insert([
          {
            contract_type_id: values.contractTypeId,
            annual_leave_day: values.annualLeaveDays,
            pro_rate_formula: values.proRateFormula,
          },
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveEntitlements"] });
      toast({
        title: "Success",
        description: "Leave entitlement has been added successfully",
      });
      setEntitlementDialog(false);
      entitlementForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add leave entitlement: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update existing entitlement
  const updateEntitlement = useMutation({
    mutationFn: async (values: EntitlementFormValues & { id: number }) => {
      const { data, error } = await supabase
        .from("nd_leave_entitlement")
        .update({
          contract_type_id: values.contractTypeId,
          annual_leave_day: values.annualLeaveDays,
          pro_rate_formula: values.proRateFormula,
        })
        .eq("id", values.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveEntitlements"] });
      toast({
        title: "Success",
        description: "Leave entitlement has been updated successfully",
      });
      setEntitlementDialog(false);
      entitlementForm.reset();
      setSelectedEntitlement(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update leave entitlement: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete entitlement
  const deleteEntitlement = useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await supabase
        .from("nd_leave_entitlement")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveEntitlements"] });
      toast({
        title: "Success",
        description: "Leave entitlement has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete leave entitlement: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddLeaveType = () => {
    setSelectedLeaveType(null);
    leaveTypeForm.reset({
      name: "",
      code: "",
      colorCode: "#6E41E2",
      total: 0,
      attachment: false,
    });
    setLeaveTypeDialog(true);
  };

  const handleEditLeaveType = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    leaveTypeForm.reset({
      name: leaveType.name,
      code: leaveType.code,
      colorCode: leaveType.color_code,
      total: leaveType.total,
      attachment: leaveType.attachment,
    });
    setLeaveTypeDialog(true);
  };

  const handleAddEntitlement = () => {
    setSelectedEntitlement(null);
    entitlementForm.reset({
      contractTypeId:
        contractTypes && contractTypes.length > 0 ? contractTypes[0].id : 0,
      annualLeaveDays: 0,
      proRateFormula: "",
    });
    setEntitlementDialog(true);
  };

  const handleEditEntitlement = (entitlement: LeaveEntitlement) => {
    setSelectedEntitlement(entitlement);
    entitlementForm.reset({
      contractTypeId: entitlement.contract_type_id,
      annualLeaveDays: entitlement.annual_leave_day,
      proRateFormula: entitlement.pro_rate_formula,
    });
    setEntitlementDialog(true);
  };

  const submitLeaveTypeForm = (values: LeaveTypeFormValues) => {
    if (selectedLeaveType) {
      updateLeaveType.mutate({ ...values, id: selectedLeaveType.id });
    } else {
      createLeaveType.mutate(values);
    }
  };

  const submitEntitlementForm = (values: EntitlementFormValues) => {
    if (selectedEntitlement) {
      updateEntitlement.mutate({ ...values, id: selectedEntitlement.id });
    } else {
      createEntitlement.mutate(values);
    }
  };

  return (
    <div className="space-y-8">
      {/* Leave Types Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Leave Types</h3>
          <Button
            onClick={handleAddLeaveType}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Leave Type</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingLeaveTypes ? (
            <div className="col-span-full flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : leaveTypes && leaveTypes.length > 0 ? (
            leaveTypes.map((leaveType) => (
              <Card key={leaveType.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {leaveType.name}
                      </CardTitle>
                      <CardDescription>Code: {leaveType.code}</CardDescription>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: leaveType.color_code }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    <span className="font-medium">Days: </span>
                    {leaveType.total}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Requires Attachment: </span>
                    {leaveType.attachment ? "Yes" : "No"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditLeaveType(leaveType)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteLeaveType.mutate(leaveType.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center p-6 border rounded-md">
              <p className="text-muted-foreground">No leave types configured</p>
            </div>
          )}
        </div>
      </div>

      {/* Contract Entitlements Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Contract Entitlements</h3>
          <Button
            onClick={handleAddEntitlement}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Entitlement</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left">Contract Type</th>
                <th className="px-4 py-2 text-left">Annual Leave Days</th>
                <th className="px-4 py-2 text-left">Pro-Rate Formula</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingEntitlements || loadingContractTypes ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : entitlements && entitlements.length > 0 ? (
                entitlements.map((entitlement) => {
                  const contractType = contractTypes?.find(
                    (ct) => ct.id === entitlement.contract_type_id
                  );
                  return (
                    <tr key={entitlement.id} className="border-b">
                      <td className="px-4 py-3">
                        {contractType ? contractType.name : "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        {entitlement.annual_leave_day}
                      </td>
                      <td className="px-4 py-3">
                        {entitlement.pro_rate_formula || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEntitlement(entitlement)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              deleteEntitlement.mutate(entitlement.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No entitlements configured
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Type Dialog */}
      <Dialog open={leaveTypeDialog} onOpenChange={setLeaveTypeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedLeaveType ? "Edit Leave Type" : "Add Leave Type"}
            </DialogTitle>
            <DialogDescription>
              Configure leave type details and settings.
            </DialogDescription>
          </DialogHeader>

          <Form {...leaveTypeForm}>
            <form
              onSubmit={leaveTypeForm.handleSubmit(submitLeaveTypeForm)}
              className="space-y-4"
            >
              <FormField
                control={leaveTypeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Annual Leave" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={leaveTypeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={leaveTypeForm.control}
                  name="colorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            {...field}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={leaveTypeForm.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Days</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Default number of days for this leave type
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={leaveTypeForm.control}
                name="attachment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Require Attachment</FormLabel>
                      <FormDescription>
                        Check if documentation is required for this leave type
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    createLeaveType.isPending || updateLeaveType.isPending
                  }
                >
                  {createLeaveType.isPending || updateLeaveType.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    <span>Save</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Entitlement Dialog */}
      <Dialog open={entitlementDialog} onOpenChange={setEntitlementDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEntitlement ? "Edit Entitlement" : "Add Entitlement"}
            </DialogTitle>
            <DialogDescription>
              Configure contract-based leave entitlements.
            </DialogDescription>
          </DialogHeader>

          <Form {...entitlementForm}>
            <form
              onSubmit={entitlementForm.handleSubmit(submitEntitlementForm)}
              className="space-y-4"
            >
              <FormField
                control={entitlementForm.control}
                name="contractTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Type</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contractTypes &&
                          contractTypes.map((contractType) => (
                            <SelectItem
                              key={contractType.id}
                              value={contractType.id.toString()}
                            >
                              {contractType.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entitlementForm.control}
                name="annualLeaveDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Leave Days</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Number of leave days allocated annually
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entitlementForm.control}
                name="proRateFormula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pro-Rate Formula (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., days/12*months_worked"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Formula for calculating pro-rated leave
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    createEntitlement.isPending || updateEntitlement.isPending
                  }
                >
                  {createEntitlement.isPending ||
                  updateEntitlement.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    <span>Save</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
