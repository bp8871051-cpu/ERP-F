import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Settings,
  DollarSign,
  TrendingUp,
  Award,
  Briefcase,
  Users,
  Building2,
  Calendar,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';
import DealModal from '../Deals/DealModal';
import PipelineSettingsModal from './PipelineSettingsModal';

export const PipelineBoard = () => {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [kanbanData, setKanbanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedDealId, setDraggedDealId] = useState(null);

  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [prefilledStageId, setPrefilledStageId] = useState('');

  useEffect(() => {
    loadPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipelineId) {
      fetchKanban();
    }
  }, [selectedPipelineId]);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      const res = await crmService.getPipelines();
      const list = res.data || [];
      setPipelines(list);
      if (list.length > 0) {
        setSelectedPipelineId(list[0].id);
      }
    } catch (err) {
      console.error('Error loading pipelines:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKanban = async () => {
    try {
      const res = await crmService.getPipelines();
      const pipe = res.data?.find((p) => String(p.id) === String(selectedPipelineId));
      if (pipe) {
        // Calculate summary
        let totalDeals = 0;
        let totalValue = 0;
        let weightedValue = 0;
        let wonValue = 0;
        let lostValue = 0;

        pipe.stages?.forEach((stage) => {
          stage.deals?.forEach((deal) => {
            totalDeals += 1;
            const val = Number(deal.value || 0);
            const prob = Number(deal.probability || 0);
            totalValue += val;
            weightedValue += val * (prob / 100);
            if (deal.status === 'won') wonValue += val;
            if (deal.status === 'lost') lostValue += val;
          });
        });

        const conversionRate =
          totalValue > 0 ? ((wonValue / totalValue) * 100).toFixed(1) : 0;

        setKanbanData({
          pipeline: pipe,
          stages: pipe.stages || [],
          summary: {
            totalDeals,
            totalValue,
            weightedValue,
            wonValue,
            lostValue,
            conversionRate,
          },
        });
      }
    } catch (err) {
      console.error('Error fetching kanban data:', err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, dealId) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    if (!draggedDealId) return;

    const previousData = JSON.parse(JSON.stringify(kanbanData));

    // Optimistic UI Update
    let movedDeal = null;
    const updatedStages = kanbanData.stages.map((stage) => {
      const dealIndex = stage.deals?.findIndex((d) => String(d.id) === String(draggedDealId));
      if (dealIndex > -1) {
        movedDeal = stage.deals[dealIndex];
        return {
          ...stage,
          deals: stage.deals.filter((d) => String(d.id) !== String(draggedDealId)),
        };
      }
      return stage;
    });

    if (movedDeal) {
      const targetStage = updatedStages.find((s) => String(s.id) === String(targetStageId));
      if (targetStage) {
        movedDeal.stage_id = targetStageId;
        movedDeal.stage = targetStage;
        movedDeal.probability = targetStage.probability;
        movedDeal.expected_revenue =
          Number(movedDeal.value || 0) * (Number(targetStage.probability || 0) / 100);

        if (targetStage.is_won) movedDeal.status = 'won';
        else if (targetStage.is_lost) movedDeal.status = 'lost';
        else movedDeal.status = 'open';

        targetStage.deals = [movedDeal, ...(targetStage.deals || [])];
      }

      setKanbanData((prev) => ({
        ...prev,
        stages: updatedStages,
      }));

      // Laravel API update
      try {
        await crmService.updateDealStage(
          draggedDealId,
          targetStageId,
          `Moved to ${targetStage?.name || 'stage'} via Kanban Board`
        );
        fetchKanban(); // Refresh accurate state from server
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating deal stage. Rolling back.');
        setKanbanData(previousData);
      } finally {
        setDraggedDealId(null);
      }
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (loading && !kanbanData) return <LoadingSkeleton type="dashboard" />;

  const currentPipeline = pipelines.find((p) => String(p.id) === String(selectedPipelineId));

  return (
    <div className="space-y-6">
      {/* Header & Pipeline Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-600" />
            Visual Sales Pipeline (Kanban)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Drag & drop deals across stages with automatic probability weighting and audit log sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pipeline Selector */}
          <div className="relative">
            <select
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Settings}
            onClick={() => setSettingsOpen(true)}
          >
            Stages & Settings
          </Button>

          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => {
              setPrefilledStageId('');
              setDealModalOpen(true);
            }}
          >
            Add Deal
          </Button>

          <button
            onClick={fetchKanban}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pipeline Summary Bar */}
      {kanbanData?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            title="Total Deals"
            value={kanbanData.summary.totalDeals}
            subtitle="In current pipeline"
            icon={Briefcase}
            iconColor="text-teal-600"
            iconBg="bg-teal-50"
          />
          <StatCard
            title="Pipeline Value"
            value={formatCurrency(kanbanData.summary.totalValue)}
            subtitle="Gross contract size"
            icon={DollarSign}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Weighted Pipeline"
            value={formatCurrency(kanbanData.summary.weightedValue)}
            subtitle="Value × Probability"
            icon={TrendingUp}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatCard
            title="Won Value"
            value={formatCurrency(kanbanData.summary.wonValue)}
            subtitle="Closed deals"
            icon={Award}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Lost Value"
            value={formatCurrency(kanbanData.summary.lostValue)}
            subtitle="Archived deals"
            icon={Briefcase}
            iconColor="text-rose-600"
            iconBg="bg-rose-50"
          />
          <StatCard
            title="Conversion Rate"
            value={`${kanbanData.summary.conversionRate}%`}
            subtitle="Win percentage"
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>
      )}

      {/* Visual Kanban Columns Container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1000px]">
          {kanbanData?.stages?.map((stage) => {
            const stageDeals = stage.deals || [];
            const stageValue = stageDeals.reduce((acc, d) => acc + Number(d.value || 0), 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="w-80 shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color || '#0F8B7A' }}
                    />
                    <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">
                      {stage.name}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setPrefilledStageId(stage.id);
                        setDealModalOpen(true);
                      }}
                      title="Add deal to this stage"
                      className="p-1 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subheader: Column Value & Probability */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-1">
                  <span className="font-bold text-slate-800">{formatCurrency(stageValue)}</span>
                  <span className="font-mono text-[10px]">{stage.probability}% Win Prob</span>
                </div>

                {/* Deal Cards Container */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl">
                      Drop deal here
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onClick={() => navigate(`/app/crm/deals/${deal.id}`)}
                        className={`bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group hover:border-teal-500/50 ${
                          draggedDealId === deal.id ? 'opacity-40 ring-2 ring-teal-500' : ''
                        }`}
                      >
                        {/* Title & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 text-xs group-hover:text-teal-600 transition-colors line-clamp-2">
                            {deal.name}
                          </span>
                          {deal.status === 'won' && (
                            <Badge variant="success" size="sm">
                              WON
                            </Badge>
                          )}
                          {deal.status === 'lost' && (
                            <Badge variant="danger" size="sm">
                              LOST
                            </Badge>
                          )}
                        </div>

                        {/* Customer / Company */}
                        <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{deal.customer?.name || deal.customer?.company_name || 'Individual'}</span>
                        </div>

                        {/* Financial Metrics */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Deal Value</span>
                            <span className="font-extrabold text-slate-900 text-xs">
                              {formatCurrency(deal.value)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Expected</span>
                            <span className="font-bold text-emerald-700 text-xs">
                              {formatCurrency(deal.expected_revenue)}
                            </span>
                          </div>
                        </div>

                        {/* Footer: Owner & Close Date */}
                        <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 font-medium text-slate-600 truncate max-w-[120px]">
                            <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[9px]">
                              {deal.owner?.name?.[0] || 'U'}
                            </span>
                            {deal.owner?.name || 'Owner'}
                          </span>

                          {deal.expected_close_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {deal.expected_close_date}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <PipelineSettingsModal
        isOpen={settingsOpen}
        pipeline={currentPipeline}
        onClose={() => setSettingsOpen(false)}
        onSuccess={fetchKanban}
      />

      <DealModal
        isOpen={dealModalOpen}
        onClose={() => setDealModalOpen(false)}
        onSuccess={fetchKanban}
      />
    </div>
  );
};

export default PipelineBoard;
