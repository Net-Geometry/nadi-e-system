import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User } from "lucide-react";

type Staff = {
  id: number;
  fullname?: string;
  work_email?: string;
  position_id?: { name?: string };
};

type Site = {
  website?: string;
  email?: string;
  // ...other fields if needed
};

type ContactInfoProps = {
  staffData: Staff[];
  site: Site;
};

const ContactInfo = ({ staffData, site }: ContactInfoProps) => {
  return (
    <Card className="mb-6" id="contact">
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">General Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Website
                  </label>
                  <p className="text-base">
                    {site?.website?.trim() ? site.website : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-base">
                    {site?.email?.trim() ? site.email : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Management</h3>
            <div className="space-y-4">
              {staffData?.length > 0 ? (
                staffData.map((staff) => (
                  <div key={staff.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <h4 className="font-medium">
                        {staff.position_id?.name ?? "N/A"}
                      </h4>
                    </div>
                    <div className="pl-6">
                      <p className="text-sm">{staff.fullname ?? "N/A"}</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.work_email ?? "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No staff data available.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInfo;