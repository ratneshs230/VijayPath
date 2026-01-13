import React, { useState } from 'react';
import { TIME_SLOTS, PLANNER_TRACKS } from '../constants';
import { PlannerTask } from '../types';
import { usePlanner } from '../src/hooks/usePlanner';
import { useLanguage } from '../src/i18n';
import { validateTask, TaskValidationResult } from '../src/utils/validation';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<PlannerTask, 'id'>) => void;
  task?: PlannerTask | null;
  initialTime?: string;
  initialTrack?: string;
  isSaving?: boolean;
  existingTasks: PlannerTask[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, initialTime, initialTrack, isSaving, existingTasks }) => {
  const [formData, setFormData] = useState<Partial<PlannerTask>>(
    task || {
      title: '',
      description: '',
      timeSlot: initialTime || '09:00',
      track: (initialTrack as any) || 'Candidate',
      priority: 'Medium'
    }
  );
  const [validationErrors, setValidationErrors] = useState<TaskValidationResult['errors']>({});

  React.useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        title: '',
        description: '',
        timeSlot: initialTime || '09:00',
        track: (initialTrack as any) || 'Candidate',
        priority: 'Medium'
      });
    }
    setValidationErrors({});
  }, [task, initialTime, initialTrack]);

  const handleSave = () => {
    const validation = validateTask(formData, existingTasks, task?.id);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors({});
    onSave(formData as Omit<PlannerTask, 'id'>);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{task ? 'Edit Activity' : 'Schedule Activity'}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 text-2xl rounded-lg hover:bg-gray-100" disabled={isSaving}>✕</button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Activity Title</label>
            <input
              type="text"
              className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium ${
                validationErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="e.g. Ward Visit"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            {validationErrors.title && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.title}</p>
            )}
          </div>

          {/* Overlap Warning */}
          {validationErrors.overlap && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700 font-medium flex items-center gap-2">
                <span>⚠️</span> {validationErrors.overlap}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Time Slot</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                value={formData.timeSlot}
                onChange={e => setFormData({...formData, timeSlot: e.target.value})}
              >
                {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Track</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                value={formData.track}
                onChange={e => setFormData({...formData, track: e.target.value as any})}
              >
                {PLANNER_TRACKS.map(track => <option key={track} value={track}>{track}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Priority</label>
            <div className="flex gap-2">
              {['High', 'Medium', 'Low'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({...formData, priority: p as any})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                    formData.priority === p
                    ? (p === 'High' ? 'bg-red-50 border-red-500 text-red-600' : p === 'Medium' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-green-50 border-green-500 text-green-600')
                    : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none text-sm"
              placeholder="What needs to be achieved?"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 min-h-[44px] text-sm font-bold text-gray-500 hover:text-gray-700 active:text-gray-900 transition rounded-xl"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 min-h-[44px] bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 active:bg-orange-800 transition shadow-lg disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : task ? 'Update Activity' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PlannerView: React.FC = () => {
  const { t } = useLanguage();
  const {
    tasks,
    plannerStats,
    addTask,
    updateTask,
    deleteTask,
    getTaskAt,
    selectedDate,
    setSelectedDate,
    goToToday,
    isToday,
    formattedDate,
    isLoading
  } = usePlanner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PlannerTask | null>(null);
  const [targetSlot, setTargetSlot] = useState<{time: string, track: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTask = async (taskData: Omit<PlannerTask, 'id'>) => {
    setIsSaving(true);
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, taskData);
      } else {
        await addTask(taskData);
      }
      setIsModalOpen(false);
      setSelectedTask(null);
      setTargetSlot(null);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSlotClick = (slot: string, track: string) => {
    const existing = getTaskAt(slot, track);
    if (existing) {
      setSelectedTask(existing);
    } else {
      setSelectedTask(null);
      setTargetSlot({ time: slot, track });
    }
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Remove this activity from schedule?')) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-red-500 bg-red-50 text-red-900';
      case 'Medium': return 'border-orange-500 bg-orange-50 text-orange-900';
      case 'Low': return 'border-green-500 bg-green-50 text-green-900';
      default: return 'border-slate-300 bg-slate-50 text-slate-900';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{t.planner.title}</h2>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>

        {/* Date Selection with Calendar */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Calendar Date Picker */}
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-slate-100 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
            />
          </div>

          {/* Today Button */}
          <button
            onClick={goToToday}
            className={`px-6 py-3 min-h-[44px] rounded-xl text-sm font-bold shadow-sm transition whitespace-nowrap ${
              isToday
                ? 'bg-slate-200 text-slate-500 cursor-default'
                : 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800'
            }`}
            disabled={isToday}
          >
            📅 {t.planner.today}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[700px]">
        {/* Header Row */}
        <div className="grid grid-cols-[100px_repeat(3,1fr)] bg-slate-900 text-white sticky top-0 z-20">
          <div className="p-4 text-[10px] font-black uppercase text-slate-500 border-r border-slate-800 text-center flex items-center justify-center">
            Time
          </div>
          {PLANNER_TRACKS.map(track => (
            <div key={track} className="p-4 text-xs font-bold uppercase tracking-widest border-r border-slate-800 flex flex-col items-center">
              <span className="text-orange-500 mb-1">{track === 'Candidate' ? '👤' : track === 'Field Team' ? '🚩' : '📱'}</span>
              {track}
            </div>
          ))}
        </div>

        {/* Planner Body */}
        <div className="divide-y divide-gray-100 overflow-y-auto grid-bg relative flex-1">
          {TIME_SLOTS.map((slot) => (
            <div key={slot} className="grid grid-cols-[100px_repeat(3,1fr)] min-h-[100px] group border-b border-gray-50">
              {/* Time Column */}
              <div className="p-4 flex flex-col items-center justify-start text-xs font-black text-slate-400 border-r border-gray-100 group-hover:bg-gray-50 transition-colors">
                {slot}
                <div className="w-1 h-full bg-slate-100 mt-2 rounded-full" />
              </div>

              {/* Tracks Columns */}
              {PLANNER_TRACKS.map(track => {
                const task = getTaskAt(slot, track);
                return (
                  <div
                    key={`${slot}-${track}`}
                    onClick={() => handleSlotClick(slot, track)}
                    className="p-3 border-r border-gray-50 relative group/slot cursor-pointer hover:bg-orange-50/20 transition-all duration-200"
                  >
                    {task ? (
                      <div className={`h-full border-l-4 p-3 rounded-r-lg shadow-sm transition-transform hover:scale-[1.02] animate-in fade-in slide-in-from-top-1 duration-300 ${getPriorityColor(task.priority)}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-xs uppercase leading-tight">{task.title}</h4>
                          <button
                            onClick={(e) => handleDeleteTask(e, task.id)}
                            className="opacity-0 group-hover/slot:opacity-100 transition-opacity text-[10px] bg-white/50 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white hover:text-red-600"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[10px] opacity-80 line-clamp-2 leading-relaxed">{task.description}</p>
                        <div className="mt-2 pt-2 border-t border-black/5 flex justify-between items-center">
                          <span className="text-[8px] font-black uppercase bg-black/5 px-1 rounded">PR: {task.priority}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="opacity-0 group-hover/slot:opacity-100 transition-all transform scale-90 group-hover/slot:scale-100">
                          <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center text-xl shadow-lg">
                            +
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl">🔥</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">{t.planner.criticalTasks}</p>
            <p className="text-xl font-black">{plannerStats.criticalTasks}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-2xl">📊</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">{t.planner.trackDiversity}</p>
            <p className="text-xl font-black">3 {t.planner.streams}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">⚡</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">{t.planner.capacityUsed}</p>
            <p className="text-xl font-black">{plannerStats.capacityUsed}%</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedTask(null); setTargetSlot(null); }}
          onSave={handleSaveTask}
          task={selectedTask}
          initialTime={targetSlot?.time}
          initialTrack={targetSlot?.track}
          isSaving={isSaving}
          existingTasks={tasks}
        />
      )}
    </div>
  );
};

export default PlannerView;
