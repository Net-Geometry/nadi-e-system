import React from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Search, Download, FilePlus } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleExport: () => void;
  handleNewRequest: () => void;
  isDUSPUser: boolean;
  isMCMCUser: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  handleExport,
  handleNewRequest,
  isDUSPUser,
  isMCMCUser,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
      <div className="relative w-full sm:w-auto flex-1">
        <Input
          type="text"
          placeholder="Search closures..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 h-10 w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      <div className="flex gap-2 self-end">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        {!isDUSPUser && !isMCMCUser && (
          <Button
            className="flex items-center gap-2"
            onClick={handleNewRequest}
          >
            <FilePlus className="h-4 w-4" />
            New Closure Request
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
