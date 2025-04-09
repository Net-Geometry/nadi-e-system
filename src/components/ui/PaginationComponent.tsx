
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    totalItems: number;
    startItem?: number;
    endItem?: number;
}

export const PaginationComponent = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    pageSize = 20,
    totalItems,
    startItem: customStartItem,
    endItem: customEndItem
}: PaginationProps) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const startItem = customStartItem !== undefined ? customStartItem : Math.min(((currentPage - 1) * pageSize) + 1, totalItems);
    const endItem = customEndItem !== undefined ? customEndItem : Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
            </Button>
            <span className="text-sm text-gray-600">
                Showing {startItem}-{endItem} of {totalItems}
            </span>
            <Button variant="outline" onClick={handleNext} disabled={currentPage === totalPages}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
    );
};
