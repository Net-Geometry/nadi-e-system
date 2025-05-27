
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VendorStaffCardProps {
  vendorProfile: any;
}

interface StaffMember {
  id: number;
  fullname: string;
  work_email: string;
  mobile_no: string;
  position_id: number;
  is_active: boolean;
}

const VendorStaffCard: React.FC<VendorStaffCardProps> = ({ vendorProfile }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendorProfile) {
      fetchStaff();
    }
  }, [vendorProfile]);

  const fetchStaff = async () => {
    try {
      const { data: staffData, error } = await supabase
        .from("nd_vendor_staff")
        .select("id, fullname, work_email, mobile_no, position_id, is_active")
        .eq("registration_number", vendorProfile.id)
        .eq("position_id", 2)
        .order("fullname");

      if (error) throw error;
      setStaff(staffData || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading staff members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Staff Members ({staff.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No staff members found
          </div>
        ) : (
          <div className="space-y-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {member.fullname}
                    </h3>
                    <Badge variant={member.is_active ? "default" : "secondary"}>
                      {member.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">Staff</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {member.work_email}
                    </div>
                    {member.mobile_no && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {member.mobile_no}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorStaffCard;
