import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ApproverUserTypesProps {
  selectedUserTypes: string[];
  onToggle: (userTypeId: string) => void;
}

export function ApproverUserTypes({
  selectedUserTypes,
  onToggle,
}: ApproverUserTypesProps) {
  // Fetch roles from the roles table
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
        id: role.name, // Using name as the id
        name: role.name
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        description: role.description,
      }));
    },
  });

  return (
    <div className="space-y-3">
      <Label>Approver User Types</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {userTypes.map((userType) => (
          <div key={userType.id} className="flex items-center space-x-2">
            <Checkbox
              id={`userType-${userType.id}`}
              checked={selectedUserTypes.includes(userType.id)}
              onCheckedChange={() => onToggle(userType.id)}
            />
            <label
              htmlFor={`userType-${userType.id}`}
              className="text-sm cursor-pointer"
              title={userType.description || ""}
            >
              {userType.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
