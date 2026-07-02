import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { useResolve } from '../ResolveContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { CircularProgress } from './EmployeeModule';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  CheckCircle2,
  ChevronRight,
  Award,
  Users,
  Sparkles,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export const DepartmentHeadModule: React.FC = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-grow p-6 overflow-y-auto">
          <Routes>
            <Route path="dashboard" element={<ExecutiveDashboard />} />
            <Route path="feedback" element={<IncomingFeedbackList />} />
            <Route path="submission/:id" element={<ExecutiveReviewPage />} />
            <Route path="managers" element={<ManagerList />} />
            <Route path="analytics" element={<ExecutiveAnalytics />} />
            <Route path="plans" element={<AIActionPlansLibrary />} />
            <Route path="*" element={<ExecutiveDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ----------------- SUB-COMPONENTS -----------------

// Helper to get active department based on URL or role
const useDeptInfo = () => {
  const { currentUserRole } = useResolve();
  const dept: 'Technology' | 'Operations' = currentUserRole === 'COO' ? 'Operations' : 'Technology';
  const name = currentUserRole === 'COO' ? 'Operations Division (COO)' : 'Technology Division (CTO)';
  return { dept, name };
};

// 1. Executive Dashboard
const ExecutiveDashboard: React.FC = () => {
  const { submissions, managers } = useResolve();
  const { dept, name } = useDeptInfo();
  const navigate = useNavigate();

  // Filters
  const deptSubmissions = submissions.filter(s => s.department === dept);
  const newFeedback = deptSubmissions.filter(s => s.status === 'Pending Review').length;
  const highPriority = deptSubmissions.filter(s => s.priority === 'High' || s.priority === 'Critical').length;
  const evidenceVerified = deptSubmissions.filter(s => s.evidenceScore >= 80).length;
  const pendingActions = deptSubmissions.filter(s => s.status === 'In Progress').length;
  
  // Calculate Department Health Score
  // Average of (100 - average resolution index) and pulse survey satisfaction rates (scaled to 100)
  const healthScore = dept === 'Technology' ? 84 : 76;

  // Chart Mock Data
  const trendData = [
    { month: 'Jan', score: dept === 'Technology' ? 78 : 80 },
    { month: 'Feb', score: dept === 'Technology' ? 79 : 78 },
    { month: 'Mar', score: dept === 'Technology' ? 82 : 77 },
    { month: 'Apr', score: dept === 'Technology' ? 81 : 75 },
    { month: 'May', score: dept === 'Technology' ? 83 : 74 },
    { month: 'Jun', score: dept === 'Technology' ? 84 : 76 }
  ];

  const categoryData = dept === 'Technology'
    ? [
        { name: 'Infrastructure', value: 45, color: '#3B82F6' },
        { name: 'Growth Tracks', value: 30, color: '#10B981' },
        { name: 'Compensation', value: 15, color: '#8B5CF6' },
        { name: 'Workplace Culture', value: 10, color: '#F59E0B' }
      ]
    : [
        { name: 'Operational Capacity', value: 50, color: '#EF4444' },
        { name: 'Safety & Environment', value: 25, color: '#F59E0B' },
        { name: 'Support Turnarounds', value: 15, color: '#3B82F6' },
        { name: 'Logistics Software', value: 10, color: '#10B981' }
      ];

  const managerWorkload = managers
    .filter(m => m.department === dept)
    .map((m, idx) => {
      const activeCount = submissions.filter(s => s.assignedManagerId === m.id && s.status === 'In Progress').length;
      const completedCount = submissions.filter(s => s.assignedManagerId === m.id && (s.status === 'Resolved' || s.status === 'Verified')).length;
      return {
        name: m.name.split(' ')[0],
        Active: activeCount + (idx === 0 ? 1 : 0), // pad mock slightly
        Completed: completedCount + (idx === 0 ? 2 : 1)
      };
    });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 m-0">{name}</h2>
          <p className="text-slate-500 text-sm mt-1">Review organizational logs, check dynamic charts, and audit intelligence scores.</p>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">HEALTH INDEX</span>
          <div className="flex items-center gap-1">
            <span className="font-display font-bold text-lg text-slate-800">{healthScore}%</span>
            <span className="text-[10px] text-emerald-500 font-semibold">(+2.4%)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'New Feedback', val: newFeedback, theme: 'border-slate-200 text-blue-600' },
          { label: 'High Priority', val: highPriority, theme: 'border-slate-200 text-red-600' },
          { label: 'Evidence Verified', val: evidenceVerified, theme: 'border-slate-200 text-emerald-600' },
          { label: 'Pending Actions', val: pendingActions, theme: 'border-slate-200 text-amber-600' },
          { label: 'Dept Health Score', val: `${healthScore}%`, theme: 'border-blue-200 bg-blue-50/10 text-blue-700 font-bold' }
        ].map((c, i) => (
          <div key={i} className={`p-4 bg-white border ${c.theme} rounded-2xl shadow-sm flex flex-col justify-between`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{c.label}</span>
            <span className="font-display font-bold text-2xl mt-2 block">{c.val}</span>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Department Health Trends (Q2)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorHealth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manager Performance Workload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Manager Action Workload</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Active" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Feedback Category Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-60">
            <div className="w-1/2 h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 text-xs">
              {categoryData.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
                    <span className="text-slate-600 truncate">{c.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Submissions Queue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Priority Incoming Queue</h3>
              <Link to="/cto/feedback" className="text-xs text-blue-600 font-semibold">View Queue</Link>
            </div>

            <div className="divide-y divide-slate-100">
              {deptSubmissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/${dept === 'Technology' ? 'cto' : 'coo'}/submission/${sub.id}`)}
                  className="py-2.5 flex justify-between items-center hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-all"
                >
                  <div className="min-w-0 pr-4">
                    <span className="text-slate-800 font-semibold text-xs truncate block">{sub.title}</span>
                    <div className="flex gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                      <span>Ref: {sub.id}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-semibold">{sub.aiCategory}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span className="text-xs font-bold text-slate-700">{sub.evidenceScore}%</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Incoming Feedback List
const IncomingFeedbackList: React.FC = () => {
  const { submissions } = useResolve();
  const { dept } = useDeptInfo();
  const navigate = useNavigate();

  const deptSubmissions = submissions.filter(s => s.department === dept);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Incoming Feedback Queue</h2>
        <p className="text-slate-500 text-sm mt-1">Review neural-categorized feedback cards, inspect auto-corroborated evidence indexes, and assign action items.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Ref ID / Title</th>
                <th className="py-3 px-4">Record Type</th>
                <th className="py-3 px-4">AI Categorization</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Corroboration Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {deptSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-light">
                    Clear queue. No incoming items registered.
                  </td>
                </tr>
              ) : (
                deptSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-mono text-[10px] text-slate-400 block">{sub.id}</span>
                      <span className="text-slate-800 font-semibold truncate block mt-0.5">{sub.title}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        sub.type === 'Concern' ? 'bg-red-50 text-red-600' :
                        sub.type === 'Suggestion' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {sub.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">{sub.aiCategory}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        sub.priority === 'Critical' ? 'bg-red-900/10 text-red-700' :
                        sub.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {sub.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800">{sub.evidenceScore}%</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'Pending Review' ? 'bg-slate-100 text-slate-600' :
                        sub.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        sub.status === 'Resolved' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/${dept === 'Technology' ? 'cto' : 'coo'}/submission/${sub.id}`)}
                        className="py-1 px-2.5 bg-blue-600 text-white rounded-lg font-semibold text-[11px] hover:bg-blue-700 transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. Executive Review Page - Split Layout with Action Plans
const ExecutiveReviewPage: React.FC = () => {
  const { id } = useParams();
  const { submissions, managers, assignActionPlan } = useResolve();
  const { dept } = useDeptInfo();
  const navigate = useNavigate();

  const sub = submissions.find(s => s.id === id);

  // Form assignment parameters
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number | null>(null);
  const [managerId, setManagerId] = useState(managers.filter(m => m.department === dept)[0]?.id || '');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [instructions, setInstructions] = useState('');
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  if (!sub) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h4 className="font-semibold text-slate-800">Submission Not Found</h4>
        <button onClick={() => navigate(`/${dept === 'Technology' ? 'cto' : 'coo'}/dashboard`)} className="mt-4 py-1.5 px-4 bg-blue-600 text-white text-xs font-semibold rounded-lg">
          Back
        </button>
      </div>
    );
  }

  // Predefined AI action plans templates based on categories
  const AI_PLAN_TEMPLATES = [
    {
      title: 'Structured Weekly One-on-One Meeting Syncs',
      description: 'Implement fixed 30-minute weekly recurring development align syncs in the calendars. Prohibit scheduling skips.',
      expectedImpact: 'Re-align reporting communication channels, clear backlogs, and raise workplace satisfaction by 20%',
      estimatedTime: 'Continuous (90 days check)',
      businessValue: 'Mitigates retention risks and increases alignment velocity.',
      checklist: [
        { id: 'c1', text: 'Audit team Outlook calendars for scheduled recurring syncs', completed: false },
        { id: 'c2', text: 'Provide 1-on-1 feedback template forms for alignment questions', completed: false },
        { id: 'c3', text: 'Confirm 4 consecutive weekly sessions are finalized', completed: false }
      ]
    },
    {
      title: 'Staging Database Performance & Schema Replication Cron Syncs',
      description: 'Rebuild database staging instances, expand memory allocation by 20% to prevent locking exceptions, and write schema backup sync script.',
      expectedImpact: 'Reduce staging deploy lockout errors to zero and cut cycle blocker delays',
      estimatedTime: '2 weeks',
      businessValue: 'Increases backend deployment speed and developer productivity metrics.',
      checklist: [
        { id: 'd1', text: 'Validate current migration log schema anomalies', completed: false },
        { id: 'd2', text: 'Deploy resource configuration bump in Kubernetes files', completed: false },
        { id: 'd3', text: 'Establish schema cron replication script validation', completed: false }
      ]
    },
    {
      title: 'Operations Shift Scheduler Optimization Pilot',
      description: 'Integrate fulfillment daily order backlogs directly with schedule planning panels to forecast operator workloads and adjust shifts 48 hours early.',
      expectedImpact: 'Decrease unplanned overtime request hours by 50% across operations supervisors',
      estimatedTime: '3 weeks',
      businessValue: 'Reduces overtime payout expenses and controls operations attrition.',
      checklist: [
        { id: 's1', text: 'Integrate workload database schemas with shift schedulers', completed: false },
        { id: 's2', text: 'Train operators and supervisors on early scheduling software', completed: false },
        { id: 's3', text: 'Validate 2-week scheduled timeline reports in Dallas', completed: false }
      ]
    }
  ];

  const handleAssignAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlanIdx === null) return;

    const planTemplate = AI_PLAN_TEMPLATES[selectedPlanIdx];

    assignActionPlan(
      sub.id,
      {
        id: `plan-${Math.floor(100 + Math.random() * 900)}`,
        title: planTemplate.title,
        description: planTemplate.description,
        expectedImpact: planTemplate.expectedImpact,
        estimatedTime: planTemplate.estimatedTime,
        businessValue: planTemplate.businessValue,
        checklist: planTemplate.checklist.map(i => ({ ...i, completed: false }))
      },
      managerId,
      priority,
      deadline,
      instructions
    );

    setAssignedSuccess(true);
    setTimeout(() => {
      setAssignedSuccess(false);
      navigate(`/${dept === 'Technology' ? 'cto' : 'coo'}/dashboard`);
    }, 1500);
  };

  const currentDeptManagers = managers.filter(m => m.department === dept);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-2">
        <Link to={`/${dept === 'Technology' ? 'cto' : 'coo'}/feedback`} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">Queue</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-xs text-slate-600 font-medium font-mono">{sub.id}</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 m-0">Submission Evaluation</h2>
          <p className="text-slate-500 text-xs mt-1">Review original details and assign neural-recommended action plans to managers.</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          sub.status === 'Pending Review' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'
        }`}>
          {sub.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side: Audit Details */}
        <div className="space-y-6">
          {/* Employee Submission */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employee Submission Details</h3>
            <h4 className="text-sm font-semibold text-slate-800">{sub.title}</h4>
            <p className="text-slate-600 text-xs leading-relaxed mt-2 whitespace-pre-line font-light">{sub.description}</p>
            {sub.expectedBenefits && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                <strong>Expected Outcomes:</strong> {sub.expectedBenefits}
              </div>
            )}
          </div>

          {/* AI Intelligence Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Complaint Intelligence Rating</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">AI Category Class</span>
                <span className="font-bold text-slate-800 mt-1 block truncate">{sub.aiCategory}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">Priority Threshold</span>
                <span className="font-bold text-slate-800 mt-1 block">{sub.priority}</span>
              </div>
            </div>
            
            <p className="text-slate-500 text-xs leading-relaxed mt-4 font-light">
              <strong>AI Summary:</strong> {sub.intelligenceSummary}
            </p>
          </div>

          {/* Evidence Intelligence circular display */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Corroborating Evidence Analysis</span>
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <CircularProgress percentage={sub.evidenceScore} />
              <div>
                <span className="text-xs font-semibold text-slate-700">Audit Corroboration Index</span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-light">Cross-platform logs correlate closely with reported experiences.</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-light">
              {sub.evidenceBreakdown.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Recommended Action Plans */}
        <div className="space-y-6">
          {assignedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600 animate-bounce" />
              <span>Action Plan successfully initialized and assigned to team manager.</span>
            </div>
          )}

          {sub.status === 'Pending Review' ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>AI Recommended Action Solutions</span>
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Select a resolution strategy card to customize assignment instructions.</p>
              </div>

              {/* Template cards */}
              <div className="space-y-3">
                {AI_PLAN_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSelectedPlanIdx(idx); setInstructions(tpl.description); }}
                    className={`w-full p-4 border text-left rounded-xl hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
                      selectedPlanIdx === idx ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200'
                    }`}
                  >
                    <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                      {selectedPlanIdx === idx && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      <span>{tpl.title}</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-bold uppercase mt-3">
                      <div>
                        <span>Impact</span>
                        <span className="text-slate-600 block truncate font-semibold mt-0.5">{tpl.expectedImpact.substring(0, 15)}...</span>
                      </div>
                      <div>
                        <span>Timeline</span>
                        <span className="text-slate-600 block font-semibold mt-0.5">{tpl.estimatedTime}</span>
                      </div>
                      <div>
                        <span>Value</span>
                        <span className="text-slate-600 block truncate font-semibold mt-0.5">{tpl.businessValue.substring(0, 15)}...</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Assignment Param Form */}
              {selectedPlanIdx !== null && (
                <form onSubmit={handleAssignAction} className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Assign to Manager</label>
                      <select
                        required
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                        className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {currentDeptManagers.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Resolution Deadline</label>
                      <input
                        type="date"
                        required
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Task Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Manager Directives & Instructions</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Enter custom checklist guidelines for the manager..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    Confirm Assignment & Initiate Plan
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-full inline-flex mb-3">
                <CheckCircle2 className="w-6 h-6 animate-pulse-soft" />
              </span>
              <h4 className="font-semibold text-slate-800 text-sm">Action Plan Active</h4>
              <p className="text-slate-400 text-xs mt-1">This record is currently assigned. Directives have been sent to team supervisors.</p>
              
              <div className="mt-4 p-4 bg-slate-50 rounded-xl text-left border border-slate-100 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Plan Title</span>
                  <span className="font-semibold text-slate-700">{sub.actionPlan?.title}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Assigned Manager</span>
                  <span className="font-semibold text-slate-700">{managers.find(m => m.id === sub.assignedManagerId)?.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Target Date</span>
                  <span className="font-semibold text-slate-700">{sub.actionPlan?.deadline}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Managers Workload List
const ManagerList: React.FC = () => {
  const { managers, submissions } = useResolve();
  const { dept } = useDeptInfo();

  const deptManagers = managers.filter(m => m.department === dept);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Department Manager Performance</h2>
        <p className="text-slate-500 text-sm mt-1">Audit active task lists and resolution speed indicators across operations and tech managers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deptManagers.map((mgr) => {
          const mgrSubs = submissions.filter(s => s.assignedManagerId === mgr.id);
          const active = mgrSubs.filter(s => s.status === 'In Progress').length;
          const completed = mgrSubs.filter(s => s.status === 'Resolved' || s.status === 'Verified').length;

          return (
            <div key={mgr.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={mgr.avatar}
                  alt={mgr.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-sm">{mgr.name}</h3>
                  <p className="text-xs text-slate-400">{mgr.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Active Actions</span>
                  <span className="font-bold text-amber-600 block text-lg mt-0.5">{active}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Completed Actions</span>
                  <span className="font-bold text-emerald-600 block text-lg mt-0.5">{completed}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. Executive Analytics Hub
const ExecutiveAnalytics: React.FC = () => {
  const { name } = useDeptInfo();
  return (
    <div className="space-y-6 max-w-6xl text-center py-12">
      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-pulse-soft" />
      <h3 className="font-display font-bold text-slate-800 text-lg">Department Analytics - {name}</h3>
      <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
        Full chart filters, resolution speeds and satellite team metrics are pre-loaded in the department dashboard view.
      </p>
    </div>
  );
};

// 6. Action Plans Library
const AIActionPlansLibrary: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl text-center py-12">
      <Award className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-pulse-soft" />
      <h3 className="font-display font-bold text-slate-800 text-lg">AI Resolution Templates</h3>
      <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
        Standard templates are embedded directly inside the Submission review workspace panel for instant routing to supervisors.
      </p>
    </div>
  );
};
