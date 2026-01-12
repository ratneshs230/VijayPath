import React, { useState, useMemo } from 'react';
import { useApp } from '../src/context/AppContext';
import { Influencer, InfluencerStance } from '../types';
import InfluencerList from '../components/voter/InfluencerList';
import InfluencerModal from '../components/voter/InfluencerModal';

type FilterStance = InfluencerStance | 'All';

const InfluencersView: React.FC = () => {
  const { influencers, mohallas, addInfluencer, updateInfluencer, deleteInfluencer } = useApp();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStance, setFilterStance] = useState<FilterStance>('All');
  const [filterMohalla, setFilterMohalla] = useState<string>('All');

  // Contact log modal state
  const [contactInfluencer, setContactInfluencer] = useState<Influencer | null>(null);

  // Filtered influencers
  const filteredInfluencers = useMemo(() => {
    return influencers.filter(inf => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = inf.name.toLowerCase().includes(query);
        const matchesType = inf.influencerType.toLowerCase().includes(query);
        const matchesSubType = inf.subType?.toLowerCase().includes(query);
        if (!matchesName && !matchesType && !matchesSubType) return false;
      }

      // Stance filter
      if (filterStance !== 'All' && inf.currentStance !== filterStance) return false;

      // Mohalla filter
      if (filterMohalla !== 'All' && !inf.mohallaIds?.includes(filterMohalla)) return false;

      return true;
    });
  }, [influencers, searchQuery, filterStance, filterMohalla]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: influencers.length,
      supportive: influencers.filter(i => i.currentStance === 'Supportive').length,
      neutral: influencers.filter(i => i.currentStance === 'Neutral').length,
      opposed: influencers.filter(i => i.currentStance === 'Opposed').length,
      unknown: influencers.filter(i => i.currentStance === 'Unknown').length,
      totalVoteControl: influencers.reduce((sum, i) => sum + (i.estimatedVoteControl || 0), 0),
      convertible: influencers.filter(i => i.canBeInfluenced && i.currentStance !== 'Supportive').length
    };
  }, [influencers]);

  // Handlers
  const handleAddNew = () => {
    setEditingInfluencer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (influencer: Influencer) => {
    setEditingInfluencer(influencer);
    setIsModalOpen(true);
  };

  const handleDelete = async (influencer: Influencer) => {
    if (confirm(`Delete influencer "${influencer.name}"? This cannot be undone.`)) {
      try {
        await deleteInfluencer(influencer.id);
      } catch (error) {
        console.error('Failed to delete influencer:', error);
        alert('Failed to delete influencer. Please try again.');
      }
    }
  };

  const handleRecordContact = (influencer: Influencer) => {
    setContactInfluencer(influencer);
  };

  const handleSave = async (data: Partial<Influencer>) => {
    setIsSaving(true);
    try {
      if (editingInfluencer) {
        await updateInfluencer(editingInfluencer.id, data);
      } else {
        await addInfluencer(data as Omit<Influencer, 'id'>);
      }
      setIsModalOpen(false);
      setEditingInfluencer(null);
    } catch (error) {
      console.error('Failed to save influencer:', error);
      alert('Failed to save influencer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogContact = async () => {
    if (!contactInfluencer) return;
    setIsSaving(true);
    try {
      await updateInfluencer(contactInfluencer.id, {
        lastContactedAt: new Date()
      });
      setContactInfluencer(null);
    } catch (error) {
      console.error('Failed to log contact:', error);
      alert('Failed to log contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Influencer Network</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track key influencers and their impact on voter sentiment
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Influencer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Total</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.supportive}</div>
          <div className="text-xs text-green-400/70 uppercase tracking-wide">Supportive</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.neutral}</div>
          <div className="text-xs text-blue-400/70 uppercase tracking-wide">Neutral</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.opposed}</div>
          <div className="text-xs text-red-400/70 uppercase tracking-wide">Opposed</div>
        </div>
        <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-slate-400">{stats.unknown}</div>
          <div className="text-xs text-slate-400/70 uppercase tracking-wide">Unknown</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.totalVoteControl}</div>
          <div className="text-xs text-orange-400/70 uppercase tracking-wide">Votes Controlled</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.convertible}</div>
          <div className="text-xs text-amber-400/70 uppercase tracking-wide">Convertible</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or type..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Stance Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['All', 'Supportive', 'Neutral', 'Opposed', 'Unknown'] as FilterStance[]).map(stance => (
              <button
                key={stance}
                onClick={() => setFilterStance(stance)}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filterStance === stance
                    ? stance === 'All' ? 'bg-orange-600 text-white'
                      : stance === 'Supportive' ? 'bg-green-600 text-white'
                      : stance === 'Neutral' ? 'bg-blue-600 text-white'
                      : stance === 'Opposed' ? 'bg-red-600 text-white'
                      : 'bg-slate-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {stance}
              </button>
            ))}
          </div>

          {/* Mohalla Filter */}
          <select
            value={filterMohalla}
            onChange={(e) => setFilterMohalla(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="All">All Mohallas</option>
            {mohallas.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-400">
        Showing {filteredInfluencers.length} of {influencers.length} influencers
      </div>

      {/* Influencer List */}
      <InfluencerList
        influencers={filteredInfluencers}
        mohallas={mohallas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRecordContact={handleRecordContact}
      />

      {/* Add/Edit Modal */}
      <InfluencerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInfluencer(null);
        }}
        onSave={handleSave}
        influencer={editingInfluencer}
        mohallas={mohallas}
        isSaving={isSaving}
      />

      {/* Contact Log Modal */}
      {contactInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            {/* Sticky Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-bold text-white">Log Contact</h3>
              <button
                onClick={() => setContactInfluencer(null)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white text-xl rounded-lg hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <p className="text-slate-300 mb-4">
                Record a contact with <span className="font-bold text-white">{contactInfluencer.name}</span>?
              </p>
              <p className="text-sm text-slate-400 mb-4">
                This will update the "Last Contacted" timestamp to now.
              </p>
              {contactInfluencer.mobile && (
                <div className="p-4 bg-slate-700/50 rounded-xl mb-4">
                  <span className="text-slate-400 text-sm">Mobile: </span>
                  <a
                    href={`tel:${contactInfluencer.mobile}`}
                    className="text-orange-400 hover:text-orange-300 text-lg font-medium"
                  >
                    {contactInfluencer.mobile}
                  </a>
                </div>
              )}
            </div>
            {/* Sticky Footer */}
            <div className="px-4 sm:px-6 py-4 bg-slate-700/50 border-t border-slate-700 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setContactInfluencer(null)}
                className="flex-1 px-4 py-3 min-h-[44px] bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 active:bg-slate-500 transition-colors font-medium"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleLogContact}
                className="flex-1 px-4 py-3 min-h-[44px] bg-orange-600 text-white rounded-xl hover:bg-orange-700 active:bg-orange-800 transition-colors disabled:opacity-50 font-medium"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Log Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencersView;
