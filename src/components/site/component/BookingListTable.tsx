import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { NoBookingFound } from "./NoBookingFound";
import { FolderXIcon } from "lucide-react";

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
            <div>
                <Table className="w-full table-auto border-collapse text-sm bg-white rounded-md">
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
                        {
                            bodyTableData.map((bookingItem, index) => (
                                <TableRow key={index} className="hover:bg-gray-200">
                                    <TableCell className="font-semibold">{bookingItem.userName}</TableCell>
                                    <TableCell>{bookingItem.bookingAssetTypeName}</TableCell>
                                    <TableCell>{bookingItem.startTime}</TableCell>
                                    <TableCell>{bookingItem.endTime}</TableCell>
                                    <TableCell>{bookingItem.duration}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                { bodyTableData.length === 0 && (
                    <NoBookingFound
                        description="No Recent Booking"
                        icon={<FolderXIcon className="mx-auto mb-2 h-10 w-10 text-gray-500" />}
                        title="No PC Booking Recently"
                        className="w-full bg-white rounded-md mt-3 py-6 border border-gray-300"
                    />
                )}
            </div>
        </div>
    )
}