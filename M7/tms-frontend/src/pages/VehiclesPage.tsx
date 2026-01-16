import { ErrorMessage, LoadingPage } from "../components";
import { useVehiclesList } from "../hooks/queries";
import LiveFleetMap from "./vehicles/LiveFleetMap";
import { VehicleFilters } from "./vehicles/VehicleFilters";
import { VehiclesList } from "./vehicles/VehiclesList";
import { VehiclesPageHeader } from "./vehicles/VehiclesPageHeader";
import { VehiclesTable } from "./vehicles/VehiclesTable";
import { useVehicleFilters } from "./vehicles/useVehicleFilters";

const VehiclesPage = () => {
  const { data: vehicles = [], isLoading, error, refetch } = useVehiclesList();
  const { filteredVehicles, view, filterProps } = useVehicleFilters(vehicles);

  if (isLoading) return <LoadingPage />;
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorMessage
          error={
            error instanceof Error ? error.message : "Failed to load vehicles"
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VehiclesPageHeader />
      <LiveFleetMap vehicles={vehicles} />
      <div className="space-y-4">
        <VehicleFilters {...filterProps} />
        {view === "grid" ? (
          <VehiclesList vehicles={filteredVehicles} />
        ) : (
          <VehiclesTable vehicles={filteredVehicles} />
        )}
      </div>
    </div>
  );
};

export default VehiclesPage;
