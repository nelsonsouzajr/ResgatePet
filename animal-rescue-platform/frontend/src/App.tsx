/**
 * App.tsx
 * Componente raiz da aplicação com roteamento completo da Fase 4.
 * Inclui proteção simples por token para rotas internas.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import DashboardPage from '@/pages/DashboardPage';
import CaseListPage from '@/pages/CaseListPage';
import NewCasePage from '@/pages/NewCasePage';
import CaseDetailPage from '@/pages/CaseDetailPage';
import UpdateCasePage from '@/pages/UpdateCasePage';
import LoginPage from '@/pages/LoginPage';

function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4">
      <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-black text-ink-900">Página não encontrada</h1>
        <p className="mt-2 text-sm text-ink-500">A rota informada não existe no sistema.</p>
        <a href="/dashboard" className="btn-primary mt-5 inline-flex">Ir para Dashboard</a>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute>
              <CaseListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/new"
          element={
            <ProtectedRoute>
              <NewCasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <ProtectedRoute>
              <CaseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:id/edit"
          element={
            <ProtectedRoute>
              <UpdateCasePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
