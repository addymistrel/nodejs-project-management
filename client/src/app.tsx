import React from 'react';
import { AuthProvider } from '@/context';
import { AppRoutes } from '@/routes';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
