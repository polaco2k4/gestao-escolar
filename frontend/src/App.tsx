import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Matriculas from './pages/Matriculas';
import MatriculaForm from './pages/MatriculaForm';
import MatriculaDetail from './pages/MatriculaDetail';
import Estudantes from './pages/Estudantes';
import EstudanteForm from './pages/EstudanteForm';
import EstudanteDetail from './pages/EstudanteDetail';
import Escolas from './pages/Escolas';
import EscolaForm from './pages/EscolaForm';
import Turmas from './pages/Turmas';
import TurmaForm from './pages/TurmaForm';
import TurmaEstudantes from './pages/TurmaEstudantes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="matriculas" element={<Matriculas />} />
            <Route path="matriculas/nova" element={<MatriculaForm />} />
            <Route path="matriculas/:id" element={<MatriculaDetail />} />
            <Route path="matriculas/:id/editar" element={<MatriculaForm />} />
            <Route path="estudantes" element={<Estudantes />} />
            <Route path="estudantes/novo" element={<EstudanteForm />} />
            <Route path="estudantes/:id" element={<EstudanteDetail />} />
            <Route path="estudantes/:id/editar" element={<EstudanteForm />} />
            <Route path="escolas" element={<Escolas />} />
            <Route path="escolas/novo" element={<EscolaForm />} />
            <Route path="escolas/:id/editar" element={<EscolaForm />} />
            <Route path="turmas" element={<Turmas />} />
            <Route path="turmas/novo" element={<TurmaForm />} />
            <Route path="turmas/:id/editar" element={<TurmaForm />} />
            <Route path="turmas/:id/estudantes" element={<TurmaEstudantes />} />
            <Route path="avaliacoes" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Avaliações</h2><p className="text-gray-600 mt-2">Em desenvolvimento</p></div>} />
            <Route path="horarios" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Horários</h2><p className="text-gray-600 mt-2">Em desenvolvimento</p></div>} />
            <Route path="financeiro" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Financeiro</h2><p className="text-gray-600 mt-2">Em desenvolvimento</p></div>} />
            <Route path="comunicacao" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Comunicação</h2><p className="text-gray-600 mt-2">Em desenvolvimento</p></div>} />
            <Route path="assiduidade" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Assiduidade</h2><p className="text-gray-600 mt-2">Em desenvolvimento</p></div>} />
            <Route path="documentos" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Documentos</h2><p className="text-gray-600 mt-2">Em desenvolvimento</p></div>} />
            <Route path="relatorios" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Relatórios</h2><p className="text-gray-600 mt-2">Em desenvolvimento</p></div>} />
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
