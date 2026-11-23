import React from 'react';
import { useAuth } from '@/context';
import { Header, Card } from '@/components/common';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            Welcome back, {user?.name ?? 'User'} 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your projects, files, and background zip tasks.
          </p>
        </div>

        <Card>
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-zinc-900">Projects Section Ready</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-1">
              Authentication is fully functional. In the next branch (feat/client-projects-crud), project CRUD capabilities will be plugged in here.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};
