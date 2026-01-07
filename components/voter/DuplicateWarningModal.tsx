import React from 'react';
import { EnhancedVoter } from '../../types';

interface DuplicateCandidate {
  voter: EnhancedVoter;
  matchType: 'exact_name' | 'similar_name' | 'same_mobile' | 'same_age_mohalla';
  confidence: 'high' | 'medium' | 'low';
  householdName?: string;
  mohallaName?: string;
}

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAdd: () => void;
  onMergeWith: (voterId: string) => void;
  newVoterName: string;
  candidates: DuplicateCandidate[];
}

const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
  switch (confidence) {
    case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
};

const getMatchTypeLabel = (matchType: DuplicateCandidate['matchType']) => {
  switch (matchType) {
    case 'exact_name': return 'Exact Name Match';
    case 'similar_name': return 'Similar Name';
    case 'same_mobile': return 'Same Mobile';
    case 'same_age_mohalla': return 'Same Age & Mohalla';
  }
};

const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirmAdd,
  onMergeWith,
  newVoterName,
  candidates
}) => {
  if (!isOpen) return null;

  const highConfidenceCount = candidates.filter(c => c.confidence === 'high').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Potential Duplicate Found</h3>
              <p className="text-sm text-amber-300/70">
                "{newVoterName}" may already exist
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {highConfidenceCount > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-300">
                <span className="font-bold">{highConfidenceCount}</span> high-confidence match{highConfidenceCount > 1 ? 'es' : ''} found.
                Please verify before adding.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.voter.id}
                className={`p-4 rounded-xl border ${getConfidenceColor(candidate.confidence)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{candidate.voter.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        candidate.confidence === 'high' ? 'bg-red-500 text-white' :
                        candidate.confidence === 'medium' ? 'bg-amber-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {candidate.confidence}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                      <div>{candidate.voter.ageBand} • {candidate.voter.gender}</div>
                      {candidate.householdName && (
                        <div>Family: {candidate.householdName}</div>
                      )}
                      {candidate.mohallaName && (
                        <div>Mohalla: {candidate.mohallaName}</div>
                      )}
                      {candidate.voter.mobile && (
                        <div>Mobile: {candidate.voter.mobile}</div>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded text-slate-300">
                        {getMatchTypeLabel(candidate.matchType)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onMergeWith(candidate.voter.id)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors"
                  >
                    This is them
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-700/50 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmAdd}
            className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
              highConfidenceCount > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {highConfidenceCount > 0 ? 'Add Anyway (Risky)' : 'Add as New Voter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningModal;
