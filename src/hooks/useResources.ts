import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceType } from '../../types';

export const useResources = () => {
  const { resources, addResource, updateResource, deleteResource, isLoading } = useApp();

  // Computed values for resources
  const resourceStats = useMemo(() => {
    const byType = {
      manpower: resources.filter(r => r.type === ResourceType.MANPOWER),
      vehicle: resources.filter(r => r.type === ResourceType.VEHICLE),
      budget: resources.filter(r => r.type === ResourceType.BUDGET)
    };

    const totalBudget = byType.budget.reduce((sum, r) => sum + r.quantity, 0);
    const spentBudget = byType.budget.reduce((sum, r) => sum + r.allocated, 0);
    const remainingBudget = totalBudget - spentBudget;

    const totalManpower = byType.manpower.reduce((sum, r) => sum + r.quantity, 0);
    const activeManpower = byType.manpower.reduce((sum, r) => sum + r.allocated, 0);

    const totalVehicles = byType.vehicle.reduce((sum, r) => sum + r.quantity, 0);
    const activeVehicles = byType.vehicle.reduce((sum, r) => sum + r.allocated, 0);

    return {
      total: resources.length,
      byType,
      budget: {
        total: totalBudget,
        spent: spentBudget,
        remaining: remainingBudget,
        percentUsed: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0
      },
      manpower: {
        total: totalManpower,
        active: activeManpower,
        available: totalManpower - activeManpower,
        percentUsed: totalManpower > 0 ? Math.round((activeManpower / totalManpower) * 100) : 0
      },
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        available: totalVehicles - activeVehicles,
        percentUsed: totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0
      }
    };
  }, [resources]);

  // Get resource by ID
  const getResourceById = (id: string) => resources.find(r => r.id === id);

  return {
    resources,
    resourceStats,
    addResource,
    updateResource,
    deleteResource,
    getResourceById,
    isLoading
  };
};

export default useResources;
