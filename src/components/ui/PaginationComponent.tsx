import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    startItem: number;
    endItem: number;
    totalItems: number;
}

export const PaginationComponent = ({ currentPage, totalPages, onPageChange, startItem, endItem, totalItems }: PaginationProps) => {
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

    return (
        <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>
            <span className="text-sm text-gray-600">
                Showing {startItem}-{endItem} of {totalItems}
            </span>
            <Button variant="outline" onClick={handleNext} disabled={currentPage === totalPages}>
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
