import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { useResolve } from '../ResolveContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import {
  ChevronRight,
  Sparkles,
  Paperclip,
  Check,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export const ManagerModule: React.FC = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-grow p-6 overflow-y-auto">
          <Routes>
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="actions" element={<AssignedActionsList />} />
            <Route path="action/:id" element={<ManagerActionDetails />} />
            <Route path="completed" element={<CompletedActionsList />} />
            <Route path="profile" element={<ManagerProfile />} />
            <Route path="*" element={<ManagerDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ----------------- SUB-COMPONENTS -----------------

// 1. Manager Dashboard
const ManagerDashboard: React.FC = () => {
  const { submissions, currentUserId } = useResolve();
  const navigate = useNavigate();

  // Filter actions assigned to this manager
  const managerActions = submissions.filter(s => s.assignedManagerId === currentUserId && s.actionPlan);
  const activeCount = managerActions.filter(s => s.status === 'In Progress').length;
  const completedCount = managerActions.filter(s => s.status === 'Resolved' || s.status === 'Verified').length;
  const overdueCount = 0; // standard mock tracker

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Manager Workspace</h2>
        <p className="text-slate-500 text-sm mt-1">Review active checklists, complete action plans, and upload proof verification logs.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Plans', val: managerActions.length, theme: 'border-slate-200 text-slate-700' },
          { label: 'In Progress', val: activeCount, theme: 'border-amber-200 text-amber-600' },
          { label: 'Completed', val: completedCount, theme: 'border-emerald-200 text-emerald-600' },
          { label: 'Overdue Tasks', val: overdueCount, theme: 'border-slate-200 text-slate-400' }
        ].map((c, i) => (
          <div key={i} className={`p-4 bg-white border ${c.theme} rounded-2xl shadow-sm flex flex-col justify-between`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{c.label}</span>
            <span className="font-display font-bold text-2xl mt-2 block">{c.val}</span>
          </div>
        ))}
      </div>

      {/* Active Tasks Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Assigned Resolution Tasks</h3>
        <div className="divide-y divide-slate-100">
          {managerActions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-light">
              No active tasks in your queue.
            </div>
          ) : (
            managerActions.map(sub => (
              <div
                key={sub.id}
                onClick={() => navigate(`/manager/action/${sub.id}`)}
                className="py-3 flex justify-between items-center hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-all"
              >
                <div className="min-w-0 pr-4">
                  <span className="text-slate-800 font-semibold text-xs block">{sub.actionPlan?.title}</span>
                  <div className="flex gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                    <span>Target: {sub.actionPlan?.deadline}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">{sub.aiCategory}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-xs text-slate-500 font-semibold">Progress: {sub.actionPlan?.progress}%</div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// 2. Assigned Actions List
const AssignedActionsList: React.FC = () => {
  const { submissions, currentUserId } = useResolve();
  const navigate = useNavigate();

  const activeActions = submissions.filter(
    s => s.assignedManagerId === currentUserId && s.actionPlan && s.status === 'In Progress'
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Assigned Actions</h2>
        <p className="text-slate-500 text-sm mt-1">Check active guidelines, tick off checkboxes, and record resolution outcomes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeActions.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs font-light col-span-2">
            No pending action items assigned.
          </div>
        ) : (
          activeActions.map(sub => (
            <div key={sub.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">In Progress</span>
                  <span className="text-[10px] font-mono text-slate-400">{sub.actionPlan?.deadline}</span>
                </div>
                <h3 className="font-display font-semibold text-slate-800 text-sm mt-2">{sub.actionPlan?.title}</h3>
                <p className="text-slate-500 text-xs mt-1 font-light leading-normal line-clamp-2">{sub.actionPlan?.description}</p>
              </div>
              
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Progress: {sub.actionPlan?.progress}%</span>
                <button
                  onClick={() => navigate(`/manager/action/${sub.id}`)}
                  className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-sm"
                >
                  Manage
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 3. Assigned Action Details & Update checklists & file uploading simulator
const ManagerActionDetails: React.FC = () => {
  const { id } = useParams();
  const { submissions, updateManagerActionProgress, completeManagerAction } = useResolve();
  const navigate = useNavigate();

  const sub = submissions.find(s => s.id === id);

  const [notes, setNotes] = useState(sub?.actionPlan?.completionNotes || '');
  const [proofName, setProofName] = useState(sub?.actionPlan?.proofFileName || '');
  const [completedSuccess, setCompletedSuccess] = useState(false);

  if (!sub || !sub.actionPlan) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h4 className="font-semibold text-slate-800">Action Plan Not Found</h4>
        <button onClick={() => navigate('/manager/dashboard')} className="mt-4 py-1.5 px-4 bg-blue-600 text-white text-xs font-semibold rounded-lg">
          Back
        </button>
      </div>
    );
  }

  const handleToggleChecklistItem = (itemId: string) => {
    const updatedChecklist = sub.actionPlan!.checklist.map(item => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    // Calculate progress percentage
    const completedCount = updatedChecklist.filter(item => item.completed).length;
    const progress = Math.round((completedCount / updatedChecklist.length) * 100);

    updateManagerActionProgress(sub.id, updatedChecklist, progress, notes, proofName ? { name: proofName, url: '#' } : undefined);
  };

  const simulateProofUpload = (fileName: string) => {
    setProofName(fileName);
    updateManagerActionProgress(sub.id, sub.actionPlan!.checklist, sub.actionPlan!.progress, notes, { name: fileName, url: '#' });
  };

  const handleCompleteAction = (e: React.FormEvent) => {
    e.preventDefault();
    completeManagerAction(sub.id, notes, proofName ? { name: proofName, url: '#' } : undefined);
    setCompletedSuccess(true);
    setTimeout(() => {
      setCompletedSuccess(false);
      navigate('/manager/dashboard');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-2">
        <Link to="/manager/actions" className="text-xs text-slate-400 hover:text-slate-600 font-semibold font-sans">Actions</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-xs text-slate-600 font-medium font-mono">{sub.id}</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 m-0">Resolution Execution</h2>
          <p className="text-slate-500 text-xs mt-1">Review guidelines, fulfill tasks, and upload deployment verify proof documents.</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          sub.status === 'Resolved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700 animate-pulse-soft'
        }`}>
          {sub.status === 'Resolved' ? 'Completed' : 'In Progress'}
        </span>
      </div>

      {completedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-600 animate-bounce" />
          <span>Resolution submitted. Employee has been notified for improvement verification auditing.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee context summary & evidence */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Experience Context</span>
              <h4 className="text-sm font-semibold text-slate-800 mt-2">{sub.title}</h4>
              <p className="text-slate-600 text-xs leading-relaxed font-light mt-1 whitespace-pre-line">{sub.description}</p>
            </div>
            
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AI Computed Evidence Logs</span>
              <div className="space-y-1.5 text-xs text-slate-500 font-light">
                {sub.evidenceBreakdown.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action checklist updates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Plan Checklist</h3>
              <span className="text-xs font-semibold text-slate-600">Progress: {sub.actionPlan.progress}%</span>
            </div>
            
            <div className="space-y-2">
              {sub.actionPlan.checklist.map((item) => (
                <button
                  key={item.id}
                  disabled={sub.status === 'Resolved'}
                  onClick={() => handleToggleChecklistItem(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    item.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    item.completed ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                  }`}>
                    {item.completed && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <span className={`text-xs ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Directives & submission form */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Executive Directives</span>
              <p className="text-slate-600 text-xs leading-relaxed mt-2 font-light">{sub.actionPlan.instructions}</p>
            </div>
            
            <div className="pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Resolution Deadline</span>
                <span className="font-semibold text-slate-700">{sub.actionPlan.deadline}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Priority Level</span>
                <span className="font-semibold text-red-600">{sub.actionPlan.priority}</span>
              </div>
            </div>
          </div>

          {sub.status === 'In Progress' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Complete Action Resolution</h3>
              
              <form onSubmit={handleCompleteAction} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Resolution Summary Notes</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter summary notes on resolution implementation details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Upload Completion Evidence</label>
                  <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition-all relative">
                    <input
                      type="file"
                      id="proof-upload"
                      className="hidden"
                      onChange={(e) => simulateProofUpload(e.target.files?.[0]?.name || 'resolution_evidence.pdf')}
                    />
                    <label htmlFor="proof-upload" className="cursor-pointer block text-xs">
                      <Paperclip className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <span className="text-blue-600 font-semibold block">{proofName || 'Select proof file'}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">PDF or Spreadsheet logs</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sub.actionPlan.progress < 100}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  Mark Complete & Submit Verification
                </button>
                {sub.actionPlan.progress < 100 && (
                  <p className="text-[10px] text-amber-500 text-center font-semibold mt-1">Please tick all checklist items to unlock submission.</p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Completed Actions List
const CompletedActionsList: React.FC = () => {
  const { submissions, currentUserId } = useResolve();
  const completedActions = submissions.filter(
    s => s.assignedManagerId === currentUserId && s.actionPlan && (s.status === 'Resolved' || s.status === 'Verified')
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Completed Actions</h2>
        <p className="text-slate-500 text-sm mt-1">Review resolution items signed off by management and audit comments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {completedActions.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs font-light col-span-2">
            No completed actions logged.
          </div>
        ) : (
          completedActions.map(sub => (
            <div key={sub.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">Completed</span>
                <span className="text-[10px] font-mono text-slate-400">{sub.actionPlan?.completedAt}</span>
              </div>
              <h3 className="font-display font-semibold text-slate-800 text-sm">{sub.actionPlan?.title}</h3>
              <p className="text-slate-500 text-xs font-light leading-normal line-clamp-2">{sub.actionPlan?.description}</p>
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="font-semibold text-slate-700">Resolution Notes:</div>
                <p className="text-slate-500 text-xs mt-1 font-light italic">"{sub.actionPlan?.completionNotes}"</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 5. Manager Profile
const ManagerProfile: React.FC = () => {
  const { currentUserName, currentUserDept, currentUserAvatar } = useResolve();
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Manager Profile</h2>
        <p className="text-slate-500 text-sm mt-1">View personal department details.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-center">
        <img
          src={currentUserAvatar}
          alt={currentUserName}
          className="w-16 h-16 rounded-full mx-auto border border-slate-200 object-cover"
        />
        <div>
          <h3 className="font-display font-bold text-slate-800 text-sm">{currentUserName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{currentUserDept} Supervisor</p>
        </div>
      </div>
    </div>
  );
};
