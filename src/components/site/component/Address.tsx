import { MapPin, Home, Mail, Building } from "lucide-react";

const Address = ({ address }: { address: any }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Address Line 1 */}
      <div>
        <p className="text-sm text-gray-500 flex items-center">
          <Home className="h-4 w-4 mr-1 text-gray-500" /> Address Line 1:
        </p>
        <p className="text-base font-medium">{address?.address1 || "Not specified"}</p>
      </div>

      {/* Address Line 2 */}
      <div>
        <p className="text-sm text-gray-500 flex items-center">
          <Home className="h-4 w-4 mr-1 text-gray-500" /> Address Line 2:
        </p>
        <p className="text-base font-medium">{address?.address2 || "Not specified"}</p>
      </div>

      {/* District */}
      <div>
        <p className="text-sm text-gray-500 flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-500" /> District:
        </p>
        <p className="text-base font-medium">{address?.district_id?.name || "Not specified"}</p>
      </div>

      {/* State */}
      <div>
        <p className="text-sm text-gray-500 flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-500" /> State:
        </p>
        <p className="text-base font-medium">{address?.state_id?.name || "Not specified"}</p>
      </div>

      {/* City */}
      <div>
        <p className="text-sm text-gray-500 flex items-center">
          <Building className="h-4 w-4 mr-1 text-gray-500" /> City:
        </p>
        <p className="text-base font-medium">{address?.city || "Not specified"}</p>
      </div>

      {/* Postcode */}
      <div>
        <p className="text-sm text-gray-500 flex items-center">
          <Mail className="h-4 w-4 mr-1 text-gray-500" /> Postcode:
        </p>
        <p className="text-base font-medium">{address?.postcode || "Not specified"}</p>
      </div>
    </div>
  );
};

export default Address;