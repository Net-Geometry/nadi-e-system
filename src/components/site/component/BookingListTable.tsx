import { cn } from "@/lib/utils";
import { PaginationTable } from "./PaginationTable";

export interface BodyTableData {
    userName: string,
    bookingAssetTypeName: string,
    startTime: string,
    endTime: string,
    duration: string
}

interface BookingListTableProps {
    headTable: Record<string, string>[],
    bodyTableData: BodyTableData[],
    withTableTitle?: boolean
    className?: string
    isFacility?: boolean
}

export const BookingListsTable = ({
    headTable,
    bodyTableData,
    isFacility,
    withTableTitle = true,
    className
}: BookingListTableProps) => {

    return (
        <div className={cn("mt-8 space-y-7 overflow-hidden", className)}>
            { withTableTitle && (
                <h1 className="font-bold text-2xl text-center">Recent Booking</h1>
            )}
            <PaginationTable 
                headTable={headTable}
                bodyTableData={bodyTableData}
            />
        </div>
    )
}