import { usePaginationClient } from "@/hooks/use-pagination-client";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CircleDot } from "lucide-react";
import BookingAssetCard from "./BookingAssetCard";

interface PaginationCardProps {
    items: any[]
    isFacility?: boolean
}

export const PaginationCard = ({
    items,
    isFacility
}: PaginationCardProps) => {
    const {
        currentPage,
        currentItems,
        handlePageChange,
        setCurrentPage,
        startIndex,
        totalPages
    } = usePaginationClient(items, 8);

    return (
        <section className="space-y-6">
            <div className="grid grid-cols-4 gap-5 mt-4">
                {currentItems.map((asset, i) => (
                    <BookingAssetCard
                        id={asset.id}
                        key={i}
                        isFacility={isFacility}
                        assetSpec={asset.spec}
                        assetType={asset.type}
                        requesterName={asset.staffName}
                        assetName={asset.name}
                        icon={asset.icon}
                        label={(
                            <Badge className={`${asset.customClass} mt-0 flex items-center gap-1`}>
                                <CircleDot className="size-3" />
                                {asset.status}
                            </Badge>
                        )}
                        status={asset.status}
                        started={asset.startDate}
                        duration={asset.duration}
                        className={`hover:scale-105 hover:shadow-sm hover:shadow-blue-300 ${asset.bgCustomClass}`}
                    />
                ))}
            </div>

            <Pagination className="justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        >
                            <ChevronLeft />
                        </Button>
                    </PaginationItem>

                    {(() => {
                        const maxVisiblePages = 5;
                        const pageGroup = Math.floor((currentPage - 1) / maxVisiblePages);
                        const startPage = pageGroup * maxVisiblePages + 1;
                        const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

                        return Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                            const pageNumber = startPage + i;
                            return (
                                <>
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            isActive={pageNumber === currentPage}
                                            onClick={() => handlePageChange(pageNumber)}
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
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        >
                            <ChevronRight />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </section>
    )
}