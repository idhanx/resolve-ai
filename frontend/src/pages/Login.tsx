import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResolve } from '../ResolveContext';
import type { UserRole } from '../ResolveContext';
import { Sparkles, Shield, RefreshCw, Lock, Mail, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { setCurrentUserRole } = useResolve();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('Employee');
  const [employeeId, setEmployeeId] = useState('EMP-2026-CH');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  // Quick credentials dictionary
  const roleCredentials: Record<UserRole, { id: string; name: string }> = {
    Employee: { id: 'EMP-2026-CH', name: 'Sarah Chen (Tech Senior Engineer)' },
    Manager: { id: 'MGR-2026-RO', name: 'Sophia Rodriguez (Tech Manager)' },
    CTO: { id: 'EXEC-2026-TH', name: 'Dr. Aris Thorne (CTO - Technology)' },
    COO: { id: 'EXEC-2026-ST', name: 'Marcus Sterling (COO - Operations)' },
    CEO: { id: 'EXEC-2026-VA', name: 'Victoria Vance (CEO - Enterprise)' }
  };

  const handleRoleSelection = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setEmployeeId(roleCredentials[selectedRole].id);
    setPassword('password');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setCurrentUserRole(role);

      // Redirect depending on role
      if (role === 'Employee') navigate('/employee/dashboard');
      else if (role === 'Manager') navigate('/manager/dashboard');
      else if (role === 'CTO') navigate('/cto/dashboard');
      else if (role === 'COO') navigate('/coo/dashboard');
      else if (role === 'CEO') navigate('/ceo/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Left Pane - Branding & Premium Design */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative flex-col justify-between p-12 overflow-hidden select-none">
        {/* Dynamic mesh gradient backdrops */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-700/20 blur-[120px] animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/15 blur-[100px]"></div>

        {/* Branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white tracking-wide m-0 leading-none">ResolveAI</h1>
            <p className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase m-0 mt-0.5">Enterprise Platform</p>
          </div>
        </div>

        {/* Hero Concept Content */}
        <div className="my-auto max-w-lg relative z-10">
          <h2 className="font-display font-extrabold text-4xl leading-tight text-white m-0">
            Transforming feedback <br />
            into organizational <span className="text-blue-500">accountability.</span>
          </h2>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed font-light">
            ResolveAI goes beyond basic survey feedback. We close the loop by leveraging machine learning classification, automated department routing, and direct employee verification of solutions.
          </p>

          {/* SaaS Concept Illustration */}
          <div className="mt-8 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-300">Evidence Intelligence Radar</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400 text-[10px] font-bold border border-blue-800/50">
                Verified
              </span>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span className="text-slate-400">92% System Corroborated Evidence Match</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span className="text-slate-400">Automated Routing to Department Heads</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span className="text-slate-400">Resolution Checklist Completed by Managers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 relative z-10">
          © 2026 ResolveAI Technologies, Inc. All rights reserved. Professional Grade.
        </div>
      </div>

      {/* Right Pane - Form & Switcher */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">ResolveAI</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/40 p-8">
            <div className="mb-6">
              <h3 className="font-display font-bold text-2xl text-slate-900 m-0">Sign In</h3>
              <p className="text-slate-400 text-xs mt-1">Access your organizational accountability dashboard</p>
            </div>

            {/* Quick Simulation Select */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Select Simulation Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Employee', 'Manager', 'CTO'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelection(r)}
                    className={`py-2 px-3 border rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      role === r
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/5'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r === 'CTO' ? 'CTO (Tech)' : r}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['COO', 'CEO'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelection(r)}
                    className={`py-2 px-3 border rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      role === r
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/5'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r === 'COO' ? 'COO (Ops)' : r}
                  </button>
                ))}
              </div>
              
              {/* Selected User Hint */}
              <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-500 border border-slate-100 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin-hover" />
                <span>Simulating: <strong className="text-slate-700">{roleCredentials[role].name}</strong></span>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Employee ID</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 block">Password</label>
                  <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot?</a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 disabled:opacity-80"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In as {role}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
