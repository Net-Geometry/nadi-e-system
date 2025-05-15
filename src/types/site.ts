export interface Site {
  id: string;
  sitename: string;
  standard_code?: string;
  phase_id: string;
  region_id: string;
  active_status: number;
  is_active: boolean;
  email: string;
  website: string;
  longtitude: string;
  latitude: string;
  operate_date: string;
  technology: string;
  bandwidth: string;
  building_type_id: string;
  building_area_id: string;
  building_rental_id: boolean;
  zone_id: string;
  area_id: string;
  level_id: string;
  oku_friendly: boolean;
  dusp_tp_id: string;
  dusp_tp_id_display: string;
  dusp_tp?: {
    id: string;
    name: string;
    parent?: {
      id: string;
      name: string;
    };
  }; // Add dusp_tp field for organization details
  nd_site_status: {
    eng: string;
  };
  nd_site_profile: {
    sitename: string
    state_id: number
  };
  nd_site: {
    id: string;
    standard_code: string;
    refid_tp: string;
    refid_mcmc: string;
  }[];
  nd_phases: {
    name: string;
  };
  nd_region: {
    eng: string;
  };
  nd_site_address: {
    address1: string;
    address2: string;
    postcode: string;
    city: string;
    district_id: string;
    state_id: string;
  }[];
  nd_parliament?: {
    id: string;
  };
  nd_dun?: {
    id: string;
  };
  nd_mukim?: {
    id: string;
  };
  nd_site_socioeconomic: {
    nd_socioeconomics: {
      id: string;
      eng: string;
    };
  }[];
  nd_site_space: {
    nd_space: {
      id: string;
      eng: string;
    };
  }[];
  nd_site_operation?: {
    id: number;
    days_of_week: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }[];
}

export interface SiteStatus {
  id: string;
  eng: string;
}

export interface Phase {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  eng: string;
}

export interface District {
  id: string;
  name: string;
}

export interface Parliament {
  id: string;
  fullname: string;
}

export interface Dun {
  id: string;
  full_name: string;
}

export interface Mukim {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
}

export interface Technology {
  id: string;
  name: string;
}

export interface Bandwidth {
  id: string;
  name: string;
}

export interface BuildingType {
  id: string;
  eng: string;
}

export interface Zone {
  id: string;
  area: string;
  zone: string;
}

export interface CategoryArea {
  id: string;
  name: string;
}

export interface BuildingLevel {
  id: string;
  eng: string;
}

export interface Socioeconomic {
  id: string;
  eng: string;
}
export interface Space {
  id: string;
  eng: string;
}
