export interface Vendor {
  id: number;
  business_name: string;
  registration_number: string;
  business_type: string;
  phone_number: string;
}

export interface VendorStaffMember {
  id: number;
  fullname: string;
  ic_no: string;
  mobile_no: string;
  work_email: string;
  position_id: number;
  is_active: boolean;
  registration_number: number;
  user_id: string;
  vendor_company?: {
    business_name: string;
    registration_number: string;
    business_type: string;
  };
  contract_status?: {
    is_active: boolean;
    contract_start?: string;
    contract_end?: string;
  };
}
