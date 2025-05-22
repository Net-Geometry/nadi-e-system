import { useState } from "react";
import { useBookingQueries } from "./booking/use-booking-queries";
import { useDebounce } from "@/hooks/use-debounce";

interface FilterProps {
  searchInput: string,
  region: string,
  state: string
}

export const useSitePaginationServer = (
  initialPage: number,
  perPage: number,
  dusp_tp_id: string
) => {
  const [page, setPage] = useState(initialPage);
  const { useTpsSitesWithPagination } = useBookingQueries();
  const [filter, setFilter] = useState<FilterProps>({
    searchInput: "",
    region: "0",
    state: "0"
  });
  const searchInputDebounce = useDebounce(filter.searchInput, 500);
  const convertedFilter = {
    searchInput: searchInputDebounce,
    region: Number(filter.region),
    state: Number(filter.state)
  }

  console.log("All the filter value", convertedFilter)

  const { 
    data: sitesResult, 
    isLoading: isSiteResultLoading 
  } = useTpsSitesWithPagination(dusp_tp_id, page, perPage, {...convertedFilter});

  return {
    page,
    setPage,
    isSiteResultLoading,
    filter,
    setFilter,
    sitesResult
  };
};