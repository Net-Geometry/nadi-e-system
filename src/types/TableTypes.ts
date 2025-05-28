export interface ColumnConfig {
  id: string;
  header: string;
  cell: (item: any, index?: number) => React.ReactNode;
  sortable: boolean;
}

export interface ClosureData {
  id: number;
  nd_site_profile?: {
    sitename?: string;
    nd_site?: Array<{ standard_code?: string }>;
    organizations?: {
      name?: string;
      id?: string;
      parent_id?: {
        name?: string;
        id?: string;
      };
    };
    region_id?: {
      eng?: string;
    };
    state_id?: {
      name?: string;
    };
  };
  profiles?: {
    full_name?: string;
    user_type?: string;
  };
  nd_closure_categories?: {
    eng?: string;
    id?: number;
  };
  nd_closure_status?: {
    name?: string;
    id?: number;
  };
  duration?: number;
  request_datetime?: string;
  created_at?: string;
  created_by?: number;
}

export interface ClosurePageProps {
  siteId?: string;
}
