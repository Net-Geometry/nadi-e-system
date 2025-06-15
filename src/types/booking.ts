import { Asset } from "./asset"
import { Profile } from "./auth"
import { SiteSpace } from "./site"

export interface Booking {
    id: string,
    asset_id?: number,
    nd_asset?: Asset,
    site_space_id?: number,
    profiles?: Profile,
    requester_id?: string,
    booking_start: string,
    booking_end: string,
    is_active?: boolean,
    created_by: string,
    updated_by?: string,
    created_at?: string,
    site_id?: number,
    purpose?: string,
    nd_site_profile?: {
        id?: number,
        sitename?: string
    },
    nd_site_space?: SiteSpace
    updated_at?: string
};