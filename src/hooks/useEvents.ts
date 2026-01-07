import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EventStatus } from '../../types';

export const useEvents = () => {
  const { events, resources, addEvent, updateEvent, deleteEvent, isLoading } = useApp();

  // Computed values for events
  const eventStats = useMemo(() => {
    const byStatus = {
      planned: events.filter(e => e.status === 'Planned'),
      active: events.filter(e => e.status === 'Active'),
      completed: events.filter(e => e.status === 'Completed'),
      cancelled: events.filter(e => e.status === 'Cancelled')
    };

    const byType = {
      rally: events.filter(e => e.type === 'Rally'),
      meeting: events.filter(e => e.type === 'Meeting'),
      doorToDoor: events.filter(e => e.type === 'Door-to-Door'),
      digital: events.filter(e => e.type === 'Digital'),
      other: events.filter(e => e.type === 'Other')
    };

    // Calculate resource usage across active/planned events
    const resourceUsage: Record<string, number> = {};
    events.forEach(event => {
      if (event.status !== 'Cancelled' && event.status !== 'Completed') {
        event.assignedResources.forEach(resId => {
          resourceUsage[resId] = (resourceUsage[resId] || 0) + 1;
        });
      }
    });

    // Upcoming events (sorted by date)
    const upcoming = events
      .filter(e => e.status === 'Planned' || e.status === 'Active')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      total: events.length,
      byStatus,
      byType,
      resourceUsage,
      upcoming,
      activeCount: byStatus.active.length,
      plannedCount: byStatus.planned.length
    };
  }, [events]);

  // Check if a resource is available (not at capacity)
  const isResourceAvailable = (resourceId: string): boolean => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return false;
    const currentUsage = eventStats.resourceUsage[resourceId] || 0;
    return currentUsage < resource.quantity;
  };

  // Get available capacity for a resource
  const getResourceAvailability = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return { total: 0, used: 0, available: 0 };
    const used = eventStats.resourceUsage[resourceId] || 0;
    return {
      total: resource.quantity,
      used,
      available: resource.quantity - used
    };
  };

  return {
    events,
    eventStats,
    addEvent,
    updateEvent,
    deleteEvent,
    isResourceAvailable,
    getResourceAvailability,
    isLoading
  };
};

export default useEvents;
