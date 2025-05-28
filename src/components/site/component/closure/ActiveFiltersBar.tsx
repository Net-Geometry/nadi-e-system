import React from "react";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { X } from "lucide-react";

interface ActiveFiltersBarProps {
  categoryFilters: string[];
  regionFilters: string[];
  stateFilters: string[];
  statusFilters: string[];
  duspFilters: string[];
  tpFilters: string[];
  setCategoryFilters: (filters: string[]) => void;
  setRegionFilters: (filters: string[]) => void;
  setStateFilters: (filters: string[]) => void;
  setStatusFilters: (filters: string[]) => void;
  setDuspFilters: (filters: string[]) => void;
  setTpFilters: (filters: string[]) => void;
  setSelectedCategoryFilters: (filters: string[]) => void;
  setSelectedRegionFilters: (filters: string[]) => void;
  setSelectedStateFilters: (filters: string[]) => void;
  setSelectedStatusFilters: (filters: string[]) => void;
  setSelectedDuspFilters: (filters: string[]) => void;
  setSelectedTpFilters: (filters: string[]) => void;
}

const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  categoryFilters,
  regionFilters,
  stateFilters,
  statusFilters,
  duspFilters,
  tpFilters,
  setCategoryFilters,
  setRegionFilters,
  setStateFilters,
  setStatusFilters,
  setDuspFilters,
  setTpFilters,
  setSelectedCategoryFilters,
  setSelectedRegionFilters,
  setSelectedStateFilters,
  setSelectedStatusFilters,
  setSelectedDuspFilters,
  setSelectedTpFilters,
}) => {
  const hasActiveFilters =
    categoryFilters.length > 0 ||
    regionFilters.length > 0 ||
    stateFilters.length > 0 ||
    statusFilters.length > 0 ||
    duspFilters.length > 0 ||
    tpFilters.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mt-2">
      {categoryFilters.length > 0 && (
        <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
          <span>Category: {categoryFilters.length}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => {
              setCategoryFilters([]);
              setSelectedCategoryFilters([]);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      {regionFilters.length > 0 && (
        <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
          <span>Region: {regionFilters.length}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => {
              setRegionFilters([]);
              setSelectedRegionFilters([]);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      {stateFilters.length > 0 && (
        <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
          <span>State: {stateFilters.length}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => {
              setStateFilters([]);
              setSelectedStateFilters([]);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      {statusFilters.length > 0 && (
        <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
          <span>Status: {statusFilters.length}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => {
              setStatusFilters([]);
              setSelectedStatusFilters([]);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      {duspFilters.length > 0 && (
        <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
          <span>DUSP: {duspFilters.length}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => {
              setDuspFilters([]);
              setSelectedDuspFilters([]);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      {tpFilters.length > 0 && (
        <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
          <span>TP: {tpFilters.length}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => {
              setTpFilters([]);
              setSelectedTpFilters([]);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );
};

export default ActiveFiltersBar;
