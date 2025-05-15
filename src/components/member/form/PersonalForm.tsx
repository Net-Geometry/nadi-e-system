import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { debounce } from "lodash"; // Import lodash debounce
import { SiteProfileSelect } from "../components/SiteProfileSelect";
import { useSiteProfiles } from "../hook/useSiteProfile";
import { DialogTitle } from "@/components/ui/dialog";

type PersonalData = {
  fullname: string;
  ref_id: string;
  community_status: boolean | string | null;
  dob: string;
  mobile_no: string;
  email: string;
  gender: string;
  status_membership: string;
  status_entrepreneur: boolean | string | null;
  join_date: string;
  register_method: string;
};

type PersonalFormProps = PersonalData & {
  updateFields: (fields: Partial<PersonalData>) => void;
  genders: { id: string; eng: string }[];
  statusMemberships: { id: string; name: string }[];
  registrationMethods: { id: string; eng: string }[];
};

export function PersonalForm({
  fullname,
  ref_id,
  community_status,
  dob,
  mobile_no,
  email,
  gender,
  status_membership,
  status_entrepreneur,
  join_date,
  register_method,
  updateFields,
  genders,
  statusMemberships,
  registrationMethods,
}: PersonalFormProps) {



  const { profiles = [], loading, error: siteProfilesError } = useSiteProfiles();

  return (
    <>
      <DialogTitle className="mb-4">Personal Information</DialogTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label className="flex items-center">
            Full Name <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            autoFocus
            required
            type="text"
            name="fullname"
            value={fullname}
            onChange={(e) => updateFields({ fullname: e.target.value })}
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label className="flex items-center">Date of Birth <span className="text-red-500 ml-1">*</span></Label>
          <Input
            type="date"
            value={dob}
            onChange={(e) => updateFields({ dob: e.target.value })}
            required
          />
        </div>

        {/* Site ID */}
        <div className="space-y-2">
          <Label className="flex items-center">
            NADI Site (Registered Location)
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <SiteProfileSelect
            profiles={profiles}
            value={ref_id ? parseInt(ref_id) : null}
            onValueChange={(value) => updateFields({ ref_id: value.toString() })}
            disabled={loading}
          />
          {loading && (
            <p className="text-sm text-muted-foreground">Loading NADI site...</p>
          )}
          {siteProfilesError && (
            <p className="text-sm text-destructive">{siteProfilesError}</p>
          )}
        </div>



        {/* Mobile Number */}
        <div className="space-y-2">
          <Label className="flex items-center">Mobile Number<span className="text-red-500 ml-1">*</span></Label>
          <Input
            type="tel"
            value={mobile_no}
            onChange={(e) => updateFields({ mobile_no: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="flex items-center">Email<span className="text-red-500 ml-1">*</span></Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => updateFields({ email: e.target.value })}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="flex items-center">Gender<span className="text-red-500 ml-1">*</span></Label>
          <Select
            value={gender || ""}
            onValueChange={(value) => updateFields({ gender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender.id} value={gender.id.toString()}>
                  {gender.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Membership Status */}
        <div className="space-y-2">
          <Label className="flex items-center">Membership Status<span className="text-red-500 ml-1">*</span></Label>
          <Select
            value={status_membership || ""}
            onValueChange={(value) => updateFields({ status_membership: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status membership" />
            </SelectTrigger>
            <SelectContent>
              {statusMemberships.map((membership) => (
                <SelectItem key={membership.id} value={membership.id.toString()}>
                  {membership.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Community Status */}
        <div className="space-y-2">
          <Label className="flex items-center">MADANI Community Status</Label>
          <RadioGroup
            value={community_status?.toString() ?? "null"}
            onValueChange={(value) =>
              updateFields({ community_status: value === "true" ? true : value === "false" ? false : null })
            }
          >
            <div className="flex items-center space-x-4 mt-3">
              <RadioGroupItem value="true" id="community_status_yes" />
              <Label htmlFor="community_status_yes">Yes</Label>
              <RadioGroupItem value="false" id="community_status_no" />
              <Label htmlFor="community_status_no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Entrepreneur Status */}
        <div className="space-y-2">
          <Label className="flex items-center">Entrepreneur Status</Label>
          <RadioGroup
            value={status_entrepreneur?.toString() ?? "null"}
            onValueChange={(value) =>
              updateFields({ status_entrepreneur: value === "true" ? true : value === "false" ? false : null })
            }
          >
            <div className="flex items-center space-x-4 mt-3">
              <RadioGroupItem value="true" id="status_entrepreneur_yes" />
              <Label htmlFor="status_entrepreneur_yes">Yes</Label>
              <RadioGroupItem value="false" id="status_entrepreneur_no" />
              <Label htmlFor="status_entrepreneur_no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Join Date */}
        <div className="space-y-2">
          <Label className="flex items-center">Join Date <span className="text-red-500 ml-1">*</span></Label>
          <Input
            type="date"
            value={join_date}
            onChange={(e) => updateFields({ join_date: e.target.value })}
            required
          />
        </div>

        {/* Registration Method */}
        <div className="space-y-2">
          <Label className="flex items-center">Registration Method</Label>
          <Select
            value={register_method || ""}
            onValueChange={(value) => updateFields({ register_method: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select registration method" />
            </SelectTrigger>
            <SelectContent>
              {registrationMethods.map((registrationMethod) => (
                <SelectItem key={registrationMethod.id} value={registrationMethod.id.toString()}>
                  {registrationMethod.eng}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

    </>
  );
}