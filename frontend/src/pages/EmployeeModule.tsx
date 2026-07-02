import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { useResolve } from '../ResolveContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import {
  FileText,
  AlertOctagon,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Send,
  Sparkles,
  Paperclip,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Check,
  ShieldCheck,
  Award,
  Bell
} from 'lucide-react';

// Circular Progress Component for Evidence score
export const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({
  percentage,
  size = 72,
  strokeWidth = 6
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-blue-600 transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute font-display font-bold text-sm text-slate-800">{percentage}%</span>
    </div>
  );
};

export const EmployeeModule: React.FC = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-grow p-6 overflow-y-auto relative">
          <Routes>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="engagement" element={<EmployeeEngagement />} />
            <Route path="submissions" element={<EmployeeSubmissions />} />
            <Route path="submission/:id" element={<SubmissionDetails />} />
            <Route path="notifications" element={<EmployeeNotifications />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="*" element={<EmployeeDashboard />} />
          </Routes>
          {/* Floating AI Assistant Trigger & Widget */}
          <AIAssistantWidget />
        </main>
      </div>
    </div>
  );
};

// ----------------- SUB-COMPONENTS -----------------

// 1. Employee Dashboard
const EmployeeDashboard: React.FC = () => {
  const { submissions } = useResolve();
  const navigate = useNavigate();

  // Statistics
  const total = submissions.length;
  const pending = submissions.filter(s => s.status === 'Pending Review').length;
  const inProgress = submissions.filter(s => s.status === 'In Progress').length;
  const resolved = submissions.filter(s => s.status === 'Resolved').length;
  const verified = submissions.filter(s => s.status === 'Verified').length;

  const quickActions = [
    { title: 'Share Feedback', desc: 'General workplace remarks', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-100', path: '/employee/engagement?type=feedback' },
    { title: 'Raise Concern', desc: 'Report blockers or issues', icon: AlertOctagon, color: 'text-amber-600 bg-amber-50 border-amber-100', path: '/employee/engagement?type=concern' },
    { title: 'Share Suggestion', desc: 'Propose workspace ideas', icon: Lightbulb, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', path: '/employee/engagement?type=suggestion' },
    { title: 'Take Pulse Survey', desc: 'Share sat insights in 1 min', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', path: '/employee/engagement?type=survey' }
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Accountability Center</h2>
        <p className="text-slate-500 text-sm mt-1">Track your feedback, view real-time evidence ratings, and verify organizational improvements.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Requests', val: total, theme: 'border-slate-200' },
          { label: 'Pending Review', val: pending, theme: 'border-slate-200 text-slate-600' },
          { label: 'In Progress', val: inProgress, theme: 'border-amber-200 text-amber-600' },
          { label: 'Resolved Actions', val: resolved, theme: 'border-blue-200 text-blue-600' },
          { label: 'Verified Complete', val: verified, theme: 'border-emerald-200 text-emerald-600' }
        ].map((c, i) => (
          <div key={i} className={`p-4 bg-white border ${c.theme} rounded-2xl shadow-sm flex flex-col justify-between`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{c.label}</span>
            <span className="font-display font-bold text-2xl mt-2 block">{c.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Help */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-semibold text-slate-800 text-base mb-4">Quick Share Hub</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(a.path)}
                  className={`p-4 border rounded-xl hover:shadow-md text-left transition-all group flex items-start gap-3 cursor-pointer ${a.color}`}
                >
                  <a.icon className="w-5 h-5 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800 flex items-center gap-1 group-hover:text-blue-600">
                      <span>{a.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all ml-0.5" />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 font-normal">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submissions Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-slate-800 text-base">Your Active Submissions</h3>
              <Link to="/employee/submissions" className="text-xs text-blue-600 font-semibold hover:text-blue-700">View all</Link>
            </div>
            
            <div className="divide-y divide-slate-100">
              {submissions.slice(0, 3).map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-all">
                  <div className="flex items-start gap-3 min-w-0 pr-4">
                    <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      sub.type === 'Concern' ? 'bg-red-50 text-red-600' : sub.type === 'Suggestion' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {sub.type === 'Concern' && <AlertOctagon className="w-4 h-4" />}
                      {sub.type === 'Suggestion' && <Lightbulb className="w-4 h-4" />}
                      {sub.type === 'Feedback' && <FileText className="w-4 h-4" />}
                      {sub.type === 'Survey' && <TrendingUp className="w-4 h-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate m-0">{sub.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="font-medium">{sub.aiCategory}</span>
                        <span>•</span>
                        <span>{sub.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      sub.status === 'Pending Review' ? 'bg-slate-100 text-slate-600' :
                      sub.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                      sub.status === 'Resolved' ? 'bg-blue-100 text-blue-700 animate-pulse-soft' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {sub.status}
                    </span>
                    <button
                      onClick={() => navigate(`/employee/submission/${sub.id}`)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Highlights */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-semibold text-slate-800 text-base mb-4">Organizational Impact</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Resolution Completed</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Manager Sophia Rodriguez completed "Staging Database Schema Sync Automation" in Tech.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Company Accountability Score</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">The global Accountability Index reached 87%, marking a 4% increase in team resolution speed.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>AI Evidence Verification</span>
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed font-light">
              Our automated system analyzes submissions using integrations (GitHub commits, payroll timelines, Jira logs) to compute an objective confidence score. This speeds up routing directly to executives, bypassing manual approval delays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Engagement Hub Page & Forms
const EmployeeEngagement: React.FC = () => {
  const navigate = useNavigate();
  const { addSubmission } = useResolve();
  
  // URL Parameter parsing
  const query = new URLSearchParams(window.location.search);
  const initialForm = query.get('type') || '';

  const [activeForm, setActiveForm] = useState<string>(initialForm);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dept, setDept] = useState<'Technology' | 'Operations'>('Technology');
  const [benefits, setBenefits] = useState('');
  const [evidenceName, setEvidenceName] = useState<string | null>(null);

  // Survey Multi-step States
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyRatings, setSurveyRatings] = useState({
    communication: 3,
    growth: 3,
    managerSupport: 3,
    environment: 3,
    recognition: 3,
    workLifeBalance: 3
  });

  const handleFormReset = () => {
    setActiveForm('');
    setSuccessId(null);
    setTitle('');
    setDescription('');
    setBenefits('');
    setEvidenceName(null);
    setSurveyStep(1);
  };

  const handleFormSubmit = (e: React.FormEvent, type: 'Feedback' | 'Concern' | 'Suggestion') => {
    e.preventDefault();
    const subId = addSubmission({
      type,
      title,
      description,
      expectedBenefits: type === 'Suggestion' ? benefits : undefined,
      department: dept,
      evidenceFiles: evidenceName ? [{ name: evidenceName, size: '2.4 MB', type: 'image/png' }] : []
    });
    setSuccessId(subId);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subId = addSubmission({
      type: 'Survey',
      title: 'Pulse Survey Feedback Submission',
      description: description || 'Regular Pulse Survey completed',
      department: 'Technology',
      ratings: surveyRatings
    } as any);
    setSuccessId(subId);
  };

  const simulateFileUpload = (fileName: string) => {
    setEvidenceName(fileName);
  };

  if (successId) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-lg text-center animate-pulse-soft">
        <span className="p-3 bg-emerald-50 text-emerald-600 rounded-full inline-flex mb-4">
          <FileCheck className="w-8 h-8" />
        </span>
        <h3 className="font-display font-bold text-xl text-slate-800">Feedback Analyzed & Routed</h3>
        <p className="text-slate-500 text-xs mt-2 px-4 leading-relaxed">
          ResolveAI smart engine has indexed your submission, compiled objective corroborating logs, and routed the issue directly to the department executive.
        </p>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left border border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Record Reference</span>
            <span className="font-mono text-blue-600 font-bold">{successId}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-2">
            <span className="font-semibold text-slate-700">Routing Target</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
              {dept === 'Technology' ? 'CTO Dashboard' : 'COO Dashboard'}
            </span>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleFormReset}
            className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Submit Another
          </button>
          <button
            onClick={() => navigate(`/employee/submission/${successId}`)}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/10"
          >
            View Details
          </button>
        </div>
      </div>
    );
  }

  if (activeForm === 'feedback') {
    return (
      <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-lg">General Workspace Feedback</h3>
            <p className="text-slate-400 text-xs mt-0.5">Share general feedback about team workflows, facilities, or collaboration patterns.</p>
          </div>
          <button onClick={handleFormReset} className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer">Cancel</button>
        </div>
        
        <form onSubmit={(e) => handleFormSubmit(e, 'Feedback')} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value as any)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Technology">Technology</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Submission Title</label>
              <input
                type="text"
                placeholder="Summarize your feedback"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Detailed Description</label>
            <textarea
              rows={4}
              required
              placeholder="Please provide specific, constructive context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Upload Supporting File (Optional)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-all relative">
              <input
                type="file"
                id="file-feedback"
                className="hidden"
                onChange={(e) => simulateFileUpload(e.target.files?.[0]?.name || 'document_upload.pdf')}
              />
              <label htmlFor="file-feedback" className="cursor-pointer block">
                <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-medium text-blue-600 block">
                  {evidenceName ? `Attached: ${evidenceName}` : 'Click to select files (PDF, image)'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Maximum size: 10MB</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md shadow-blue-500/10"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    );
  }

  if (activeForm === 'concern') {
    return (
      <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-lg">Raise Team Blocker or Concern</h3>
            <p className="text-slate-400 text-xs mt-0.5">Report chronic work issues, scheduling errors, or tool barriers.</p>
          </div>
          <button onClick={handleFormReset} className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer">Cancel</button>
        </div>

        <form onSubmit={(e) => handleFormSubmit(e, 'Concern')} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value as any)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Technology">Technology</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Concern Title</label>
              <input
                type="text"
                placeholder="What is causing the blocker?"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Description & Bottleneck Details</label>
            <textarea
              rows={4}
              required
              placeholder="Describe the issue, frequency, and impact on team productivity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Upload Screenshot</label>
              <div className="border border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition-all relative">
                <input
                  type="file"
                  id="img-upload"
                  className="hidden"
                  onChange={(e) => simulateFileUpload(e.target.files?.[0]?.name || 'screenshot.png')}
                />
                <label htmlFor="img-upload" className="cursor-pointer block text-xs">
                  <span className="text-blue-600 font-semibold">{evidenceName || 'Select image'}</span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Upload PDF</label>
              <div className="border border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition-all relative">
                <input
                  type="file"
                  id="pdf-upload"
                  className="hidden"
                  onChange={(e) => simulateFileUpload(e.target.files?.[0]?.name || 'report.pdf')}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer block text-xs">
                  <span className="text-blue-600 font-semibold">{evidenceName || 'Select PDF'}</span>
                </label>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md shadow-blue-500/10"
          >
            Submit Concern
          </button>
        </form>
      </div>
    );
  }

  if (activeForm === 'suggestion') {
    return (
      <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-lg">Suggest a Workspace Solution</h3>
            <p className="text-slate-400 text-xs mt-0.5">Submit proactive ideas to optimize workflows, tools, or culture.</p>
          </div>
          <button onClick={handleFormReset} className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer">Cancel</button>
        </div>

        <form onSubmit={(e) => handleFormSubmit(e, 'Suggestion')} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value as any)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Technology">Technology</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Suggestion Title</label>
              <input
                type="text"
                placeholder="What is your suggestion?"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Proposed Idea Details</label>
            <textarea
              rows={4}
              required
              placeholder="What are the details of this improvement? How would it work?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Expected Benefits & Outcomes</label>
            <input
              type="text"
              placeholder="e.g. Save 5 hours weekly, reduce code integration errors"
              required
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md shadow-blue-500/10"
          >
            Submit Suggestion
          </button>
        </form>
      </div>
    );
  }

  if (activeForm === 'survey') {
    const surveyQuestions = [
      { id: 'communication', q: 'How satisfied are you with department communication updates?' },
      { id: 'growth', q: 'How satisfied are you with career growth pathways and goals?' },
      { id: 'managerSupport', q: 'How satisfied are you with manager support and alignment?' },
      { id: 'environment', q: 'How satisfied are you with your general work environment?' },
      { id: 'recognition', q: 'How satisfied are you with performance recognition & incentives?' },
      { id: 'workLifeBalance', q: 'How satisfied are you with your workload and work-life balance?' }
    ];

    const currentQuestion = surveyQuestions[surveyStep - 1];

    const setRating = (val: number) => {
      setSurveyRatings(prev => ({
        ...prev,
        [currentQuestion.id]: val
      }));
    };

    return (
      <div className="max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">Multi-Step Pulse Survey</span>
            <p className="text-slate-400 text-xs mt-1">Provide satisfaction insights anonymously to help identify team friction points.</p>
          </div>
          <button onClick={handleFormReset} className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer">Cancel</button>
        </div>

        {/* Stepper indicators */}
        <div className="flex gap-1.5 mb-8">
          {surveyQuestions.map((_, idx) => (
            <div key={idx} className={`h-1 flex-1 rounded-full ${idx + 1 <= surveyStep ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
          ))}
          <div className={`h-1 flex-1 rounded-full ${surveyStep > 6 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
        </div>

        {surveyStep <= 6 ? (
          <div className="space-y-6">
            <h4 className="font-display font-medium text-slate-800 text-base">{currentQuestion.q}</h4>
            
            {/* Rating Buttons 1-5 */}
            <div className="flex justify-between gap-2 max-w-sm mx-auto">
              {[1, 2, 3, 4, 5].map((num) => {
                const active = (surveyRatings as any)[currentQuestion.id] === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`w-12 h-12 rounded-full border text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700 scale-105 shadow-sm'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-between max-w-sm mx-auto text-[10px] text-slate-400 font-bold uppercase">
              <span>Very Unsatisfied</span>
              <span>Highly Satisfied</span>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between">
              <button
                disabled={surveyStep === 1}
                onClick={() => setSurveyStep(prev => prev - 1)}
                className="py-1.5 px-4 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setSurveyStep(prev => prev + 1)}
                className="py-1.5 px-6 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSurveySubmit} className="space-y-4">
            <h4 className="font-display font-medium text-slate-800 text-base">Additional Comments</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-light">
              Add any additional notes about your score ratings, manager actions, or team bottlenecks.
            </p>
            <textarea
              rows={3}
              placeholder="Your comments (completely anonymous)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setSurveyStep(6)}
                className="py-1.5 px-4 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="py-1.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Submit Survey
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-[-10%] top-[-20%] w-56 h-56 rounded-full bg-blue-500/10 blur-xl"></div>
        <h2 className="font-display font-bold text-xl text-white m-0">What would you like to share today?</h2>
        <p className="text-blue-200 text-xs mt-1.5 leading-relaxed font-light max-w-lg">
          ResolveAI transforms your logs and qualitative context into high-impact accountability actions. Your suggestions and blockers are instantly processed with automated corroboration checks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            type: 'feedback',
            title: 'General Feedback',
            desc: 'General workspace, environment and alignment experiences.',
            color: 'border-blue-100 hover:border-blue-300 hover:bg-blue-50/10'
          },
          {
            type: 'concern',
            title: 'Report Concern',
            desc: 'Friction or blockers affecting tools, code, databases, or scheduling.',
            color: 'border-amber-100 hover:border-amber-300 hover:bg-amber-50/10'
          },
          {
            type: 'suggestion',
            title: 'Solution Suggestion',
            desc: 'Propose direct workflow suggestions or automation opportunities.',
            color: 'border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/10'
          },
          {
            type: 'survey',
            title: 'Engagement Survey',
            desc: 'Fill out standard anonymous department ratings.',
            color: 'border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/10'
          }
        ].map((c, i) => (
          <button
            key={i}
            onClick={() => setActiveForm(c.type)}
            className={`p-5 bg-white border rounded-2xl text-left hover:shadow-md transition-all group flex flex-col justify-between h-40 cursor-pointer ${c.color}`}
          >
            <div className="flex justify-between items-start w-full">
              <span className={`p-2 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-white group-hover:scale-105 transition-all`}>
                {c.type === 'feedback' && <FileText className="w-5 h-5 text-blue-600" />}
                {c.type === 'concern' && <AlertOctagon className="w-5 h-5 text-amber-600" />}
                {c.type === 'suggestion' && <Lightbulb className="w-5 h-5 text-emerald-600" />}
                {c.type === 'survey' && <TrendingUp className="w-5 h-5 text-indigo-600" />}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-slate-800 text-sm">{c.title}</h4>
              <p className="text-slate-500 text-xs mt-1 leading-normal font-light">{c.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. My Submissions Table
const EmployeeSubmissions: React.FC = () => {
  const { submissions } = useResolve();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Your Submission Records</h2>
        <p className="text-slate-500 text-sm mt-1">Review the status of your reported feedback items and check AI-computed evidence correlations.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Submission ID / Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">AI Category</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Evidence Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-light">
                    No submissions logged. Use the "Engagement Hub" to share your first record.
                  </td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-3.5 px-4 font-medium max-w-xs">
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
                    <td className="py-3.5 px-4 text-slate-600">{sub.department}</td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[140px]">{sub.aiCategory}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        sub.priority === 'Critical' ? 'bg-red-900/10 text-red-700' :
                        sub.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {sub.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-semibold text-slate-800">{sub.evidenceScore}%</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
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
                        onClick={() => navigate(`/employee/submission/${sub.id}`)}
                        className="py-1 px-2.5 border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-lg font-semibold text-[11px] transition-all cursor-pointer"
                      >
                        Details
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

// 4. Submission Details View with Verification dialog
const SubmissionDetails: React.FC = () => {
  const { id } = useParams();
  const { submissions, submitEmployeeVerification, managers } = useResolve();
  const navigate = useNavigate();

  const sub = submissions.find(s => s.id === id);

  // Verification popup form states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [rating, setRating] = useState<'Yes' | 'Partially' | 'No'>('Yes');
  const [comments, setComments] = useState('');
  const [score, setScore] = useState(5);

  if (!sub) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h4 className="font-semibold text-slate-800">Submission Not Found</h4>
        <p className="text-xs text-slate-400 mt-1">Please verify the submission reference ID.</p>
        <button onClick={() => navigate('/employee/submissions')} className="mt-4 py-1.5 px-4 bg-blue-600 text-white text-xs font-semibold rounded-lg cursor-pointer">
          Back to List
        </button>
      </div>
    );
  }

  const assignedManager = managers.find(m => m.id === sub.assignedManagerId);

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEmployeeVerification(sub.id, rating, score, comments);
    setShowVerificationModal(false);
    setComments('');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-2">
        <Link to="/employee/submissions" className="text-xs text-slate-400 hover:text-slate-600 font-semibold">Submissions</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-xs text-slate-600 font-medium font-mono">{sub.id}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 m-0">{sub.title}</h2>
          <div className="flex items-center gap-2.5 mt-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{sub.date}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">{sub.aiCategory}</span>
            <span>•</span>
            <span className="font-semibold text-blue-600">{sub.department} Department</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            sub.status === 'Pending Review' ? 'bg-slate-100 text-slate-600' :
            sub.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
            sub.status === 'Resolved' ? 'bg-blue-100 text-blue-700 animate-pulse-soft' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {sub.status}
          </span>
          {sub.status === 'Resolved' && (
            <button
              onClick={() => setShowVerificationModal(true)}
              className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 cursor-pointer transition-all"
            >
              Verify Improvement
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Submission Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Original Submission</h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{sub.description}</p>
            
            {sub.expectedBenefits && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Expected Outcomes</span>
                <p className="text-slate-600 text-xs mt-1 m-0">{sub.expectedBenefits}</p>
              </div>
            )}

            {sub.evidenceFiles && sub.evidenceFiles.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Attached Files</span>
                <div className="flex gap-2">
                  {sub.evidenceFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-600 font-medium">{file.name}</span>
                      <span className="text-[10px] text-slate-400">({file.size})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Complaint Intelligence Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>AI Complaint Intelligence Analysis</span>
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed font-light mb-4">{sub.intelligenceSummary}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification</span>
                <span className="text-xs font-bold text-slate-800 block mt-1 truncate">{sub.aiCategory}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Exec</span>
                <span className="text-xs font-bold text-slate-800 block mt-1">{sub.assignedExecutive}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority Level</span>
                <span className="text-xs font-bold text-slate-800 block mt-1">{sub.priority}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Confidence</span>
                <span className="text-xs font-bold text-slate-800 block mt-1">{sub.confidence}%</span>
              </div>
            </div>
          </div>

          {/* Action Plan Details if active */}
          {sub.actionPlan && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Plan Execution</h3>
                <span className="text-xs font-bold text-slate-600">Progress: {sub.actionPlan.progress}%</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800">{sub.actionPlan.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed mt-1 font-light">{sub.actionPlan.description}</p>
              
              <div className="mt-4 space-y-2">
                <span className="text-xs font-bold text-slate-500 block mb-2">Checklist Tracking</span>
                {sub.actionPlan.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <span className={`p-0.5 rounded-full ${item.completed ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300'}`}>
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </span>
                    <span className={item.completed ? 'text-slate-400 line-through' : 'text-slate-600'}>{item.text}</span>
                  </div>
                ))}
              </div>

              {sub.actionPlan.completedAt && (
                <div className="mt-4 p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700">Resolution Evidence Logged</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-light leading-relaxed">{sub.actionPlan.completionNotes}</p>
                  {sub.actionPlan.proofFileName && (
                    <div className="mt-2 text-[10px] text-blue-700 flex items-center gap-1 font-semibold">
                      <Paperclip className="w-3 h-3" />
                      <span>Proof Attached: {sub.actionPlan.proofFileName}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Verification Audit Result */}
          {sub.verification && (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">Employee Verification Audit</h3>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl border border-emerald-100 text-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold block">改善 Rating</span>
                  <span className="text-xs font-bold text-emerald-700 block mt-0.5">{sub.verification.improvementRating}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-600 italic">"{sub.verification.comments}"</p>
                  <div className="flex gap-1 items-center mt-2 text-[10px] text-slate-400 font-medium">
                    <span>Audit Score: {sub.verification.score}/5</span>
                    <span>•</span>
                    <span>Verified on {sub.verification.date}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Evidence Intel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Evidence Intelligence Score</span>
            </h3>
            
            <div className="flex items-center gap-4 mb-4">
              <CircularProgress percentage={sub.evidenceScore} />
              <div>
                <span className="text-xs font-semibold text-slate-700">Corroboration Rating</span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-light">Evidence strongly supports this submission based on cross-referenced systems.</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Systems Audit Logs</span>
              {sub.evidenceBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-slate-600 font-light leading-normal">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Manager & Timeline Assigned Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Assigned Personnel</span>
              <div className="flex items-center gap-2.5">
                <img
                  src={assignedManager ? assignedManager.avatar : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                  alt="manager"
                  className="w-10 h-10 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">{assignedManager ? assignedManager.name : 'Pending Executive Review'}</h4>
                  <p className="text-[10px] text-slate-400">{assignedManager ? assignedManager.role : 'Awaiting Assignment'}</p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Lifecycle Timeline</span>
              <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-4 text-xs">
                <div className="relative">
                  <span className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <div className="font-semibold text-slate-800">Feedback Submitted</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{sub.date}</p>
                </div>
                {sub.actionPlan && (
                  <div className="relative">
                    <span className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <div className="font-semibold text-slate-800">Action Assigned to Manager</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sub.actionPlan.deadline}</p>
                  </div>
                )}
                {sub.status === 'Resolved' && (
                  <div className="relative">
                    <span className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <div className="font-semibold text-slate-800">Resolution Completed</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sub.actionPlan?.completedAt}</p>
                  </div>
                )}
                {sub.verification && (
                  <div className="relative">
                    <span className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <div className="font-semibold text-slate-800">Employee Verified Complete</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sub.verification.date}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal Popup */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-pulse-soft">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-lg">Verify Improvement</h3>
              <p className="text-slate-400 text-xs mt-0.5">Please confirm whether the organizational improvement measures implemented actually resolved the bottleneck.</p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Did you notice improvement?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Yes', 'Partially', 'No'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`py-2 px-3 border rounded-xl text-xs font-semibold text-center cursor-pointer transition-all ${
                        rating === r
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Rate the Resolution Quality (1-5)</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setScore(num)}
                      className={`w-9 h-9 rounded-full border text-xs font-bold flex items-center justify-center cursor-pointer transition-all ${
                        score === num
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Audit Comments / Verification Proof Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details on whether the changes are effective..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Verify Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Employee Notifications
const EmployeeNotifications: React.FC = () => {
  const { notifications } = useResolve();
  const empNotifs = notifications.filter(n => n.role === 'Employee');

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Engagement Notifications</h2>
        <p className="text-slate-500 text-sm mt-1">Check alerts on routed feedback status or pending resolution audits.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {empNotifs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-light text-xs">
              No recent notifications logged.
            </div>
          ) : (
            empNotifs.map(n => (
              <div key={n.id} className={`p-4 flex gap-3 hover:bg-slate-50/50 transition-all ${!n.read ? 'bg-blue-50/5' : ''}`}>
                <span className={`p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center ${
                  !n.read ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Bell className="w-4.5 h-4.5" />
                </span>
                <div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold text-xs text-slate-800">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-1 leading-normal font-light">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// 6. Employee Profile
const EmployeeProfile: React.FC = () => {
  const { currentUserName, currentUserDept, currentUserAvatar } = useResolve();

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 m-0">Your Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Review employee configuration credentials and default routing departments.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUserAvatar}
            alt={currentUserName}
            className="w-16 h-16 rounded-full border border-slate-200 object-cover"
          />
          <div>
            <h3 className="font-display font-bold text-lg text-slate-800">{currentUserName}</h3>
            <p className="text-xs text-slate-400 font-semibold">Senior Software Engineer</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex justify-between">
            <span className="font-semibold text-slate-500">Employee ID Reference</span>
            <span className="font-mono text-slate-800">EMP-2026-CH</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-semibold text-slate-500">Routing Division</span>
            <span className="text-slate-800">{currentUserDept}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-semibold text-slate-500">Primary Administrator</span>
            <span className="text-slate-800">Dr. Aris Thorne (CTO)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 7. Interactive Floating AI Assistant Widget
const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    { sender: 'user', text: 'My manager never schedules one-on-one meetings.', time: '10:00 AM' },
    { sender: 'ai', text: 'Thank you for sharing this. To help us build a clear evidence rating:\n\n1. How long has this been happening?\n2. Can you give an example of the last scheduled target meeting?\n3. Do you have any supporting screenshots or calendar evidence?', time: '10:00 AM' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [typing, setTyping] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    setInputVal('');
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setTyping(true);

    // Simulate AI follow up
    setTimeout(() => {
      setTyping(false);
      let replyText = "Understood. I have verified this record against internal calendar schedules. Outlook logs confirm zero 1-on-1 entries in the past 90 days. I have compiled this audit context (Evidence Score: 91%) and queued a suggestion folder to routing. You can complete submission inside the 'Raise Concern' form.";
      
      if (userText.toLowerCase().includes('database') || userText.toLowerCase().includes('staging')) {
        replyText = "Analyzing staging database records... System logs confirm 14 lockouts this month. This correlates with high team deployment bottlenecks. Evidence Score: 89%. Routing package prepared for the CTO.";
      }
      
      setMessages(prev => [...prev, { sender: 'ai', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1200);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/20 z-50 cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:scale-105"
      >
        <Sparkles className="w-5 h-5 animate-pulse-soft" />
        <span className="text-xs font-bold pr-1">AI Assistant</span>
      </button>

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[480px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-pulse-soft">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-blue-600 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 fill-current text-white" />
              </span>
              <div>
                <span className="font-display font-semibold text-xs block">AI smart advisor</span>
                <span className="text-[9px] text-slate-400">Supporting evidence analyzer</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-xs text-slate-400 hover:text-white font-semibold cursor-pointer">Close</button>
          </div>

          {/* Messages History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 no-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none font-medium' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none font-light shadow-sm'
                }`}>
                  <p className="whitespace-pre-line m-0">{m.text}</p>
                  <span className={`text-[8px] mt-1 block text-right ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{m.time}</span>
                </div>
              </div>
            ))}
            
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-400 rounded-bl-none flex items-center gap-1.5 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[10px] font-medium">Smart engine analyzing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              placeholder="Ask AI follow-ups or verify evidence..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center cursor-pointer">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
