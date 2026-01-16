import { useMemo, useState } from "react";
import { Vehicle } from "../../model/vehicles";

type ViewMode = "grid" | "table";
type StatusFilter = "all" | Vehicle["status"];
type TypeFilter = "all" | Vehicle["type"];
type OwnershipFilter = "all" | Vehicle["ownership"]["type"];

export interface VehicleFiltersState {
  searchTerm: string;
  statusFilter: StatusFilter;
  typeFilter: TypeFilter;
  ownershipFilter: OwnershipFilter;
  view: ViewMode;
}

export interface VehicleFiltersResult {
  /** Vehicles after applying all filters */
  filteredVehicles: Vehicle[];
  /** Current view mode */
  view: ViewMode;
  /** Whether any filter is currently active */
  hasActiveFilters: boolean;
  /** Props to spread to VehicleFilters component */
  filterProps: {
    searchTerm: string;
    statusFilter: StatusFilter;
    typeFilter: TypeFilter;
    ownershipFilter: OwnershipFilter;
    view: ViewMode;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: StatusFilter) => void;
    onTypeChange: (value: TypeFilter) => void;
    onOwnershipChange: (value: OwnershipFilter) => void;
    onViewChange: (view: ViewMode) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    resultCount: number;
  };
}

export const useVehicleFilters = (
  vehicles: Vehicle[] = []
): VehicleFiltersResult => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilter>("all");
  const [view, setView] = useState<ViewMode>("grid");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.currentDriver?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || vehicle.status === statusFilter;
      const matchesType = typeFilter === "all" || vehicle.type === typeFilter;
      const matchesOwnership =
        ownershipFilter === "all" || vehicle.ownership.type === ownershipFilter;

      return matchesSearch && matchesStatus && matchesType && matchesOwnership;
    });
  }, [vehicles, searchTerm, statusFilter, typeFilter, ownershipFilter]);

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    ownershipFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setOwnershipFilter("all");
  };

  return {
    filteredVehicles,
    view,
    hasActiveFilters,
    filterProps: {
      searchTerm,
      statusFilter,
      typeFilter,
      ownershipFilter,
      view,
      onSearchChange: setSearchTerm,
      onStatusChange: setStatusFilter,
      onTypeChange: setTypeFilter,
      onOwnershipChange: setOwnershipFilter,
      onViewChange: setView,
      onClearFilters: clearFilters,
      hasActiveFilters,
      resultCount: filteredVehicles.length,
    },
  };
};
