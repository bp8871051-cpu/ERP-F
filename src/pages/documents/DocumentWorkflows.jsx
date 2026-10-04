import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Layers,
  User,
  Building2,
  AlertCircle,
  Edit,
} from 'lucide-react';
import documentService from '../../services/documentService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const DocumentWorkflows = () => {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Workflow Form State
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    category: 'Contracts',
    description: '',
    steps: [
      { step_name: 'Author Upload & Verification', sequence: 1, approver_type: 'Role', role: 'Author', sla_hours: 12, is_required: true },
      { step_name: 'Department Manager Review', sequence: 2, approver_type: 'Department', role: 'Manager', sla_hours: 24, is_required: true },
      { step_name: 'Legal & Risk Sign-Off', sequence: 3, approver_type: 'Role', role: 'Legal Counsel', sla_hours: 48, is_required: true },
      { step_name: 'Final Executive Approval', sequence: 4, approver_type: 'Role', role: 'Director', sla_hours: 24, is_required: true },
    ],
  });

  const defaultWorkflows = [
    {
      id: 1,
      name: 'Standard Commercial Contract Workflow',
      category: 'Contracts',
      description: 'Mandatory 4-stage pipeline for MSAs, vendor agreements, and non-disclosure contracts.',
      status: 'active',
      steps: [
        { id: 1, step_name: 'Document Uploaded', approver_type: 'User', role: 'Contract Lead', sla_hours: 12, is_required: true },
        { id: 2, step_name: 'Department Head Review', approver_type: 'Department', role: 'Department Manager', sla_hours: 24, is_required: true },
        { id: 3, step_name: 'Legal & Finance Clearance', approver_type: 'Role', role: 'Legal Officer', sla_hours: 48, is_required: true },
        { id: 4, step_name: 'Final Executive Sign-Off', approver_type: 'Role', role: 'Executive Approver', sla_hours: 24, is_required: true },
      ],
    },
    {
      id: 2,
      name: 'Corporate Policy & Operating Manual Review',
      category: 'Policies',
      description: 'Compliance verification pipeline before company-wide publishing of HR and IT guidelines.',
      status: 'active',
      steps: [
        { id: 1, step_name: 'Policy Draft Submission', approver_type: 'Role', role: 'Policy Owner', sla_hours: 24, is_required: true },
        { id: 2, step_name: 'Compliance Audit Check', approver_type: 'Role', role: 'Compliance Auditor', sla_hours: 48, is_required: true },
        { id: 3, step_name: 'Board / C-Level Publishing Sign-off', approver_type: 'Role', role: 'Managing Director', sla_hours: 48, is_required: true },
      ],
    },
    {
      id: 3,
      name: 'Financial Audit & Tax Filing Pipeline',
      category: 'Finance',
      description: 'Fast-track verification pipeline for monthly GST statements and vendor invoice reconciliations.',
      status: 'active',
      steps: [
        { id: 1, step_name: 'Invoice Upload & OCR Check', approver_type: 'User', role: 'Accounts Executive', sla_hours: 8, is_required: true },
        { id: 2, step_name: 'Controller Authorization', approver_type: 'Role', role: 'Finance Controller', sla_hours: 16, is_required: true },
      ],
    },
  ];

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await documentService.getWorkflows();
      const list = res.data?.data || res.data || [];
      setWorkflows(list.length > 0 ? list : defaultWorkflows);
    } catch (err) {
      setWorkflows(defaultWorkflows);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    const newSeq = workflowForm.steps.length + 1;
    setWorkflowForm((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          step_name: `Verification Stage ${newSeq}`,
          sequence: newSeq,
          approver_type: 'Role',
          role: 'Reviewer',
          sla_hours: 24,
          is_required: true,
        },
      ],
    }));
  };

  const removeStep = (index) => {
    if (workflowForm.steps.length <= 1) return;
    const updated = workflowForm.steps.filter((_, idx) => idx !== index);
    setWorkflowForm((prev) => ({
      ...prev,
      steps: updated.map((s, i) => ({ ...s, sequence: i + 1 })),
    }));
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...workflowForm.steps];
    updated[index][field] = value;
    setWorkflowForm((prev) => ({ ...prev, steps: updated }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!workflowForm.name) {
      alert('Workflow name is required.');
      return;
    }
    try {
      setSubmitting(true);
      await documentService.createWorkflow(workflowForm);
      setShowCreateModal(false);
      setWorkflowForm({
        name: '',
        category: 'Contracts',
        description: '',
        steps: [
          { step_name: 'Author Upload & Verification', sequence: 1, approver_type: 'Role', role: 'Author', sla_hours: 12, is_required: true },
          { step_name: 'Department Manager Review', sequence: 2, approver_type: 'Department', role: 'Manager', sla_hours: 24, is_required: true },
          { step_name: 'Legal & Risk Sign-Off', sequence: 3, approver_type: 'Role', role: 'Legal Counsel', sla_hours: 48, is_required: true },
          { step_name: 'Final Executive Approval', sequence: 4, approver_type: 'Role', role: 'Director', sla_hours: 24, is_required: true },
        ],
      });
      await fetchWorkflows();
    } catch (err) {
      alert(err.response?.data?.message || 'Error configuring workflow');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-teal-600" />
            Configurable Approval Workflow Designer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Design sequential multi-stage document approval chains, role SLAs, and automated escalation parameters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" /> New Approval Pipeline
          </Button>
        </div>
      </div>

      {/* Workflows Visual Pipeline List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5 bg-white border border-slate-200 shadow-xs">
              <LoadingSkeleton className="h-6 w-48 mb-3" />
              <div className="grid grid-cols-4 gap-3">
                <LoadingSkeleton className="h-20" />
                <LoadingSkeleton className="h-20" />
                <LoadingSkeleton className="h-20" />
                <LoadingSkeleton className="h-20" />
              </div>
            </Card>
          ))
        ) : (
          workflows.map((wf) => (
            <Card key={wf.id} className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{wf.name}</h3>
                    <Badge variant="success">ACTIVE</Badge>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      Category: {wf.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{wf.description}</p>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {wf.steps?.length || 0} Sequential Approval Stages
                </div>
              </div>

              {/* Visual Sequential Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {wf.steps?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-teal-500 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                        Stage {idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {step.sla_hours || 24}h SLA
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{step.step_name}</h4>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Role: {step.role || 'Designated Approver'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-semibold">
                        {step.is_required ? '● Mandatory' : '○ Optional'}
                      </span>
                      <span className="text-slate-400">{step.approver_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-teal-400" />
                Configure Document Approval Pipeline
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pipeline Name *</label>
                  <input
                    type="text"
                    required
                    value={workflowForm.name}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                    placeholder="e.g. Master Services Agreement Approval"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
                  <select
                    value={workflowForm.category}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                  >
                    <option value="Contracts">Contracts</option>
                    <option value="Policies">Policies</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                    <option value="Legal">Legal</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workflow Purpose & Description</label>
                <textarea
                  rows="2"
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                  placeholder="Outline purpose, mandatory department checkpoints, and scope..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              {/* Dynamic Step Sequencing */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-teal-700">
                    Approval Sequence Stages ({workflowForm.steps.length})
                  </h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addStep}
                    className="text-[11px] py-1 px-2 border-teal-300 text-teal-700 hover:bg-teal-50"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Stage
                  </Button>
                </div>

                <div className="space-y-3">
                  {workflowForm.steps.map((st, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-1 font-bold text-teal-700 text-center font-mono">
                        #{i + 1}
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Stage Name</label>
                        <input
                          type="text"
                          required
                          value={st.step_name}
                          onChange={(e) => handleStepChange(i, 'step_name', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Approver Role</label>
                        <input
                          type="text"
                          required
                          value={st.role}
                          onChange={(e) => handleStepChange(i, 'role', e.target.value)}
                          placeholder="e.g. Legal Counsel"
                          className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-0.5">SLA (Hours)</label>
                        <input
                          type="number"
                          value={st.sla_hours}
                          onChange={(e) => handleStepChange(i, 'sla_hours', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-3 sm:pt-0">
                        <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={st.is_required}
                            onChange={(e) => handleStepChange(i, 'is_required', e.target.checked)}
                            className="rounded text-teal-600 w-3.5 h-3.5"
                          />
                          <span>Req</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeStep(i)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove stage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {submitting ? 'Saving...' : 'Deploy Pipeline'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentWorkflows;
