import React, { useState, useMemo } from 'react';
import { Resource, ResourceType } from '../types';
import { useResources } from '../src/hooks/useResources';
import { useEvents } from '../src/hooks/useEvents';
import { validateResource, canDeleteResource, ResourceValidationResult } from '../src/utils/validation';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Omit<Resource, 'id'>) => void;
  resource?: Resource | null;
  isSaving?: boolean;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ isOpen, onClose, onSave, resource, isSaving }) => {
  const [formData, setFormData] = useState<Partial<Resource>>(
    resource || {
      name: '',
      type: ResourceType.MANPOWER,
      quantity: 0,
      allocated: 0,
      status: 'Available'
    }
  );
  const [validationErrors, setValidationErrors] = useState<ResourceValidationResult['errors']>({});

  React.useEffect(() => {
    if (resource) {
      setFormData(resource);
    } else {
      setFormData({
        name: '',
        type: ResourceType.MANPOWER,
        quantity: 0,
        allocated: 0,
        status: 'Available'
      });
    }
    setValidationErrors({});
  }, [resource]);

  const handleSave = () => {
    const validation = validateResource(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors({});
    onSave(formData as Omit<Resource, 'id'>);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">{resource ? 'Update Resource' : 'Add Campaign Asset'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" disabled={isSaving}>✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Asset Name</label>
            <input
              type="text"
              className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium ${
                validationErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="e.g. Ward 1 Volunteers or Tata Safari"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            {validationErrors.name && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as ResourceType})}
              >
                <option value={ResourceType.MANPOWER}>Manpower</option>
                <option value={ResourceType.VEHICLE}>Vehicle</option>
                <option value={ResourceType.BUDGET}>Budget/Funds</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Maintenance">In Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Total Capacity</label>
              <input
                type="number"
                className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                  validationErrors.quantity ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
              />
              {validationErrors.quantity && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.quantity}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Allocated/Spent</label>
              <input
                type="number"
                className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                  validationErrors.allocated ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
                value={formData.allocated}
                onChange={e => setFormData({...formData, allocated: parseFloat(e.target.value) || 0})}
              />
              {validationErrors.allocated && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.allocated}</p>
              )}
            </div>
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
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : resource ? 'Update Asset' : 'Add Asset'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResourcesView: React.FC = () => {
  const { resources, resourceStats, addResource, updateResource, deleteResource, isLoading } = useResources();
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredResources = useMemo(() => {
    return resources.filter(res =>
      (res.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === 'All' || res.type === filterType)
    );
  }, [resources, searchTerm, filterType]);

  const handleSaveResource = async (resourceData: Omit<Resource, 'id'>) => {
    setIsSaving(true);
    try {
      if (selectedResource) {
        await updateResource(selectedResource.id, resourceData);
      } else {
        await addResource(resourceData);
      }
      setIsModalOpen(false);
      setSelectedResource(null);
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (res: Resource) => {
    setSelectedResource(res);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);

    // Check if resource can be deleted
    const deleteCheck = canDeleteResource(id, events);
    if (!deleteCheck.canDelete) {
      setDeleteError(deleteCheck.reason || 'Cannot delete this resource');
      // Show affected events
      if (deleteCheck.affectedEvents && deleteCheck.affectedEvents.length > 0) {
        alert(`Cannot delete: ${deleteCheck.reason}\n\nAssigned to events:\n- ${deleteCheck.affectedEvents.join('\n- ')}`);
      } else {
        alert(`Cannot delete: ${deleteCheck.reason}`);
      }
      return;
    }

    if (confirm('Delete this resource entry?')) {
      try {
        await deleteResource(id);
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Failed to delete resource. Please try again.');
      }
    }
  };

  const getIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.MANPOWER: return '👥';
      case ResourceType.VEHICLE: return '🚗';
      case ResourceType.BUDGET: return '💰';
      default: return '📦';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700 border-green-200';
      case 'Assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Maintenance': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Campaign Resources</h2>
            <p className="text-sm text-gray-500">Inventory of assets available for deployment</p>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => { setSelectedResource(null); setIsModalOpen(true); }}
              className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 flex items-center"
            >
              <span className="mr-2 text-xl">+</span> Add New Asset
            </button>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Budget Utilization</span>
            <span className={`text-xs font-bold ${resourceStats.budget.percentUsed > 80 ? 'text-red-400' : 'text-green-400'}`}>
              {resourceStats.budget.percentUsed > 80 ? 'High' : 'Safe'}
            </span>
          </div>
          <div className="text-2xl font-bold">₹{resourceStats.budget.remaining.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Remaining out of ₹{resourceStats.budget.total.toLocaleString()}</div>
          <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500" style={{ width: `${resourceStats.budget.percentUsed}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Manpower</span>
            <span className="text-orange-500 text-xs font-bold">{resourceStats.manpower.percentUsed}%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{resourceStats.manpower.active} / {resourceStats.manpower.total}</div>
          <div className="text-xs text-gray-500 mt-1">Volunteers currently deployed</div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: `${resourceStats.manpower.percentUsed}%` }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search assets by name..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {['All', ResourceType.MANPOWER, ResourceType.VEHICLE, ResourceType.BUDGET].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                filterType === type
                ? 'bg-orange-600 border-orange-600 text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {type === 'All' ? 'All Assets' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const utilization = Math.min(100, Math.round((res.allocated / res.quantity) * 100) || 0);
          return (
            <div key={res.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl text-3xl group-hover:bg-orange-50 transition-colors">
                    {getIcon(res.type)}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(res)} className="p-1.5 text-slate-300 hover:text-orange-500 transition-colors">✎</button>
                      <button onClick={() => handleDelete(res.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">🗑</button>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{res.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-slate-200 mr-2" />
                  {res.type}
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-400 uppercase">Current Load</span>
                      <span className={`${utilization > 80 ? 'text-red-500' : 'text-slate-900'}`}>{utilization}%</span>
                    </div>
                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[2px]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          utilization > 85 ? 'bg-red-500' : utilization > 50 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Total Capacity</p>
                      <p className="text-lg font-bold text-slate-900">
                        {res.type === ResourceType.BUDGET ? `₹${res.quantity.toLocaleString()}` : res.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Currently {res.type === ResourceType.BUDGET ? 'Spent' : 'In Use'}</p>
                      <p className={`text-lg font-bold ${res.allocated > res.quantity * 0.9 ? 'text-red-600' : 'text-orange-600'}`}>
                        {res.type === ResourceType.BUDGET ? `₹${res.allocated.toLocaleString()}` : res.allocated}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="w-full py-3 bg-gray-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-t border-gray-100 hover:bg-orange-600 hover:text-white transition-all"
                onClick={() => handleEdit(res)}
              >
                Manage Allocation
              </button>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="bg-white p-20 rounded-2xl border border-dashed border-gray-200 text-center">
          <div className="text-6xl mb-4 grayscale opacity-20">🏗️</div>
          <h3 className="text-xl font-bold text-gray-900">No assets found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or search keywords.</p>
          <button
            onClick={() => {setSearchTerm(''); setFilterType('All');}}
            className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {isModalOpen && (
        <ResourceModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedResource(null); }}
          onSave={handleSaveResource}
          resource={selectedResource}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default ResourcesView;
