import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface BookingListTableProps {
    headTable: string[],
    bodyTableData: {
        userName: string,
        bookingAssetTypeName: string,
        startTime: string,
        endTime: string,
        duration: string
    }[]
}

export const BookingListsTable = ({
    headTable,
    bodyTableData
}: BookingListTableProps) => {

    return (
        <div className="mt-8 space-y-7 overflow-hidden">
                <h1 className="font-bold text-2xl text-center">Recent Booking</h1>
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <Table className="w-full table-auto border-collapse text-sm">
                <TableHeader>
                    <TableRow>
                        {
                            headTable.map((head) => (
                                <TableHead key={head}>{head}</TableHead>
                            ))
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* SOON: UI for 0 booking */}
                    {
                        bodyTableData.map((bookingItem, index) => (
                            <TableRow className="hover:bg-gray-200">
                                <TableCell>{bookingItem.userName}</TableCell>
                                <TableCell>{bookingItem.bookingAssetTypeName}</TableCell>
                                <TableCell>{bookingItem.startTime}</TableCell>
                                <TableCell>{bookingItem.endTime}</TableCell>
                                <TableCell>{bookingItem.duration}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
                </Table>
                </div>
            </div>
    )
}