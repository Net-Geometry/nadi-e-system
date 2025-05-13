import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";

type AddressData = {
  address1: string;
  address2: string;
  state_id: string;
  district_id: string;
  city: string;
  postcode: string;
  distance: string;
  isUnder12?: boolean;
  parent_address1?: string;
  parent_address2?: string;
  parent_state_id?: string;
  parent_district_id?: string;
  parent_city?: string;
  parent_postcode?: string;
};

type AddressFormProps = AddressData & {
  updateFields: (fields: Partial<AddressData>) => void;
  states: { id: string; name: string }[];
  districts: { id: string; name: string }[];
  fetchDistrictsByState: (stateId: string) => Promise<void>;
};

export function AddressForm({
  address1,
  address2,
  state_id,
  district_id,
  city,
  postcode,
  distance,
  isUnder12,
  parent_address1,
  parent_address2,
  parent_state_id,
  parent_district_id,
  parent_city,
  parent_postcode,
  updateFields,
  states,
  districts,
  fetchDistrictsByState,
}: AddressFormProps) {
  const [useGuardianAddress, setUseGuardianAddress] = useState(false);

  useEffect(() => {
    if (state_id) {
      fetchDistrictsByState(state_id);
    }
  }, [state_id, fetchDistrictsByState]);

  // When checkbox is checked, copy guardian address to main address fields
  useEffect(() => {
    if (useGuardianAddress && isUnder12) {
      updateFields({
        address1: parent_address1 || "",
        address2: parent_address2 || "",
        state_id: parent_state_id || "",
        district_id: parent_district_id || "",
        city: parent_city || "",
        postcode: parent_postcode || "",
      });
    }
  // eslint-disable-next-line
  }, [useGuardianAddress, isUnder12, parent_address1, parent_address2, parent_state_id, parent_district_id, parent_city, parent_postcode]);

  return (
    <>
      <DialogTitle className="mb-4">Address Information</DialogTitle>
      {isUnder12 && (
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useGuardianAddress}
              onChange={(e) => setUseGuardianAddress(e.target.checked)}
            />
            <span>Use guardian's address</span>
          </label>
        </div>
      )}

      {/* Address Line 1 */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">Address Line 1 <span className="text-red-500 ml-1">*</span></Label>
        <Input
          autoFocus
          required
          type="text"
          value={address1}
          onChange={(e) => updateFields({ address1: e.target.value })}
          disabled={useGuardianAddress && isUnder12}
        />
      </div>

      {/* Address Line 2 */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">Address Line 2</Label>
        <Input
          type="text"
          value={address2}
          onChange={(e) => updateFields({ address2: e.target.value })}
          disabled={useGuardianAddress && isUnder12}
        />
      </div>

      {/* State */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">State <span className="text-red-500 ml-1">*</span></Label>
        <Select
          value={state_id || ""}
          onValueChange={(value) => {
            updateFields({ state_id: value, district_id: null });
          }}
          required
          disabled={useGuardianAddress && isUnder12}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.id} value={state.id.toString()}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">District <span className="text-red-500 ml-1">*</span></Label>
        <Select
          value={district_id || ""}
          onValueChange={(value) => updateFields({ district_id: value })}
          disabled={!state_id || (useGuardianAddress && isUnder12)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.id} value={district.id.toString()}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">City <span className="text-red-500 ml-1">*</span></Label>
        <Input
          required
          type="text"
          value={city}
          onChange={(e) => updateFields({ city: e.target.value })}
          disabled={useGuardianAddress && isUnder12}
        />
      </div>

      {/* Postcode */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">Postcode <span className="text-red-500 ml-1">*</span></Label>
        <Input
          required
          type="text"
          value={postcode}
          onChange={(e) => updateFields({ postcode: e.target.value })}
          disabled={useGuardianAddress && isUnder12}
        />
      </div>

      {/* Distance */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">Distance from NADI (km)</Label>
        <Input
          type="number"
          value={distance}
          onChange={(e) => updateFields({ distance: e.target.value })}
        />
      </div>
    </>
  );
}