/**
 * App.tsx
 * Componente raiz da aplicação.
 * Configura o React Router com todas as rotas principais do sistema.
 * As páginas serão implementadas nas fases seguintes;
 * por enquanto exibem placeholders para validar o roteamento.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas (serão implementadas na FASE 4)
// import DashboardPage from '@/pages/DashboardPage';
// import CaseListPage from '@/pages/CaseListPage';
// import NewCasePage from '@/pages/NewCasePage';
// import CaseDetailPage from '@/pages/CaseDetailPage';
// import UpdateCasePage from '@/pages/UpdateCasePage';
// import LoginPage from '@/pages/LoginPage';

// Layout stub temporário para validar o roteamento na Fase 1
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-xl bg-white p-10 shadow-md text-center">
        <h1 className="text-2xl font-bold text-brand mb-2">ResgatePet</h1>
        <p className="text-gray-500">{title} – em desenvolvimento</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota padrão redireciona para o dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rotas principais – componentes reais serão injetados na Fase 4 */}
        <Route path="/dashboard"       element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/cases"           element={<PlaceholderPage title="Lista de Ocorrências" />} />
        <Route path="/cases/new"       element={<PlaceholderPage title="Nova Ocorrência" />} />
        <Route path="/cases/:id"       element={<PlaceholderPage title="Detalhes da Ocorrência" />} />
        <Route path="/cases/:id/edit"  element={<PlaceholderPage title="Atualizar Ocorrência" />} />
        <Route path="/login"           element={<PlaceholderPage title="Login" />} />

        {/* Rota 404 */}
        <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
