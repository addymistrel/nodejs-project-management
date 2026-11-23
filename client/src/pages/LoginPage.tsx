import React from 'react';
import { AUTH_MESSAGES } from '@/constants';
import { Card } from '@/components/common';
import { LoginForm } from '@/components/auth';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex w-12 h-12 rounded-xl bg-indigo-600 items-center justify-center text-white font-bold text-lg shadow-sm mb-4">
          PM
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          {AUTH_MESSAGES.LOGIN_TITLE}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{AUTH_MESSAGES.LOGIN_SUBTITLE}</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
};
