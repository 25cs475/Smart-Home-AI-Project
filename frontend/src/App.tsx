import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './layouts/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { RoomsPage } from './pages/RoomsPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { FramesPage } from './pages/FramesPage';
import { AIEnginePage } from './pages/AIEnginePage';
import { ConflictsPage } from './pages/ConflictsPage';
import { DevicesPage } from './pages/DevicesPage';
import { SimulationPage } from './pages/SimulationPage';
import { EnergyPage } from './pages/EnergyPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="environment" element={<EnvironmentPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="preferences" element={<PreferencesPage />} />
              <Route path="frames" element={<FramesPage />} />
              <Route path="ai-engine" element={<AIEnginePage />} />
              <Route path="conflicts" element={<ConflictsPage />} />
              <Route path="devices" element={<DevicesPage />} />
              <Route path="simulation" element={<SimulationPage />} />
              <Route path="energy" element={<EnergyPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
