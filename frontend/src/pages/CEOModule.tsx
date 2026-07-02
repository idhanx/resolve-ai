import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useResolve } from '../ResolveContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import {
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
  Legend,
  LineChart,
  Line
} from 'recharts';
import {
  Trophy,
  Building2,
  LineChart as LineChartIcon,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CEOModule: React.FC = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-grow p-6 overflow-y-auto">
          <Routes>
            <Route path="dashboard" element={<CEODashboard />} />
            <Route path="departments" element={<CEODepartments />} />
            <Route path="analytics" element={<CEOAnalytics />} />
            <Route path="board" element={<CEODashboard />} />
            <Route path="*" element={<CEODashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ----------------- SUB-COMPONENTS -----------------

const CEODashboard: React.FC = () => {
  const { submissions } = useResolve();

  // Statistics
  const verified = submissions.filter(s => s.status === 'Verified').length;
  const open = submissions.filter(s => s.status === 'In Progress' || s.status === 'Pending Review').length;

  const accountabilityIndex = 87; // global corporate index percentage
  const avgResolutionTime = 8.4; // in days
  const averageDeptHealth = 80;

  // Chart data
  const trendsData = [
    { month: 'Jan', Tech: 80, Ops: 76, Satisfaction: 3.8 },
    { month: 'Feb', Tech: 81, Ops: 75, Satisfaction: 3.9 },
    { month: 'Mar', Tech: 83, Ops: 77, Satisfaction: 4.1 },
    { month: 'Apr', Tech: 82, Ops: 74, Satisfaction: 4.0 },
    { month: 'May', Tech: 84, Ops: 73, Satisfaction: 4.2 },
    { month: 'Jun', Tech: 85, Ops: 76, Satisfaction: 4.3 }
  ];

  const evidenceDist = [
    { name: 'Critical (90%+ match)', value: 40, color: '#EF4444' },
    { name: 'High (80-90% match)', value: 35, color: '#F59E0B' },
    { name: 'Medium (70-80% match)', value: 15, color: '#3B82F6' },
    { name: 'Low (<70% match)', value: 10, color: '#10B981' }
  ];

  const resolutionRates = [
    { name: 'Tech Infrastructure', Resolved: 89, Pending: 11 },
    { name: 'Tech Growth Paths', Resolved: 72, Pending: 28 },
    { name: 'Ops Shift Burnout', Resolved: 91, Pending: 9 },
    { name: 'Ops Performance Audit', Resolved: 95, Pending: 5 }
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Enterprise Overview</h2>
        <p className="text-slate-500 text-sm mt-1">Audit organization-wide accountability progress and department health indexes.</p>
      </div>

      {/* Large KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Company Accountability Index', val: `${accountabilityIndex}%`, icon: ShieldCheck, trend: '(+3.2% vs Q1)', theme: 'border-blue-200 bg-blue-50/10 text-blue-700' },
          { label: 'Average Department Health', val: `${averageDeptHealth}%`, icon: Trophy, trend: '(Stable)', theme: 'border-slate-200 text-slate-800' },
          { label: 'Average Resolution Time', val: `${avgResolutionTime} Days`, icon: Clock, trend: '(-1.2 days speed)', theme: 'border-slate-200 text-slate-800' },
          { label: 'Verified Improvements', val: verified, icon: CheckCircle2, trend: '(100% audit audit)', theme: 'border-emerald-200 bg-emerald-50/10 text-emerald-700' },
          { label: 'Open Action Plans', val: open, icon: AlertCircle, trend: '(Assigned)', theme: 'border-slate-200 text-slate-800' }
        ].map((c, i) => (
          <div key={i} className={`p-5 bg-white border ${c.theme} rounded-2xl shadow-sm flex flex-col justify-between`}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 max-w-[80%]">{c.label}</span>
              <c.icon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-4">
              <span className="font-display font-extrabold text-2xl block">{c.val}</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">{c.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Department Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technology Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="font-display font-bold text-sm text-slate-800">Technology Department</span>
            </div>
            <div className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">Health: 85%</div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Dept Head</span>
              <span className="font-semibold text-slate-800 mt-1 block">Dr. Aris Thorne</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Active Plans</span>
              <span className="font-bold text-amber-600 mt-1 block">3 Pending</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Resolved Speed</span>
              <span className="font-bold text-emerald-600 mt-1 block">6.2 Days</span>
            </div>
          </div>
        </div>

        {/* Operations Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span className="font-display font-bold text-sm text-slate-800">Operations Department</span>
            </div>
            <div className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">Health: 76%</div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Dept Head</span>
              <span className="font-semibold text-slate-800 mt-1 block">Marcus Sterling</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Active Plans</span>
              <span className="font-bold text-amber-600 mt-1 block">2 Pending</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Resolved Speed</span>
              <span className="font-bold text-emerald-600 mt-1 block">10.5 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback & Satisfaction Trends */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pulse Engagement Satisfaction Trends</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[3.0, 5.0]} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Satisfaction" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evidence Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Evidence Corroboration Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-60">
            <div className="w-1/2 h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={evidenceDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {evidenceDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 text-xs">
              {evidenceDist.map((e, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }}></span>
                    <span className="text-slate-600 truncate">{e.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resolution Quality Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Submissions Evidence Corroboration vs Resolution Index</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionRates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const CEODepartments: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl text-center py-12">
      <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-pulse-soft" />
      <h3 className="font-display font-bold text-slate-800 text-lg">Department Audits</h3>
      <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
        Full department scorecard summaries are pre-loaded in the primary overview dashboard sheet.
      </p>
    </div>
  );
};

const CEOAnalytics: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl text-center py-12">
      <LineChartIcon className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-pulse-soft" />
      <h3 className="font-display font-bold text-slate-800 text-lg">Analytics Overview</h3>
      <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
        Feedback curves and evidence ratings are displayed on the main dashboard tab.
      </p>
    </div>
  );
};
