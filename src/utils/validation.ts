/**
 * Validation Utilities
 * Form validation and constraint checking for Resources, Events, Planner
 */

import { Resource, PlannerTask, CampaignEvent, ResourceType } from '../../types';

// ============================================
// RESOURCE VALIDATION
// ============================================

export interface ResourceValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    quantity?: string;
    allocated?: string;
    general?: string;
  };
}

export const validateResource = (resource: Partial<Resource>): ResourceValidationResult => {
  const errors: ResourceValidationResult['errors'] = {};

  // Name validation
  if (!resource.name || resource.name.trim().length === 0) {
    errors.name = 'Resource name is required';
  } else if (resource.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (resource.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  // Quantity validation
  if (resource.quantity === undefined || resource.quantity === null) {
    errors.quantity = 'Total capacity is required';
  } else if (resource.quantity < 0) {
    errors.quantity = 'Capacity cannot be negative';
  } else if (resource.type === ResourceType.BUDGET && resource.quantity > 100000000) {
    errors.quantity = 'Budget cannot exceed ₹10 crore';
  }

  // Allocated validation
  if (resource.allocated !== undefined && resource.allocated !== null) {
    if (resource.allocated < 0) {
      errors.allocated = 'Allocated amount cannot be negative';
    } else if (resource.quantity !== undefined && resource.allocated > resource.quantity) {
      errors.allocated = 'Allocated cannot exceed total capacity';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Check if a resource can be deleted (not assigned to any active events)
export const canDeleteResource = (
  resourceId: string,
  events: CampaignEvent[]
): { canDelete: boolean; reason?: string; affectedEvents?: string[] } => {
  const activeEvents = events.filter(
    e => (e.status === 'Planned' || e.status === 'Active') &&
         e.assignedResources.includes(resourceId)
  );

  if (activeEvents.length > 0) {
    return {
      canDelete: false,
      reason: `Resource is assigned to ${activeEvents.length} active/planned event(s)`,
      affectedEvents: activeEvents.map(e => e.title)
    };
  }

  return { canDelete: true };
};

// ============================================
// PLANNER TASK VALIDATION
// ============================================

export interface TaskValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    timeSlot?: string;
    track?: string;
    overlap?: string;
    general?: string;
  };
}

export const validateTask = (
  task: Partial<PlannerTask>,
  existingTasks: PlannerTask[],
  editingTaskId?: string
): TaskValidationResult => {
  const errors: TaskValidationResult['errors'] = {};

  // Title validation
  if (!task.title || task.title.trim().length === 0) {
    errors.title = 'Activity title is required';
  } else if (task.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters';
  }

  // Time slot validation
  if (!task.timeSlot) {
    errors.timeSlot = 'Time slot is required';
  }

  // Track validation
  if (!task.track) {
    errors.track = 'Track is required';
  }

  // Overlap validation - check if slot is already taken
  if (task.timeSlot && task.track) {
    const conflictingTask = existingTasks.find(
      t => t.timeSlot === task.timeSlot &&
           t.track === task.track &&
           t.id !== editingTaskId
    );

    if (conflictingTask) {
      errors.overlap = `This slot already has "${conflictingTask.title}" scheduled`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================
// EVENT VALIDATION
// ============================================

export interface EventValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    date?: string;
    time?: string;
    location?: string;
    resources?: string;
    general?: string;
  };
}

export const validateEvent = (event: Partial<CampaignEvent>): EventValidationResult => {
  const errors: EventValidationResult['errors'] = {};

  // Title validation
  if (!event.title || event.title.trim().length === 0) {
    errors.title = 'Event title is required';
  } else if (event.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  // Date validation
  if (!event.date) {
    errors.date = 'Event date is required';
  }

  // Time validation
  if (!event.time) {
    errors.time = 'Event time is required';
  }

  // Location validation
  if (!event.location || event.location.trim().length === 0) {
    errors.location = 'Location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Check resource availability for an event
export const checkResourceAvailability = (
  resourceId: string,
  resources: Resource[],
  events: CampaignEvent[],
  excludeEventId?: string
): { available: boolean; currentUsage: number; capacity: number } => {
  const resource = resources.find(r => r.id === resourceId);
  if (!resource) {
    return { available: false, currentUsage: 0, capacity: 0 };
  }

  // Count usage in active/planned events (excluding current event if editing)
  const usage = events.filter(
    e => (e.status === 'Planned' || e.status === 'Active') &&
         e.assignedResources.includes(resourceId) &&
         e.id !== excludeEventId
  ).length;

  return {
    available: usage < resource.quantity,
    currentUsage: usage,
    capacity: resource.quantity
  };
};
