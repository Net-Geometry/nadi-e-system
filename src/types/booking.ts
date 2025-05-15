import { Asset } from "./asset"
import { Profile } from "./auth"

export interface Booking {
    id: string,
    asset_id: number,
    nd_asset?: Asset,
    profiles?: Profile,
    requester_id: string,
    booking_start: string,
    booking_end: string,
    is_using?: boolean,
    created_by: string,
    updated_by?: string,
    created_at: string,
    updated_at?: string
};