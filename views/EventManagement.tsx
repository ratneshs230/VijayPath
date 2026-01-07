import React, { useState } from 'react';
import { CampaignEvent, ResourceType, EventStatus, EventType } from '../types';
import { useEvents } from '../src/hooks/useEvents';
import { useResources } from '../src/hooks/useResources';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CampaignEvent, 'id'>) => void;
  event?: CampaignEvent | null;
  isSaving?: boolean;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, event, isSaving }) => {
  const [formData, setFormData] = useState<Partial<CampaignEvent>>(
    event || {
      title: '',
      type: 'Meeting',
      status: 'Planned',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      location: '',
      description: '',
      assignedResources: []
    }
  );

  React.useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        type: 'Meeting',
        status: 'Planned',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        location: '',
        description: '',
        assignedResources: []
      });
    }
  }, [event]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">{event ? 'Edit Event' : 'Schedule New Event'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" disabled={isSaving}>✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Event Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              placeholder="e.g. Ward 2 Townhall"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Event Type</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as EventType})}
              >
                <option value="Meeting">Meeting</option>
                <option value="Rally">Rally</option>
                <option value="Door-to-Door">Door-to-Door</option>
                <option value="Digital">Digital Event</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as EventStatus})}
              >
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Time</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="10:00 AM"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Location / Venue</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="e.g. Village Primary School"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Objective / Notes</label>
            <textarea
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none text-sm"
              placeholder="What is the primary goal of this event?"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData as Omit<CampaignEvent, 'id'>)}
            className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

const EventManagement: React.FC = () => {
  const { events, eventStats, addEvent, updateEvent, deleteEvent, getResourceAvailability, isLoading } = useEvents();
  const { resources } = useResources();
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CampaignEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.MANPOWER: return '👥';
      case ResourceType.VEHICLE: return '🚗';
      case ResourceType.BUDGET: return '💰';
      default: return '📦';
    }
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'Rally': return '📢';
      case 'Meeting': return '🤝';
      case 'Door-to-Door': return '🏠';
      case 'Digital': return '📱';
      default: return '📍';
    }
  };

  const getStatusStyle = (status: EventStatus) => {
    switch (status) {
      case 'Planned': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Active': return 'bg-green-50 text-green-600 border-green-100';
      case 'Completed': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Cancelled': return 'bg-red-50 text-red-400 border-red-100';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const handleSaveEvent = async (eventData: Omit<CampaignEvent, 'id'>) => {
    setIsSaving(true);
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const removeResourceFromEvent = async (e: React.MouseEvent, eventId: string, resourceId: string) => {
    e.stopPropagation();
    const event = events.find(ev => ev.id === eventId);
    if (event) {
      try {
        await updateEvent(eventId, {
          assignedResources: event.assignedResources.filter(id => id !== resourceId)
        });
      } catch (error) {
        console.error('Error removing resource:', error);
      }
    }
  };

  const addResourceToEvent = async (eventId: string, resourceId: string) => {
    const availability = getResourceAvailability(resourceId);
    if (availability.available <= 0) {
      const res = resources.find(r => r.id === resourceId);
      alert(`Resource "${res?.name}" is at maximum capacity.`);
      return;
    }

    const event = events.find(ev => ev.id === eventId);
    if (event && !event.assignedResources.includes(resourceId)) {
      try {
        await updateEvent(eventId, {
          assignedResources: [...event.assignedResources, resourceId]
        });
      } catch (error) {
        console.error('Error adding resource:', error);
      }
    }
    setShowAddMenu(null);
  };

  const getResourceDetails = (id: string) => {
    return resources.find(r => r.id === id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Event & Rally Management</h2>
          <p className="text-sm text-gray-500">Execution HQ for on-ground campaign activities</p>
        </div>
        <button
          onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition flex items-center"
        >
          <span className="mr-2 text-xl">+</span> Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group hover:shadow-xl transition-all duration-300">
            <div className={`h-2 w-full ${event.status === 'Active' ? 'bg-green-500 animate-pulse' : event.status === 'Completed' ? 'bg-slate-300' : 'bg-orange-500'}`} />

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl shadow-sm">
                    {getEventTypeIcon(event.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{event.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <span className="mr-1">📍</span> {event.location}
                    </p>
                  </div>
                </div>
                <div className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusStyle(event.status)}`}>
                  {event.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Date</p>
                  <p className="font-bold text-gray-900">{event.date}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Time</p>
                  <p className="font-bold text-gray-900">{event.time}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Allocated Assets</p>
                  <div className="relative">
                    <button
                      onClick={() => setShowAddMenu(showAddMenu === event.id ? null : event.id)}
                      className="bg-white border border-orange-100 text-orange-600 px-2 py-1 rounded text-[10px] font-black hover:bg-orange-50 transition flex items-center shadow-sm"
                    >
                      + DEPLOY ASSET
                    </button>

                    {showAddMenu === event.id && (
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-3 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 pb-2 border-b border-gray-50 flex justify-between items-center mb-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Inventory</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {resources.filter(r => !event.assignedResources.includes(r.id)).map(res => {
                            const availability = getResourceAvailability(res.id);
                            const isAtCapacity = availability.available <= 0;

                            return (
                              <button
                                key={res.id}
                                disabled={isAtCapacity}
                                onClick={() => addResourceToEvent(event.id, res.id)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between border-b border-gray-50 last:border-0 ${isAtCapacity ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'hover:bg-orange-50 hover:text-orange-600'}`}
                              >
                                <span className="flex items-center">
                                  <span className="mr-3 text-lg opacity-80">{getResourceIcon(res.type)}</span>
                                  <div className="flex flex-col">
                                    <span className={`font-semibold ${isAtCapacity ? 'text-gray-400' : 'text-gray-700'}`}>{res.name}</span>
                                    <span className="text-[9px] font-medium text-gray-400">Available: {availability.available} / {availability.total}</span>
                                  </div>
                                </span>
                                {isAtCapacity ? (
                                  <span className="text-[9px] font-black bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">FULL</span>
                                ) : (
                                  <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">DEPLOY</span>
                                )}
                              </button>
                            );
                          })}
                          {resources.filter(r => !event.assignedResources.includes(r.id)).length === 0 && (
                            <p className="px-4 py-4 text-xs text-gray-400 italic text-center">No additional resources available</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {event.assignedResources.length > 0 ? (
                    event.assignedResources.map((resId) => {
                      const res = getResourceDetails(resId);
                      if (!res) return null;
                      return (
                        <div key={resId} className="flex items-center bg-white group/res hover:bg-red-50 hover:border-red-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 transition-all duration-200 shadow-sm">
                          <span className="mr-2 text-base">{getResourceIcon(res.type)}</span>
                          <span className="leading-tight">{res.name}</span>
                          <button
                            onClick={(e) => removeResourceFromEvent(e, event.id, resId)}
                            className="ml-3 w-5 h-5 rounded-full bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white flex items-center justify-center text-[10px] transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full py-6 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-300">
                      <span className="text-2xl mb-1">🏗️</span>
                      <p className="text-[10px] font-bold uppercase tracking-widest">No logistics assigned</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6 p-4 bg-slate-50 rounded-xl border-l-4 border-slate-900 group-hover:bg-slate-100 transition-colors">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Execution Brief</p>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {event.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex gap-3">
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                    className="p-3 border border-gray-200 text-gray-400 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition"
                    title="Edit Event"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-3 border border-gray-200 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                    title="Delete Event"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div
          onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
          className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-12 text-gray-300 hover:bg-white hover:border-orange-200 hover:text-orange-500 hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-50 transition-colors">
            <span className="text-4xl group-hover:scale-125 transition-transform">📅</span>
          </div>
          <p className="font-black uppercase tracking-widest text-sm">Plan Next Ground Action</p>
          <p className="text-xs mt-1 font-medium opacity-60">Add Rally, Meeting, or Pheri</p>
        </div>
      </div>

      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedEvent(null); }}
          onSave={handleSaveEvent}
          event={selectedEvent}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default EventManagement;
