import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface RequestChangesModalProps {
  isOpen: boolean;
  bugId: string;
  onClose: () => void;
  onSubmit: (comments: string) => Promise<void>;
}

export const RequestChangesModal: React.FC<RequestChangesModalProps> = ({ isOpen, bugId, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    await onSubmit(comment.trim());
    setLoading(false);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Request Changes for {bugId}</h3>
            <p className="text-xs text-slate-500">Provide actionable feedback to the assigned engineer.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Review Comments & Required Adjustments *
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain why the current fix is incomplete and what needs to be changed..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Return for Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
