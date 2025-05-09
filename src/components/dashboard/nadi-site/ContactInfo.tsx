import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User } from "lucide-react";

const ContactInfo = () => {
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
                    Phone Number
                  </label>
                  <p className="text-base">+60 3-8888 9999</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-base">contact@nadi-cyberjaya.my</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Management</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <h4 className="font-medium">Manager</h4>
                </div>
                <div className="pl-6">
                  <p className="text-sm">Nurul Huda binti Ahmad</p>
                  <p className="text-sm text-muted-foreground">
                    manager@nadi-cyberjaya.my
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <h4 className="font-medium">Assistant Manager</h4>
                </div>
                <div className="pl-6">
                  <p className="text-sm">Lee Jia Xin</p>
                  <p className="text-sm text-muted-foreground">
                    assistant@nadi-cyberjaya.my
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInfo;
