import { Brand } from "./brand";
import { Site } from "./site";
import { Booking } from "./booking";

export interface Asset {
  id: number;
  name: string;
  site_id?: number;
  site?: Site;
  brand_id?: number;
  nd_brand?: Brand;
  is_active?: boolean;
  nd_booking?: Booking[];
  remark?: string;
  asset_group?: string;
  type_id?: number;
  type?: AssetType;
  nd_site?: Site[];
  retail_type?: number;
  subtype_id?: number;
  serial_number?: string;
  qty_unit?: number;
  date_expired?: string;
  date_install?: string;
  date_warranty_tp?: string;
  date_warranty_supplier?: string;
  location_id?: number;
  asset_mobility?: string;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface AssetStatsData {
  total: number;
  active: number;
  maintenance: number;
}

export interface AssetStatsCardProps {
  title: string;
  value: string;
  color?: string;
  description: string;
}

export interface AssetCategory {
  id: number;
  name: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface AssetType {
  id: number;
  name: string;
  category_id: number;
  category: AssetCategory;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
export interface ErrorFallbackProps {
  error: Error;
}
