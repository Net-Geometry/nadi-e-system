import { UserType } from "@/types/auth";

export interface UserFormData {
  email: string;
  full_name: string;
  user_type: string;
  user_group: string;
  phone_number?: string;
  ic_number: string;
  position_id?: string;
  tech_partner_id?: string;
  organization_id?: string;
  organization_role?: string;
  password?: string;
  confirm_password?: string;
  personal_email?: string;
  join_date?: string;
  qualification?: string;
  dob?: string;
  place_of_birth?: string;
  marital_status?: string;
  race_id?: string;
  religion_id?: string;
  nationality_id?: string;
  // Additional fields for staff management
  mobile_no_2?: string;
  telephone_no?: string;
  telephone_no_2?: string;
  gender_id?: string;
  height?: string;
  weight?: string;
  // Permanent address
  permanent_address1?: string;
  permanent_address2?: string;
  permanent_postcode?: string;
  permanent_city?: string;
  permanent_state?: string;
  // Correspondence address
  same_as_permanent?: boolean;
  correspondence_address1?: string;
  correspondence_address2?: string;
  correspondence_postcode?: string;
  correspondence_city?: string;
  correspondence_state?: string;
  // Work info
  website?: string;
  income_tax_no?: string;
  epf_no?: string;
  socso_no?: string;
  bank_name?: string;
  bank_account_no?: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  userType: string;
  userGroup?: string;
  phoneNumber?: string;
  icNumber: string;
  password: string;
  createdBy?: string;
}
