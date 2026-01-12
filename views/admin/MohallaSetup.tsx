import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { Mohalla } from '../../types';

const MohallaSetup: React.FC = () => {
  const { mohallas, addMohalla, updateMohalla, deleteMohalla, user, isLoading } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMohalla, setEditingMohalla] = useState<Mohalla | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    alternateNames: '',
    sortOrder: 0
  });

  const handleOpenAddModal = () => {
    setFormData({ name: '', alternateNames: '', sortOrder: mohallas.length });
    setEditingMohalla(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (mohalla: Mohalla) => {
    setFormData({
      name: mohalla.name,
      alternateNames: mohalla.alternateNames?.join(', ') || '',
      sortOrder: mohalla.sortOrder
    });
    setEditingMohalla(mohalla);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingMohalla(null);
    setFormData({ name: '', alternateNames: '', sortOrder: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const alternateNamesArray = formData.alternateNames
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      if (editingMohalla) {
        await updateMohalla(editingMohalla.id, {
          name: formData.name,
          alternateNames: alternateNamesArray,
          sortOrder: formData.sortOrder
        });
      } else {
        await addMohalla({
          name: formData.name,
          alternateNames: alternateNamesArray,
          gramPanchayatId: 'default',
          totalHouseholds: 0,
          totalVoters: 0,
          sortOrder: formData.sortOrder,
          isActive: true,
          createdBy: user?.uid
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving mohalla:', error);
    }
  };

  const handleDelete = async (mohalla: Mohalla) => {
    if (mohalla.totalHouseholds > 0 || mohalla.totalVoters > 0) {
      alert(`Cannot delete "${mohalla.name}" - it has ${mohalla.totalHouseholds} households and ${mohalla.totalVoters} voters.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${mohalla.name}"?`)) {
      try {
        await deleteMohalla(mohalla.id);
      } catch (error) {
        console.error('Error deleting mohalla:', error);
      }
    }
  };

  const handleMoveUp = async (mohalla: Mohalla, index: number) => {
    if (index === 0) return;
    const prevMohalla = mohallas[index - 1];
    await updateMohalla(mohalla.id, { sortOrder: prevMohalla.sortOrder });
    await updateMohalla(prevMohalla.id, { sortOrder: mohalla.sortOrder });
  };

  const handleMoveDown = async (mohalla: Mohalla, index: number) => {
    if (index === mohallas.length - 1) return;
    const nextMohalla = mohallas[index + 1];
    await updateMohalla(mohalla.id, { sortOrder: nextMohalla.sortOrder });
    await updateMohalla(nextMohalla.id, { sortOrder: mohalla.sortOrder });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mohalla Setup</h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure the mohallas/tolas in your gram panchayat
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Add Mohalla
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs uppercase tracking-wide">Total Mohallas</div>
          <div className="text-2xl font-bold text-white mt-1">{mohallas.length}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs uppercase tracking-wide">Total Households</div>
          <div className="text-2xl font-bold text-white mt-1">
            {mohallas.reduce((sum, m) => sum + m.totalHouseholds, 0)}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs uppercase tracking-wide">Total Voters</div>
          <div className="text-2xl font-bold text-white mt-1">
            {mohallas.reduce((sum, m) => sum + m.totalVoters, 0)}
          </div>
        </div>
      </div>

      {/* Mohalla List */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-medium w-12">#</th>
              <th className="text-left px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-medium">Mohalla Name</th>
              <th className="text-left px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-medium">Alternate Names</th>
              <th className="text-center px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-medium">Households</th>
              <th className="text-center px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-medium">Voters</th>
              <th className="text-center px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-medium w-32">Order</th>
              <th className="text-right px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-medium w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mohallas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No mohallas configured yet. Click "Add Mohalla" to get started.
                </td>
              </tr>
            ) : (
              mohallas.map((mohalla, index) => (
                <tr key={mohalla.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-mono text-sm">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{mohalla.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    {mohalla.alternateNames && mohalla.alternateNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {mohalla.alternateNames.map((name, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-white font-medium">{mohalla.totalHouseholds}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-white font-medium">{mohalla.totalVoters}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMoveUp(mohalla, index)}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveDown(mohalla, index)}
                        disabled={index === mohallas.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(mohalla)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(mohalla)}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
            {/* Sticky Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editingMohalla ? 'Edit Mohalla' : 'Add New Mohalla'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white text-xl rounded-lg hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">
                    Mohalla Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 min-h-[44px] bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    placeholder="e.g., Purab Tola, Harijan Basti"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1">
                    Alternate Names (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.alternateNames}
                    onChange={(e) => setFormData({ ...formData, alternateNames: e.target.value })}
                    className="w-full px-4 py-3 min-h-[44px] bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    placeholder="e.g., Yadav Mohalla, Bade Baba ka Purva"
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    Local names people use to refer to this area
                  </p>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 min-h-[44px] bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    min={0}
                  />
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="flex gap-3 p-4 sm:px-6 border-t border-slate-700 flex-shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 min-h-[44px] bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 active:bg-slate-500 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 min-h-[44px] bg-orange-600 text-white rounded-xl hover:bg-orange-700 active:bg-orange-800 transition-colors font-medium"
              >
                {editingMohalla ? 'Save Changes' : 'Add Mohalla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MohallaSetup;
