import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit, Check, Settings, Layers, Sliders } from 'lucide-react';
import crmService from '../../../services/crmService';
import Button from '../../../components/ui/Button';

export const PipelineSettingsModal = ({ isOpen, onClose, onSuccess, pipeline }) => {
  const [stages, setStages] = useState([]);
  const [pipelineName, setPipelineName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New stage form state
  const [newStage, setNewStage] = useState({
    name: '',
    probability: 50,
    color: '#0F8B7A',
    is_won: false,
    is_lost: false,
  });

  useEffect(() => {
    if (isOpen && pipeline) {
      setPipelineName(pipeline.name || '');
      setStages(pipeline.stages || []);
    }
  }, [isOpen, pipeline]);

  const handleAddStage = async (e) => {
    e.preventDefault();
    if (!newStage.name) return;
    try {
      setSubmitting(true);
      await crmService.addPipelineStage(pipeline.id, {
        ...newStage,
        stage_order: stages.length + 1,
      });
      setNewStage({ name: '', probability: 50, color: '#0F8B7A', is_won: false, is_lost: false });
      onSuccess?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding stage');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStage = async (stageId) => {
    if (!window.confirm('Delete this stage? Existing deals will need to be reallocated.')) return;
    try {
      await crmService.deletePipelineStage(pipeline.id, stageId);
      onSuccess?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting stage');
    }
  };

  const handleUpdateStage = async (stageId, updatedData) => {
    try {
      await crmService.updatePipelineStage(pipeline.id, stageId, updatedData);
      onSuccess?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stage');
    }
  };

  if (!isOpen || !pipeline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Manage Pipeline & Stages: {pipeline.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Existing Stages List */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Current Stages & Probabilities
            </h4>

            <div className="space-y-2">
              {stages.map((st, index) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-200 text-slate-700 font-bold text-[10px]">
                      {index + 1}
                    </span>
                    <input
                      type="color"
                      value={st.color || '#0F8B7A'}
                      onChange={(e) => handleUpdateStage(st.id, { color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0"
                    />
                    <span className="font-semibold text-slate-800">{st.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Prob:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={st.probability}
                        onBlur={(e) => handleUpdateStage(st.id, { probability: Number(e.target.value) })}
                        className="w-14 p-1 rounded border border-slate-300 text-center font-bold text-slate-800 bg-white"
                      />
                      <span>%</span>
                    </div>

                    {st.is_won && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        WON
                      </span>
                    )}

                    {st.is_lost && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        LOST
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteStage(st.id)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Stage */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-teal-600" /> Add New Pipeline Stage
            </h4>

            <form onSubmit={handleAddStage} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-600 block mb-1">Stage Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Contract Review"
                  value={newStage.name}
                  onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Probability %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newStage.probability}
                  onChange={(e) => setNewStage({ ...newStage, probability: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <Button variant="teal" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Stage'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PipelineSettingsModal;
