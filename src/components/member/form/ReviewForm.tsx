import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, User } from "lucide-react";

type ReviewData = {
  fullname: string;
  identity_no: string;
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

  isUnder12: boolean;
  parent_fullname?: string;
  parent_ic_no?: string;
  parent_mobile_no?: string;
  parent_relationship_id?: string;
  parent_address1?: string;
  parent_address2?: string;
  parent_state_id?: string;
  parent_district_id?: string;
  parent_city?: string;
  parent_postcode?: string;

  address1: string;
  address2: string;
  state_id: string;
  district_id: string;
  city: string;
  postcode: string;
  distance: string;

  nationality_id: string;
  race_id: string;
  ethnic_id: string;
  occupation_id: string;
  type_sector: string;
  socio_id: string;
  income_range: string;
  ict_knowledge: string;
  education_level: string;
  oku_status: boolean | null;

  pdpa_declare: boolean | null;
  agree_declare: boolean | null;
};

type ReviewFormProps = ReviewData & {
  updateFields: (fields: Partial<ReviewData>) => void;
  genders: { id: string; eng: string }[];
  statusMemberships: { id: string; name: string }[];
  siteProfiles: { id: string; fullname: string }[];
  states: { id: string; name: string }[];
  districts: { id: string; name: string }[];
  nationalities: { id: string; eng: string }[];
  races: { id: string; eng: string }[];
  ethnics: { id: string; eng: string }[];
  occupations: { id: string; eng: string }[];
  typeSectors: { id: string; eng: string }[];
  socioeconomics: { id: string; eng: string }[];
  incomeLevels: { id: string; eng: string }[];
  ictKnowledge: { id: string; eng: string }[];
  educationLevels: { id: string; eng: string }[];
  typeRelationships?: { id: string; eng: string }[];
  registrationMethods?: { id: string; eng: string }[];

};

export function ReviewForm({
  fullname,
  identity_no,
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

  isUnder12,
  parent_fullname,
  parent_ic_no,
  parent_mobile_no,
  parent_relationship_id,
  parent_address1,
  parent_address2,
  parent_state_id,
  parent_district_id,
  parent_city,
  parent_postcode,

  address1,
  address2,
  state_id,
  district_id,
  city,
  postcode,
  distance,

  nationality_id,
  race_id,
  ethnic_id,
  occupation_id,
  type_sector,
  socio_id,
  income_range,
  ict_knowledge,
  education_level,
  oku_status,

  genders,
  statusMemberships,
  siteProfiles,
  states,
  districts,
  nationalities,
  races,
  ethnics,
  occupations,
  typeSectors,
  socioeconomics,
  incomeLevels,
  ictKnowledge,
  educationLevels,
  typeRelationships,
  registrationMethods,

  pdpa_declare,
  agree_declare,
  updateFields,
}: ReviewFormProps) {
  const [pdpaScrolled, setPdpaScrolled] = useState(false);
  const [agreeScrolled, setAgreeScrolled] = useState(false);
  const [isAgreeDialogOpen, setIsAgreeDialogOpen] = useState(false);
  const [isPdpaDialogOpen, setIsPdpaDialogOpen] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, setScrolled: (value: boolean) => void) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight) {
      setScrolled(true);
    }
  };

  return (
    <>
      <DialogTitle className="mb-4">Review Details</DialogTitle>

      <div className="border rounded-md p-4">
        <h3 className="font-semibold mb-2 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Full Name */}
          <div>
            <span className="text-muted-foreground">Full Name:</span>
            <p>{fullname || "Not Provided"}</p>
          </div>

          {/* IC Number */}
          <div>
            <span className="text-muted-foreground">IC Number:</span>
            <p>{identity_no || "Not Provided"}</p>
          </div>

          {/* NADI Site */}
          <div>
            <span className="text-muted-foreground">NADI Site:</span>
            <p>
              {ref_id
                ? siteProfiles.find((site) => site.id.toString() === ref_id)?.fullname || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* Community Status */}
          <div>
            <span className="text-muted-foreground">Community Status:</span>
            <p>
              {community_status === true
                ? "Active"
                : community_status === false
                  ? "Inactive"
                  : "Not Specified"}
            </p>
          </div>

          {/* Gender */}
          <div>
            <span className="text-muted-foreground">Gender:</span>
            <p>
              {gender
                ? genders.find((gen) => gen.id.toString() === gender)?.eng || "Not Specified"
                : "Not Specified"}
            </p>
          </div>

          {/* Membership Status */}
          <div>
            <span className="text-muted-foreground">Membership Status:</span>
            <p>
              {status_membership
                ? statusMemberships.find((membership) => membership.id.toString() === status_membership)?.name || "Not Specified"
                : "Not Specified"}
            </p>
          </div>

          {/* Entrepreneur Status */}
          <div>
            <span className="text-muted-foreground">Entrepreneur Status:</span>
            <p>
              {status_entrepreneur === true
                ? "Active"
                : status_entrepreneur === false
                  ? "Inactive"
                  : "Not Specified"}
            </p>
          </div>

          {/* Date of Birth */}
          <div>
            <span className="text-muted-foreground">Date of Birth:</span>
            <p>{dob ? dob.split("-").reverse().join("/") : "Not Provided"}</p>
          </div>

          {/* Mobile Number */}
          <div>
            <span className="text-muted-foreground">Mobile Number:</span>
            <p>{mobile_no || "Not Provided"}</p>
          </div>

          {/* Email */}
          <div>
            <span className="text-muted-foreground">Email:</span>
            <p>{email || "Not Provided"}</p>
          </div>

          {/* Join Date */}
          <div>
            <span className="text-muted-foreground">Join Date:</span>
            <p>{join_date ? join_date.split("-").reverse().join("/") : "Not Provided"}</p>
          </div>


          {/* Registration Method */}
          <div>
            <span className="text-muted-foreground">Registration Method:</span>
            <p>
              {register_method
                ? registrationMethods.find((registerMethod) => registerMethod.id.toString() === register_method)?.eng || "Not Specified"
                : "Not Specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Guardian Personal Information - only show if isUnder12 is true */}
      {isUnder12 && (
        <div className="border rounded-md p-4 mt-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <User className="h-4 w-4 mr-2" />
            Guardian Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Guardian Full Name */}
            <div>
              <span className="text-muted-foreground">Full Name:</span>
              <p>{parent_fullname || "Not Provided"}</p>
            </div>
            {/* Guardian IC Number */}
            <div>
              <span className="text-muted-foreground">IC Number:</span>
              <p>{parent_ic_no || "Not Provided"}</p>
            </div>
            {/* Guardian Mobile Number */}
            <div>
              <span className="text-muted-foreground">Mobile Number:</span>
              <p>{parent_mobile_no || "Not Provided"}</p>
            </div>
            {/* Guardian Relationship */}
            <div>
              <span className="text-muted-foreground">Relationship:</span>
              <p>
                {parent_relationship_id
                  ? typeRelationships?.find((rel) => rel.id.toString() === parent_relationship_id)?.eng || "Not Selected"
                  : "Not Selected"}
              </p>
            </div>
            {/* Guardian Address 1 */}
            <div className="col-span-2">
              <span className="text-muted-foreground">Address Line 1:</span>
              <p>{parent_address1 || "Not Provided"}</p>
            </div>
            {/* Guardian Address 2 */}
            <div className="col-span-2">
              <span className="text-muted-foreground">Address Line 2:</span>
              <p>{parent_address2 || "Not Provided"}</p>
            </div>
            {/* Guardian State */}
            <div>
              <span className="text-muted-foreground">State:</span>
              <p>
                {parent_state_id
                  ? states.find((state) => state.id.toString() === parent_state_id)?.name || "Not Selected"
                  : "Not Selected"}
              </p>
            </div>
            {/* Guardian District */}
            <div>
              <span className="text-muted-foreground">District:</span>
              <p>
                {parent_district_id
                  ? districts.find((district) => district.id.toString() === parent_district_id)?.name || "Not Selected"
                  : "Not Selected"}
              </p>
            </div>
            {/* Guardian City */}
            <div>
              <span className="text-muted-foreground">City:</span>
              <p>{parent_city || "Not Provided"}</p>
            </div>
            {/* Guardian Postcode */}
            <div>
              <span className="text-muted-foreground">Postcode:</span>
              <p>{parent_postcode || "Not Provided"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-md p-4  mt-4">
        <h3 className="font-semibold mb-2 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Address Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Address Line 1 */}
          <div className="col-span-2">
            <span className="text-muted-foreground">Address Line 1:</span>
            <p>{address1 || "Not Provided"}</p>
          </div>

          {/* Address Line 2 */}
          <div className="col-span-2">
            <span className="text-muted-foreground">Address Line 2:</span>
            <p>{address2 || "Not Provided"}</p>
          </div>

          {/* State */}
          <div>
            <span className="text-muted-foreground">State:</span>
            <p>
              {state_id
                ? states.find((state) => state.id.toString() === state_id)?.name || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* District */}
          <div>
            <span className="text-muted-foreground">District:</span>
            <p>
              {district_id
                ? districts.find((district) => district.id.toString() === district_id)?.name || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* City */}
          <div>
            <span className="text-muted-foreground">City:</span>
            <p>{city || "Not Provided"}</p>
          </div>

          {/* Postcode */}
          <div>
            <span className="text-muted-foreground">Postcode:</span>
            <p>{postcode || "Not Provided"}</p>
          </div>

          {/* Distance */}
          <div>
            <span className="text-muted-foreground">Distance from NADI (km):</span>
            <p>{distance || "Not Provided"}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-md p-4  mt-4">
        <h3 className="font-semibold mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Demographic Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Nationality */}
          <div>
            <span className="text-muted-foreground">Nationality:</span>
            <p>
              {nationality_id
                ? nationalities.find((nationality) => nationality.id.toString() === nationality_id)?.eng || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* Race */}
          <div>
            <span className="text-muted-foreground">Race:</span>
            <p>
              {race_id
                ? races.find((race) => race.id.toString() === race_id)?.eng || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* Ethnic */}
          <div>
            <span className="text-muted-foreground">Ethnic:</span>
            <p>
              {ethnic_id
                ? ethnics.find((ethnic) => ethnic.id.toString() === ethnic_id)?.eng || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* Occupation */}
          <div>
            <span className="text-muted-foreground">Occupation:</span>
            <p>
              {occupation_id
                ? occupations.find((occupation) => occupation.id.toString() === occupation_id)?.eng || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* Sector */}
          <div>
            <span className="text-muted-foreground">Sector:</span>
            <p>
              {type_sector
                ? typeSectors.find((sector) => sector.id.toString() === type_sector)?.eng || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* Socioeconomic */}
          <div>
            <span className="text-muted-foreground">Socioeconomic:</span>
            <p>
              {socio_id
                ? socioeconomics.find((socioeconomic) => socioeconomic.id.toString() === socio_id)?.eng || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* Socioeconomic */}
          <div>
            <span className="text-muted-foreground">Income Range:</span>
            <p>
              {income_range
                ? incomeLevels.find((income) => income.id.toString() === income_range)?.eng || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* ICT Knowledge */}
          <div>
            <span className="text-muted-foreground">ICT Knowledge:</span>
            <p>
              {ict_knowledge
                ? ictKnowledge.find((ict) => ict.id.toString() === ict_knowledge)?.eng || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* Education Level */}
          <div>
            <span className="text-muted-foreground">Education Level:</span>
            <p>
              {education_level
                ? educationLevels.find((education) => education.id.toString() === education_level)?.eng || "Not Selected"
                : "Not Selected"}
            </p>
          </div>

          {/* OKU Status */}
          <div>
            <span className="text-muted-foreground">OKU Status:</span>
            <p>
              {oku_status === true
                ? "Yes"
                : oku_status === false
                  ? "No"
                  : "Not Specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Agree Declaration */}
      <div className="space-y-2 flex items-center mt-4">
        <Dialog open={isAgreeDialogOpen} onOpenChange={setIsAgreeDialogOpen}>
          <DialogTrigger asChild>
            <Checkbox
              id="agree_declare_checkbox"
              checked={agree_declare || false}
              className="ml-2 cursor-pointer"
            />
          </DialogTrigger>
          <DialogContent>
            <div
              className="max-h-96 overflow-y-auto"
              onScroll={(e) => handleScroll(e, setAgreeScrolled)}
            >
              <p>
                {/* Replace this with the actual terms and conditions content */}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.

                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.

                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.

                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.

                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.
                {/* Add more content to make it scrollable */}
              </p>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  updateFields({ agree_declare: false });
                  setIsAgreeDialogOpen(false); // Close the dialog
                }}
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  updateFields({ agree_declare: true });
                  setIsAgreeDialogOpen(false); // Close the dialog
                }}
                disabled={!agreeScrolled} // Disable until scrolled to the bottom
              >
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Label htmlFor="agree_declare_checkbox" className="ml-2">
          I agree to the{" "}
          <span
            className="text-blue-500 underline cursor-pointer"
          >
            Terms and Conditions
          </span>
        </Label>
      </div>

      {/* PDPA Declaration */}
      <div className="space-y-2 flex items-center">
        <Dialog open={isPdpaDialogOpen} onOpenChange={setIsPdpaDialogOpen}>
          <DialogTrigger asChild>
            <Checkbox
              id="pdpa_declare_checkbox"
              checked={pdpa_declare || false}
              className="ml-2 cursor-pointer"
            />
          </DialogTrigger>
          <DialogContent>
            <div
              className="max-h-96 overflow-y-auto"
              onScroll={(e) => handleScroll(e, setPdpaScrolled)}
            >
              <p>
                {/* Replace this with the actual PDPA notice content */}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.

                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.

                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.

                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.

                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                vehicula, lorem a tincidunt fermentum, justo ligula vehicula
                nunc, at vehicula ligula lorem non nulla. Curabitur euismod
                sapien nec nisi tincidunt, non tincidunt lorem tincidunt.
                {/* Add more content to make it scrollable */}
              </p>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  updateFields({ pdpa_declare: false });
                  setIsPdpaDialogOpen(false); // Close the dialog
                }}
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  updateFields({ pdpa_declare: true });
                  setIsPdpaDialogOpen(false); // Close the dialog
                }}
                disabled={!pdpaScrolled} // Disable until scrolled to the bottom
              >
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Label htmlFor="pdpa_declare_checkbox" className="ml-2">
          I declare that I have read and understood the{" "}
          <span
            className="text-blue-500 underline cursor-pointer"
          >
            PDPA notice
          </span>
        </Label>
      </div>
    </>
  );
}