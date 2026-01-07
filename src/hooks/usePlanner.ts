import { useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export const usePlanner = () => {
  const { tasks, addTask, updateTask, deleteTask, selectedDate, setSelectedDate, isLoading } = useApp();

  // Computed values for planner
  const plannerStats = useMemo(() => {
    const byPriority = {
      high: tasks.filter(t => t.priority === 'High'),
      medium: tasks.filter(t => t.priority === 'Medium'),
      low: tasks.filter(t => t.priority === 'Low')
    };

    const byTrack = {
      candidate: tasks.filter(t => t.track === 'Candidate'),
      fieldTeam: tasks.filter(t => t.track === 'Field Team'),
      digital: tasks.filter(t => t.track === 'Digital')
    };

    // Calculate capacity utilization (tasks per available slots)
    // 16 time slots * 3 tracks = 48 possible slots
    const totalSlots = 16 * 3;
    const usedSlots = tasks.length;
    const capacityUsed = Math.round((usedSlots / totalSlots) * 100);

    return {
      total: tasks.length,
      byPriority,
      byTrack,
      criticalTasks: byPriority.high.length,
      capacityUsed,
      availableSlots: totalSlots - usedSlots
    };
  }, [tasks]);

  // Get task at specific slot and track
  const getTaskAt = useCallback((timeSlot: string, track: string) => {
    return tasks.find(t => t.timeSlot === timeSlot && t.track === track);
  }, [tasks]);

  // Navigate to previous day
  const goToPreviousDay = useCallback(() => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  }, [selectedDate, setSelectedDate]);

  // Navigate to next day
  const goToNextDay = useCallback(() => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  }, [selectedDate, setSelectedDate]);

  // Go to today
  const goToToday = useCallback(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, [setSelectedDate]);

  // Check if selected date is today
  const isToday = useMemo(() => {
    return selectedDate === new Date().toISOString().split('T')[0];
  }, [selectedDate]);

  // Format selected date for display
  const formattedDate = useMemo(() => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [selectedDate]);

  return {
    tasks,
    plannerStats,
    addTask,
    updateTask,
    deleteTask,
    getTaskAt,
    selectedDate,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    isToday,
    formattedDate,
    isLoading
  };
};

export default usePlanner;
