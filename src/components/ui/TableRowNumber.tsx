
import { TableCell } from "@/components/ui/table";

interface TableRowNumberProps {
  index: number;
  startFrom?: number;
}

export const TableRowNumber = ({ 
  index, 
  startFrom = 1 
}: TableRowNumberProps) => {
  return (
    <TableCell className="w-[60px] text-center font-medium">
      {index + startFrom}
    </TableCell>
  );
};
