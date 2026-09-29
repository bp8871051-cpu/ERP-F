import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
} from 'lucide-react';
import { callService } from '../../../services/callService';
import { useAuth } from '../../../context/AuthContext';

export const CallsPage = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, incoming: 0, outgoing: 0, missed: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Call modal states
  const [isDialModalOpen, setIsDialModalOpen] = useState(false);
  const [dialTarget, setDialTarget] = useState('');
  const [callType, setCallType] = useState('audio'); // audio or video
  const [activeSession, setActiveSession] = useState(null); // active in-call simulator
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Fetch calls from API
  const loadCalls = async () => {
    try {
      setLoading(true);
      const res = await callService.getCalls();
      if (res && res.data) {
        setCalls(res.data);
      }
      if (res && res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load calls', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  // Timer for active call session
  useEffect(() => {
    let interval;
    if (activeSession && activeSession.status === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  // Start outgoing call
  const handleStartCall = async (e) => {
    e?.preventDefault();
    if (!dialTarget) return;

    try {
      const payload = {
        receiver_id: dialTarget,
        type: callType,
      };
      const res = await callService.initiateCall(payload);
      if (res && res.data) {
        setActiveSession({ ...res.data, status: 'ringing' });
        // Simulate remote answer after 2.5 seconds
        setTimeout(() => {
          setActiveSession((prev) => (prev ? { ...prev, status: 'connected' } : null));
        }, 2500);
      }
    } catch (err) {
      console.error('Failed to initiate call', err);
    }
  };

  // End call
  const handleEndCall = async () => {
    if (activeSession) {
      try {
        await callService.updateCall(activeSession.id, {
          status: 'completed',
          duration: callDuration,
        });
      } catch (err) {
        console.error(err);
      }
      setActiveSession(null);
      setIsDialModalOpen(false);
      loadCalls();
    }
  };

  // Filtered calls
  const filteredCalls = calls.filter((c) => {
    const callerName = c.caller?.name || '';
    const receiverName = c.receiver?.name || '';
    const matchesSearch =
      callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receiverName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'incoming') return c.receiver_id === user?.id;
    if (filterStatus === 'outgoing') return c.caller_id === user?.id;
    if (filterStatus === 'missed') return c.status === 'missed';
    return true;
  });

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & New Call Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Call Center & Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Internal WebRTC voice and video call logs with duration analytics
          </p>
        </div>
        <button
          onClick={() => setIsDialModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Phone className="w-4 h-4" />
          <span>Start Call</span>
        </button>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Calls</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{metrics.total}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Recorded sessions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incoming</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PhoneIncoming className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{metrics.incoming}</span>
            <span className="text-[11px] text-blue-600 block mt-0.5">Received calls</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outgoing</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PhoneOutgoing className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{metrics.outgoing}</span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">Dialed calls</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Missed</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <PhoneMissed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600">{metrics.missed}</span>
            <span className="text-[11px] text-rose-500 block mt-0.5">Unanswered calls</span>
          </div>
        </div>
      </div>

      {/* Main Table Card with Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium w-full sm:w-auto">
            {['all', 'incoming', 'outgoing', 'missed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md capitalize transition-colors cursor-pointer ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by caller or receiver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Caller</th>
                <th className="py-3.5 px-4">Receiver</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading call history...</span>
                  </td>
                </tr>
              ) : filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No call records matching your query
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => {
                  const isIncoming = call.receiver_id === user?.id;
                  const isMissed = call.status === 'missed';

                  return (
                    <tr key={call.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Caller */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              call.caller?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                            }
                            alt=""
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block truncate">
                              {call.caller?.name || 'Alexander Wright'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {call.caller?.email || 'admin@falconerp.com'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Receiver */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              call.receiver?.avatar ||
                              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
                            }
                            alt=""
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block truncate">
                              {call.receiver?.name || 'Sarah Jenkins'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {call.receiver?.email || 'sarah@falconerp.com'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Call Type */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {call.type === 'video' ? (
                            <Video className="w-3 h-3 text-blue-600" />
                          ) : (
                            <Phone className="w-3 h-3 text-teal-600" />
                          )}
                          <span>{call.type || 'audio'}</span>
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {call.duration > 0 ? formatSeconds(call.duration) : '--:--'}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4">
                        <span className="block text-slate-800">
                          {new Date(call.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(call.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            call.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : call.status === 'missed'
                              ? 'bg-rose-50 text-rose-700'
                              : call.status === 'rejected'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {call.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setDialTarget(call.receiver_id === user?.id ? call.caller_id : call.receiver_id);
                            setIsDialModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Call Back
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialer & WebRTC Session Modal */}
      {isDialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            {activeSession ? (
              /* Active In-Call Screen */
              <div className="p-8 text-center bg-slate-900 text-white flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
                    alt=""
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-teal-500/40"
                  />
                  {activeSession.status === 'ringing' && (
                    <span className="absolute inset-0 rounded-full ring-4 ring-teal-400 animate-ping opacity-75" />
                  )}
                </div>

                <h3 className="text-base font-bold">Connecting internal line...</h3>
                <p className="text-xs text-slate-400 mt-1 capitalize">
                  {activeSession.status === 'ringing' ? 'Ringing...' : 'Connected (Encrypted P2P)'}
                </p>

                {activeSession.status === 'connected' && (
                  <div className="mt-3 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 font-mono text-sm font-semibold">
                    {formatSeconds(callDuration)}
                  </div>
                )}

                {/* Call Controls */}
                <div className="flex items-center gap-4 mt-8">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full transition-colors cursor-pointer ${
                      isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={handleEndCall}
                    className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setIsVideoDisabled(!isVideoDisabled)}
                    className={`p-3 rounded-full transition-colors cursor-pointer ${
                      isVideoDisabled ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : (
              /* Initiate New Call Form */
              <div className="p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Start Internal Call</h3>
                  <button
                    onClick={() => setIsDialModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleStartCall} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Select Colleague
                    </label>
                    <select
                      value={dialTarget}
                      onChange={(e) => setDialTarget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    >
                      <option value="">-- Choose contact --</option>
                      <option value="2">Sarah Jenkins (HR Manager)</option>
                      <option value="3">David Chen (Sales Lead)</option>
                      <option value="4">Elena Rostova (Finance Director)</option>
                      <option value="5">Marcus Brody (Operations)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Call Medium
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCallType('audio')}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          callType === 'audio'
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Phone className="w-4 h-4 text-teal-600" />
                        <span>Voice Call</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCallType('video')}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          callType === 'video'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Video className="w-4 h-4 text-blue-600" />
                        <span>HD Video</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDialModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!dialTarget}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      Place Call
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallsPage;
