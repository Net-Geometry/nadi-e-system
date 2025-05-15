import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";
import { PersonalForm } from "@/components/member/form/PersonalForm";
import { AddressForm } from "@/components/member/form/AddressForm";
import { DemographicForm } from "@/components/member/form/DemographicForm";
import { ReviewForm } from "@/components/member/form/ReviewForm";
import { AccountForm } from "@/components/member/form/AccountForm";
import { useMultistepForm } from "@/components/member/hook/useMultipleForm";
import { useToast } from "@/hooks/use-toast";
import useGeneralData from "@/hooks/use-general-data";
import useSiteGeneralData from "@/hooks/use-site-general-data";
import useGeoData from "./hook/use-geo-data-simple";
import { insertMemberData } from "@/components/member/hook/use-registration-form";
import { ICForm } from "@/components/member/form/ICForm";

type FormData = {
  identity_no_type: string;
  identity_no: string;
  isIcNumberValid: boolean; // check if valid
  isUnder12: boolean;
  parent_fullname: string;
  parent_ic_no: string;
  parent_relationship_id: string;
  parent_mobile_no: string;
  parent_address1: string;
  parent_address2: string;
  parent_district_id: string;
  parent_state_id: string;
  parent_city: string;
  parent_postcode: string;


  fullname: string;
  ref_id: string;
  community_status: boolean;
  dob: string;
  mobile_no: string;
  email: string;
  gender: string;
  registration_status: boolean;
  status_membership: string;
  status_entrepreneur: boolean;
  join_date: string;
  register_method: string;

  nationality_id: string;
  race_id: string;
  ethnic_id: string;
  occupation_id: string;
  type_sector: string;
  socio_id: string;
  ict_knowledge: string;
  education_level: string;
  oku_status: boolean;
  income_range: string;

  distance: string;
  address1: string;
  address2: string;
  district_id: string;
  state_id: string;
  city: string;
  postcode: string;

  pdpa_declare: boolean;
  agree_declare: boolean;

  password: string;
  confirmPassword: string;
};

const INITIAL_DATA: FormData = {
  identity_no_type: null,
  identity_no: "",
  isIcNumberValid: false,
  isUnder12: false,
  parent_fullname: "",
  parent_ic_no: "",
  parent_relationship_id: null,
  parent_mobile_no: "",
  parent_address1: "",
  parent_address2: "",
  parent_district_id: null,
  parent_state_id: null,
  parent_city: "",
  parent_postcode: "",

  fullname: "",
  ref_id: null,
  community_status: false,
  dob: null,
  mobile_no: "",
  email: "",
  gender: null,
  registration_status: true,
  status_membership: "1",
  status_entrepreneur: false,
  join_date: new Date().toLocaleDateString('en-CA'), // 'YYYY-MM-DD' in local time
  register_method: "3",
  nationality_id: null,
  race_id: null,
  ethnic_id: null,
  occupation_id: null,
  type_sector: null,
  socio_id: null,
  ict_knowledge: null,
  education_level: null,
  oku_status: false,
  income_range: null,
  distance: null,
  address1: "",
  address2: "",
  district_id: null,
  state_id: null,
  city: "",
  postcode: "",
  pdpa_declare: false,
  agree_declare: false,
  password: "",
  confirmPassword: "",
};

const RegistrationDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(false); // Add loading state
  const { genders, statusMemberships, nationalities, races, ethnics, occupations, typeSectors, socioeconomics, incomeLevels, ictKnowledge, educationLevels, identityNoTypes, typeRelationships, registrationMethods } = useGeneralData();
  const { siteProfiles } = useSiteGeneralData();
  const { states, districts, fetchDistrictsByState } = useGeoData();
  const { toast } = useToast();

  function updateFields(fields: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...fields }));
  }

  const showValidationError = (description: string) => {
    toast({
      title: "Validation Error",
      description,
      variant: "destructive",
    });
  };

  const { currentStepIndex, step, isFirstStep, isLastStep, back, next, reset } = useMultistepForm([
    <ICForm  {...data} updateFields={updateFields} identityNoTypes={identityNoTypes} states={states} districts={districts} fetchDistrictsByState={fetchDistrictsByState} typeRelationships={typeRelationships} />,
    <PersonalForm genders={genders} statusMemberships={statusMemberships} registrationMethods={registrationMethods}  {...data} updateFields={updateFields} />,
    <AddressForm states={states} districts={districts} fetchDistrictsByState={fetchDistrictsByState} {...data} updateFields={updateFields} />,
    <DemographicForm nationalities={nationalities} races={races} ethnics={ethnics} occupations={occupations} typeSectors={typeSectors} socioeconomics={socioeconomics} incomeLevels={incomeLevels} ictKnowledge={ictKnowledge} educationLevels={educationLevels} {...data} updateFields={updateFields} />,
    <ReviewForm genders={genders} statusMemberships={statusMemberships} siteProfiles={siteProfiles} districts={districts} states={states} nationalities={nationalities} races={races} ethnics={ethnics} occupations={occupations} typeSectors={typeSectors} socioeconomics={socioeconomics} incomeLevels={incomeLevels} ictKnowledge={ictKnowledge} educationLevels={educationLevels} typeRelationships={typeRelationships} registrationMethods={registrationMethods} {...data} updateFields={updateFields} />,
    <AccountForm {...data} updateFields={updateFields} />,
  ]);

  const steps = [
    { label: "Identity Number", validate: () => data.identity_no_type && data.identity_no && data.isIcNumberValid },
    { label: "Personal Info", validate: () => data.fullname && data.ref_id && data.dob && data.join_date && data.mobile_no && data.email && data.gender && data.status_membership },
    { label: "Address", validate: () => data.state_id && data.district_id },
    { label: "Demographics", validate: () => data.nationality_id && data.race_id && data.ethnic_id },
    { label: "Review", validate: () => data.agree_declare && data.pdpa_declare },
  ];

  function isStepComplete(index: number) {
    return steps[index].validate();
  }

  const handleNext = async () => {
    if (currentStepIndex === 0) {
      if (!data.identity_no_type) return showValidationError("Identity type is required.");
      if (!data.identity_no) return showValidationError("IC number is required is required.");

      if (data.identity_no_type === "1") {
        if (data.identity_no.length !== 12) return showValidationError("IC number must be 12 digits.");
      }

      if (!data.isIcNumberValid) return showValidationError("Identity number is already exist in the system.");
      if (data.isUnder12) {
        if (!data.parent_fullname) return showValidationError("Guardian's Fullname is required.");
        if (!data.parent_ic_no) return showValidationError("Guardian's IC Number is required.");
        if (!data.parent_relationship_id) return showValidationError("Guardian's Relationship is required.");
        if (!data.parent_mobile_no) return showValidationError("Guardian's Mobile Number is required.");
        if (!data.parent_address1) return showValidationError("Guardian's Address Line 1 is required.");
        if (!data.parent_district_id) return showValidationError("Guardian's District is required.");
        if (!data.parent_state_id) return showValidationError("Guardian's State is required.");
        if (!data.parent_postcode) return showValidationError("Guardian's Postcode is required.");
      }
    }

    if (currentStepIndex === 1) {
      if (!data.fullname) return showValidationError("Fullname is required.");
      if (!data.ref_id) return showValidationError("Site is required.");
      if (!data.dob) return showValidationError("Date of Birth is required.");
      if (!data.join_date) return showValidationError("Join Date is required.");
      if (!data.identity_no) return showValidationError("IC Number is required.");
      if (!data.mobile_no) return showValidationError("Mobile Number is required.");
      if (!data.email) return showValidationError("Email is required.");
      if (!data.gender) return showValidationError("Gender is required.");
      if (!data.status_membership) return showValidationError("Membership status is required.");
    }

    if (currentStepIndex === 2) {
      if (!data.state_id) return showValidationError("State is required.");
      if (!data.district_id) return showValidationError("District is required.");
    }

    if (currentStepIndex === 3) {
      if (!data.nationality_id) return showValidationError("Nationality is required.");
      if (!data.race_id) return showValidationError("Race is required.");
      if (!data.ethnic_id) return showValidationError("Ethnic is required.");
    }

    if (currentStepIndex === 4) {
      if (!data.agree_declare) return showValidationError("Please agree to Terms and Conditions before proceeding.");
      if (!data.pdpa_declare) return showValidationError("Please agree to the PDPA declaration before proceeding.");
    }
    if (currentStepIndex === 5) {
      if (!data.password) return showValidationError("Please enter a password.");
      if (!data.confirmPassword) return showValidationError("Please confirm your password.");
      if (data.password !== data.confirmPassword) return showValidationError("Passwords do not match.");
    }

    if (!isLastStep) {
      next();
    } else {
      try {
        setLoading(true); // Start loading
        await insertMemberData(data);
        toast({
          title: "Success",
          description: "The new member has been successfully registered.",
          variant: "default",
        });
        setData(INITIAL_DATA);
        reset();
        onClose();
      } catch (error: any) {
        console.error("Error saving data:", error);
        toast({
          title: "Error",
          description: "Failed to save data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={() => {
      setData(INITIAL_DATA); // Reset the form data
      reset();
      onClose(); // Call the original onClose function
    }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
            <span className="ml-3 text-lg font-semibold">Registering...</span>
          </div>
        )}
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2">Add New Member</DialogTitle>
          <div className="flex bg-muted rounded-lg overflow-hidden">
            {steps.map((step, index) => {
              const isActive = currentStepIndex === index;
              const isCompleted = isStepComplete(index);

              return (
                <div
                  key={index}
                  className={`flex-1 px-4 py-2 flex items-center justify-center space-x-2 text-sm transition-all 
                  ${isActive ? "bg-white font-semibold text-foreground shadow-sm dark:text-black" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  {isCompleted && <CheckCircle className="text-green-500" size={16} />}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </DialogHeader>
        <form onSubmit={(e: FormEvent) => e.preventDefault()}>
          <div >{step}</div>
          <DialogFooter className="flex justify-between w-full mt-4">
            <div>
              {!isFirstStep ? (
                <Button type="button" onClick={back} variant="outline" disabled={loading}>
                  Back
                </Button>
              ) : (
                <div />
              )}
            </div>
            <div>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!data.isIcNumberValid || loading} // disables if falsy or loading
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Registering...
                  </>
                ) : (
                  isLastStep ? "Register Member" : "Next"
                )}
              </Button>
            </div>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationDialog;