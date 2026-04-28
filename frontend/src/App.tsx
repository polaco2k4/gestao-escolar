import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
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
import Avaliacoes from './pages/Avaliacoes';
import AvaliacaoForm from './pages/AvaliacaoForm';
import AvaliacaoNotas from './pages/AvaliacaoNotas';
import AssessmentTypes from './pages/AssessmentTypes';
import AssessmentTypeForm from './pages/AssessmentTypeForm';
import Subjects from './pages/Subjects';
import SubjectForm from './pages/SubjectForm';
import Teachers from './pages/Teachers';
import TeacherForm from './pages/TeacherForm';
import Courses from './pages/Courses';
import CourseForm from './pages/CourseForm';
import Financeiro from './pages/Financeiro';
import Horarios from './pages/Horarios';
import Comunicacao from './pages/Comunicacao';
import Salas from './pages/Salas';
import Assiduidade from './pages/Assiduidade';
import Documentos from './pages/Documentos';
import Encarregados from './pages/Encarregados';
import EncarregadoForm from './pages/EncarregadoForm';
import MeusEducandos from './pages/MeusEducandos';
import AdminDashboard from './pages/AdminDashboard';
import Licencas from './pages/Licencas';
import LicencaForm from './pages/LicencaForm';
import LicencaUso from './pages/LicencaUso';
import LicencaPlanos from './pages/LicencaPlanos';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminDashboard /></RoleProtectedRoute>} />
            <Route path="licencas" element={<RoleProtectedRoute allowedRoles={['admin']}><Licencas /></RoleProtectedRoute>} />
            <Route path="licencas/nova" element={<RoleProtectedRoute allowedRoles={['admin']}><LicencaForm /></RoleProtectedRoute>} />
            <Route path="licencas/planos" element={<RoleProtectedRoute allowedRoles={['admin']}><LicencaPlanos /></RoleProtectedRoute>} />
            <Route path="licencas/:id/editar" element={<RoleProtectedRoute allowedRoles={['admin']}><LicencaForm /></RoleProtectedRoute>} />
            <Route path="licencas/:id/uso" element={<RoleProtectedRoute allowedRoles={['admin']}><LicencaUso /></RoleProtectedRoute>} />
            <Route path="matriculas" element={<Matriculas />} />
            <Route path="matriculas/nova" element={<MatriculaForm />} />
            <Route path="matriculas/:id" element={<MatriculaDetail />} />
            <Route path="matriculas/:id/editar" element={<MatriculaForm />} />
            <Route path="estudantes" element={<Estudantes />} />
            <Route path="estudantes/novo" element={<RoleProtectedRoute allowedRoles={['admin', 'gestor']}><EstudanteForm /></RoleProtectedRoute>} />
            <Route path="estudantes/:id" element={<EstudanteDetail />} />
            <Route path="estudantes/:id/editar" element={<RoleProtectedRoute allowedRoles={['admin', 'gestor']}><EstudanteForm /></RoleProtectedRoute>} />
            <Route path="escolas" element={<RoleProtectedRoute allowedRoles={['admin']}><Escolas /></RoleProtectedRoute>} />
            <Route path="escolas/novo" element={<RoleProtectedRoute allowedRoles={['admin']}><EscolaForm /></RoleProtectedRoute>} />
            <Route path="escolas/:id/editar" element={<RoleProtectedRoute allowedRoles={['admin']}><EscolaForm /></RoleProtectedRoute>} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/novo" element={<CourseForm />} />
            <Route path="courses/:id/editar" element={<CourseForm />} />
            <Route path="turmas" element={<Turmas />} />
            <Route path="turmas/novo" element={<TurmaForm />} />
            <Route path="turmas/:id/editar" element={<TurmaForm />} />
            <Route path="turmas/:id/estudantes" element={<TurmaEstudantes />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="subjects/novo" element={<SubjectForm />} />
            <Route path="subjects/:id/editar" element={<SubjectForm />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="teachers/novo" element={<TeacherForm />} />
            <Route path="teachers/:id/editar" element={<TeacherForm />} />
            <Route path="assessment-types" element={<AssessmentTypes />} />
            <Route path="assessment-types/novo" element={<AssessmentTypeForm />} />
            <Route path="assessment-types/:id/editar" element={<AssessmentTypeForm />} />
            <Route path="avaliacoes" element={<Avaliacoes />} />
            <Route path="avaliacoes/novo" element={<AvaliacaoForm />} />
            <Route path="avaliacoes/:id/editar" element={<AvaliacaoForm />} />
            <Route path="avaliacoes/:id/notas" element={<AvaliacaoNotas />} />
            <Route path="horarios" element={<Horarios />} />
            <Route path="salas" element={<Salas />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="comunicacao" element={<Comunicacao />} />
            <Route path="assiduidade" element={<Assiduidade />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="meus-educandos" element={<MeusEducandos />} />
            <Route path="encarregados" element={<Encarregados />} />
            <Route path="encarregados/novo" element={<EncarregadoForm />} />
            <Route path="encarregados/:id/editar" element={<EncarregadoForm />} />
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
