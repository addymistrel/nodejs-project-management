import React from 'react';
import { useAuth } from '@/context';
import { AUTH_MESSAGES } from '@/constants';
import { Button } from './Button';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            PM
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight">Project Management</span>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-medium text-zinc-900">{user.name}</span>
              <span className="text-xs text-zinc-500">{user.email}</span>
            </div>
            <Button variant="secondary" onClick={logout} className="text-xs py-1.5 px-3">
              {AUTH_MESSAGES.LOGOUT_BUTTON}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
