import React from 'react';
import { useResolve } from '../ResolveContext';
import type { UserRole } from '../ResolveContext';
import {
  LayoutDashboard,
  MessageSquarePlus,
  Inbox,
  Bell,
  User,
  ClipboardList,
  ShieldCheck,
  MessageCircleCode,
  Users,
  BarChart3,
  Award,
  Building2,
  LineChart,
  Trophy,
  Sparkles,
  LogOut
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { currentUserRole, notifications } = useResolve();
  const navigate = useNavigate();

  // Get unread notification counts to show in sidebar badges
  const unreadCount = notifications.filter(n => n.role === currentUserRole && !n.read).length;

  const getMenuForRole = (role: UserRole): SidebarItem[] => {
    switch (role) {
      case 'Employee':
        return [
          { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
          { label: 'Engagement Hub', path: '/employee/engagement', icon: MessageSquarePlus },
          { label: 'My Submissions', path: '/employee/submissions', icon: Inbox },
          { label: 'Notifications', path: '/employee/notifications', icon: Bell, badge: unreadCount },
          { label: 'Profile', path: '/employee/profile', icon: User }
        ];
      case 'Manager':
        return [
          { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
          { label: 'Assigned Actions', path: '/manager/actions', icon: ClipboardList },
          { label: 'Completed Actions', path: '/manager/completed', icon: ShieldCheck },
          { label: 'Profile', path: '/manager/profile', icon: User }
        ];
      case 'CTO':
        return [
          { label: 'CTO Dashboard', path: '/cto/dashboard', icon: LayoutDashboard },
          { label: 'Incoming Feedback', path: '/cto/feedback', icon: MessageCircleCode, badge: unreadCount },
          { label: 'Technical Managers', path: '/cto/managers', icon: Users },
          { label: 'Analytics Hub', path: '/cto/analytics', icon: BarChart3 },
          { label: 'AI Action Plans', path: '/cto/plans', icon: Award }
        ];
      case 'COO':
        return [
          { label: 'COO Dashboard', path: '/coo/dashboard', icon: LayoutDashboard },
          { label: 'Incoming Feedback', path: '/coo/feedback', icon: MessageCircleCode, badge: unreadCount },
          { label: 'Operations Managers', path: '/coo/managers', icon: Users },
          { label: 'Analytics Hub', path: '/coo/analytics', icon: BarChart3 },
          { label: 'AI Action Plans', path: '/coo/plans', icon: Award }
        ];
      case 'CEO':
        return [
          { label: 'CEO Dashboard', path: '/ceo/dashboard', icon: LayoutDashboard },
          { label: 'Departments Health', path: '/ceo/departments', icon: Building2 },
          { label: 'Company Analytics', path: '/ceo/analytics', icon: LineChart },
          { label: 'Accountability Board', path: '/ceo/board', icon: Trophy }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuForRole(currentUserRole);

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-900 text-slate-300 flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-2.5">
        <div className="p-1.5 bg-blue-600 rounded-lg text-white">
          <Sparkles className="w-5 h-5 fill-current" />
        </div>
        <div>
          <span className="font-display font-bold text-lg text-white leading-none block">ResolveAI</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Enterprise Suite</span>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-800/80">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Logged in as</div>
        <div className="text-sm font-semibold text-white mt-0.5">{currentUserRole}</div>
        <div className="text-[10px] text-slate-400 mt-1">
          {currentUserRole === 'CTO' && 'Technology Division'}
          {currentUserRole === 'COO' && 'Operations Division'}
          {currentUserRole === 'CEO' && 'Enterprise Overview'}
          {currentUserRole === 'Manager' && 'Team Supervisor'}
          {currentUserRole === 'Employee' && 'Individual Contributor'}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
            </div>
            {item.badge && item.badge > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
};
