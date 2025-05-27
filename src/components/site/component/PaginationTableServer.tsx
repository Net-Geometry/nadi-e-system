import { usePaginationClient } from "@/hooks/use-pagination-client";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, FolderX } from "lucide-react";
import { NoBookingFound } from "./NoBookingFound";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface PaginationTableServer {
    setPage: React.Dispatch<React.SetStateAction<number>>,
    handleSelectedSite: (id: number) => void,
    contentResult: any[],
    headTable: any[]
    page: number
    header?: string
    totalPages: number
    isLoading?: boolean
    isStateLoading?: boolean,
    isRegionLoading?: boolean,
}

export const PaginationTableServer = ({
    contentResult,
    page,
    setPage,
    header,
    headTable,
    totalPages,
    isRegionLoading,
    isStateLoading,
    handleSelectedSite,
    isLoading
}: PaginationTableServer) => {

    const renderCell = (rowItem: any, key: string) => {
        const value = rowItem[key];

        if (key === "inUse") {
            return <Badge className="bg-blue-100 text-black border border-blue-500 ...">{value}</Badge>;
        }
        if (key === "available") {
            return <Badge className="bg-green-100 text-black border border-green-500 ...">{value}</Badge>;
        }
        if (key === "maintenance") {
            return <Badge className="bg-amber-100 text-black border border-amber-500 ...">{value}</Badge>;
        }
        if (key === "action") {
            return (
                <Button onClick={() => handleSelectedSite(rowItem.id)} className="flex items-center gap-1">
                    <Eye />
                </Button>
            );
        }

        return <span className={key === "siteName" ? "font-semibold" : ""}>{value ?? "-"}</span>;
    };

    return (
        <section className="space-y-4 mt-3">
            {header && (
                <div className="w-full flex justify-start">
                    <h1 className="text-2xl font-bold">{header}</h1>
                </div>
            )}
            <Table className="w-full table-auto border-collapse text-sm bg-white rounded-md">
                <TableHeader>
                    <TableRow>
                        {
                            headTable.map((head) => (
                                <TableHead key={head.key}>{head.label}</TableHead>
                            ))
                        }
                    </TableRow>
                </TableHeader>
                {isLoading || isRegionLoading || isStateLoading ? (
                    <TableBody className="flex justify-center">
                        <LoadingSpinner />
                    </TableBody>
                ) : (
                    <TableBody>
                        {contentResult.map((rowItem) => (
                            <TableRow key={rowItem.id}>
                                {headTable.map((col) => (
                                    <TableCell key={col.key}>
                                        {renderCell(rowItem, col.key)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                )}
            </Table>
            {contentResult.length === 0 && (
                <NoBookingFound
                    icon={(<FolderX />)}
                    title="Data Not Found"
                    description="There are no data founded"
                    className="w-full bg-white rounded-md py-6 border border-gray-300"
                />
            )}
            <Pagination className="justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <Button
                            onClick={() => setPage(page => page - 1)}
                            className={page === 1 ? "pointer-events-none opacity-50" : ""}
                        >
                            <ChevronLeft />
                        </Button>
                    </PaginationItem>

                    {(() => {
                        const maxVisiblePages = 5;
                        const pageGroup = Math.floor((page - 1) / maxVisiblePages);
                        const startPage = pageGroup * maxVisiblePages + 1;
                        const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

                        return Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                            const pageNumber = startPage + i;
                            return (
                                <>
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            isActive={pageNumber === page}
                                            onClick={() => setPage(pageNumber)}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            );
                        });
                    })()}

                    <PaginationItem>
                        <Button
                            onClick={() => setPage(page => page + 1)}
                            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                        >
                            <ChevronRight />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </section>
    )
}