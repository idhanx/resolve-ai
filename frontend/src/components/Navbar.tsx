import React, { useState } from 'react';
import { useResolve } from '../ResolveContext';
import { Bell, Search, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const {
    currentUserRole,
    currentUserName,
    currentUserAvatar,
    currentUserDept,
    notifications,
    markNotificationsAsRead,
    logout
  } = useResolve();
  
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Filter notifications for active role
  const activeNotifications = notifications.filter(n => n.role === currentUserRole);
  const unreadCount = activeNotifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    markNotificationsAsRead(currentUserRole);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Search records, action items, intelligence scores..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Action Items Navbar */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="text-xs font-semibold text-slate-800">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {activeNotifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No notifications for {currentUserRole}
                  </div>
                ) : (
                  activeNotifications.map(n => (
                    <div key={n.id} className={`p-3 text-xs transition-all hover:bg-slate-50 ${!n.read ? 'bg-blue-50/20 font-medium' : ''}`}>
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-slate-600 leading-normal">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition-all text-left cursor-pointer"
          >
            <img
              src={currentUserAvatar}
              alt={currentUserName}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{currentUserName}</div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {currentUserRole === 'CTO' || currentUserRole === 'COO' || currentUserRole === 'CEO'
                  ? 'Executive'
                  : currentUserRole === 'Manager'
                  ? 'Department Manager'
                  : 'Employee'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{currentUserName}</p>
                <p className="text-[10px] text-slate-400">{currentUserDept} Department</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  void logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
