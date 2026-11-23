import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APP_ROUTES } from '@/constants';
import { LoginPage, SignupPage, DashboardPage, ProjectDetailPage } from '@/pages';
import { ProtectedRoute } from '@/components/auth';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={APP_ROUTES.SIGNUP} element={<SignupPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={APP_ROUTES.PROJECT_DETAILS} element={<ProjectDetailPage />} />
        </Route>

        {/* Fallbacks */}
        <Route path={APP_ROUTES.ROOT} element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
};
