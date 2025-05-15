import { useState } from "react";
import {
  ApprovalCondition,
  ApprovalConditionType,
  ApprovalOperator,
} from "@/types/workflow";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConditionFormProps {
  onAddCondition: (condition: ApprovalCondition) => void;
}

export function ConditionForm({ onAddCondition }: ConditionFormProps) {
  const [newCondition, setNewCondition] = useState<Partial<ApprovalCondition>>({
    type: "field_value",
    operator: "equals",
    field: "",
    value: "",
  });

  // Fetch roles for user_role condition type
  const { data: userTypes = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("name, description")
        .order("name");

      if (error) {
        console.error("Error fetching roles:", error);
        throw error;
      }

      return data.map((role) => ({
        id: role.name,
        name: role.name
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        description: role.description,
      }));
    },
  });

  const addCondition = () => {
    // Validate the condition before adding
    if (!newCondition.type) return;

    // Make sure value is not empty
    if (typeof newCondition.value === "string" && !newCondition.value.trim()) {
      return;
    }

    const conditionToAdd: ApprovalCondition = {
      id: crypto.randomUUID(),
      type: newCondition.type as ApprovalConditionType,
      operator: newCondition.operator as ApprovalOperator,
      value: newCondition.value!,
      ...(newCondition.field && { field: newCondition.field }),
    };

    onAddCondition(conditionToAdd);

    // Reset the new condition form
    setNewCondition({
      type: "field_value",
      operator: "equals",
      field: "",
      value: "",
    });
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="condition-type">Condition Type</Label>
            <Select
              value={(newCondition.type as string) || "field_value"}
              onValueChange={(value) =>
                setNewCondition({
                  ...newCondition,
                  type: value as ApprovalConditionType,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="field_value">Field Value</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="user_role">User Role</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="sla">SLA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condition-operator">Operator</Label>
            <Select
              value={(newCondition.operator as string) || "equals"}
              onValueChange={(value) =>
                setNewCondition({
                  ...newCondition,
                  operator: value as ApprovalOperator,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Not Equals</SelectItem>
                <SelectItem value="greater_than">Greater Than</SelectItem>
                <SelectItem value="less_than">Less Than</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="not_contains">Not Contains</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newCondition.type === "field_value" && (
            <div>
              <Label htmlFor="condition-field">Field</Label>
              <Input
                id="condition-field"
                value={newCondition.field || ""}
                onChange={(e) =>
                  setNewCondition({ ...newCondition, field: e.target.value })
                }
                placeholder="Field name"
              />
            </div>
          )}

          <div>
            <Label htmlFor="condition-value">
              {newCondition.type === "sla"
                ? "Hours"
                : newCondition.type === "user_role"
                ? "User Type"
                : "Value"}
            </Label>
            {newCondition.type === "user_role" ? (
              <Select
                value={String(newCondition.value || "")}
                onValueChange={(value) =>
                  setNewCondition({ ...newCondition, value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  {userTypes.map((userType) => (
                    <SelectItem key={userType.id} value={userType.id}>
                      {userType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="condition-value"
                value={String(newCondition.value || "")}
                onChange={(e) =>
                  setNewCondition({ ...newCondition, value: e.target.value })
                }
                placeholder={newCondition.type === "sla" ? "Hours" : "Value"}
                type={
                  newCondition.type === "amount" || newCondition.type === "sla"
                    ? "number"
                    : "text"
                }
              />
            )}
          </div>
        </div>

        <Button
          type="button"
          onClick={addCondition}
          className="mt-3"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
      </CardContent>
    </Card>
  );
}
