import { fetchClosure_Status } from "@/components/site/queries/site-closure";


// site closure status
export const getStatusMap = async (): Promise<Record<string, number>> => {
    const statuses = await fetchClosure_Status();
    return statuses.reduce((map, status) => {
        map[status.name.toUpperCase().replace(/\s+/g, "_")] = status.id;
        return map;
    }, {} as Record<string, number>);
};
