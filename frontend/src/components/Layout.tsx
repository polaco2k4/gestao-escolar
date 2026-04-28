import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useMemo } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  MessageSquare,
  ClipboardList,
  FileText,
  BarChart,
  LogOut,
  Menu,
  X,
  School,
  UsersRound,
  Book,
  UserCheck,
  ClipboardCheck,
  MapPin,
  Briefcase,
  Shield,
  Key,
  CreditCard,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { useAcademicYearStatus } from '../hooks/useAcademicYearStatus';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const yearStatus = useAcademicYearStatus();

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Redirect non-admin users away from dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard' && user?.role !== 'admin' && user?.role !== 'gestor') {
      if (user?.role === 'estudante') {
        navigate('/subjects');
      } else if (user?.role === 'professor') {
        navigate('/turmas');
      } else if (user?.role === 'encarregado') {
        navigate('/meus-educandos');
      }
    }
  }, [location.pathname, user?.role, navigate]);

  const navigationGroups = [
    {
      label: 'Principal',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'gestor'] },
        { name: 'Painel Admin', href: '/admin', icon: Shield, roles: ['admin'] },
      ],
    },
    {
      label: 'Administração',
      items: [
        { name: 'Escolas', href: '/escolas', icon: School, roles: ['admin'] },
        { name: 'Licenças', href: '/licencas', icon: Key, roles: ['admin'] },
        { name: 'Planos', href: '/licencas/planos', icon: CreditCard, roles: ['admin'] },
      ],
    },
    {
      label: 'Académico',
      items: [
        { name: 'Anos Lectivos', href: '/anos-lectivos', icon: Calendar, roles: ['admin', 'gestor'] },
        { name: 'Cursos', href: '/courses', icon: Briefcase, roles: ['admin', 'gestor'] },
        { name: 'Turmas', href: '/turmas', icon: UsersRound, roles: ['admin', 'gestor', 'professor'] },
        { name: 'Disciplinas', href: '/subjects', icon: Book, roles: ['admin', 'gestor', 'professor', 'estudante', 'encarregado'] },
        { name: 'Professores', href: '/teachers', icon: UserCheck, roles: ['admin', 'gestor'] },
        { name: 'Salas', href: '/salas', icon: MapPin, roles: ['admin', 'gestor'] },
        { name: 'Horários', href: '/horarios', icon: Calendar, roles: ['admin', 'gestor', 'professor', 'estudante', 'encarregado'] },
      ],
    },
    {
      label: 'Alunos & Famílias',
      items: [
        { name: 'Matrículas', href: '/matriculas', icon: GraduationCap, roles: ['admin', 'gestor'] },
        { name: 'Estudantes', href: '/estudantes', icon: Users, roles: ['admin', 'gestor', 'professor'] },
        { name: 'Meus Educandos', href: '/meus-educandos', icon: Users, roles: ['encarregado'] },
        { name: 'Encarregados', href: '/encarregados', icon: Users, roles: ['admin', 'gestor'] },
      ],
    },
    {
      label: 'Avaliação & Assiduidade',
      items: [
        { name: 'Tipos de Avaliação', href: '/assessment-types', icon: ClipboardCheck, roles: ['admin', 'gestor'] },
        { name: 'Avaliações', href: '/avaliacoes', icon: FileText, roles: ['admin', 'gestor', 'professor', 'estudante', 'encarregado'] },
        { name: 'Assiduidade', href: '/assiduidade', icon: ClipboardList, roles: ['admin', 'gestor', 'professor', 'estudante', 'encarregado'] },
      ],
    },
    {
      label: 'Gestão & Comunicação',
      items: [
        { name: 'Financeiro', href: '/financeiro', icon: DollarSign, roles: ['admin', 'gestor', 'encarregado'] },
        { name: 'Documentos', href: '/documentos', icon: BookOpen, roles: ['admin', 'gestor', 'professor', 'estudante', 'encarregado'] },
        { name: 'Comunicação', href: '/comunicacao', icon: MessageSquare, roles: ['admin', 'gestor', 'professor', 'estudante', 'encarregado'] },
        { name: 'Relatórios', href: '/relatorios', icon: BarChart, roles: ['admin', 'gestor', 'professor'] },
      ],
    },
  ];

  // Filtrar navegação baseado na role do usuário
  const filteredGroups = useMemo(() => {
    const role = user?.role || '';
    return navigationGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => item.roles.includes(role)),
      }))
      .filter(group => group.items.length > 0);
  }, [user?.role]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Gestão Escolar</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
          {filteredGroups.map((group, groupIndex) => {
            const isCollapsed = collapsedGroups[group.label] ?? false;
            const hasActiveItem = group.items.some(item => isActive(item.href));
            return (
              <div key={group.label} className={groupIndex > 0 ? 'mt-2' : ''}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-4 py-1.5 group cursor-pointer"
                >
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                    hasActiveItem && isCollapsed ? 'text-blue-500' : 'text-gray-400'
                  } group-hover:text-gray-600 transition-colors`}>
                    {group.label}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
                    isCollapsed ? '-rotate-90' : ''
                  }`} />
                </button>
                <div
                  className={`space-y-0.5 overflow-hidden transition-all duration-200 ease-in-out ${
                    isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
                  }`}
                >
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
                        ${isActive(item.href)
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {user?.school_name && (
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-blue-600" />
                <span className="text-base lg:text-lg font-semibold text-gray-900 truncate">
                  {user.school_name}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            {/* Academic Year Alert Badge */}
            {(yearStatus.isExpired || yearStatus.isExpiringSoon) && (
              <button
                onClick={() => navigate('/anos-lectivos')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  yearStatus.alertType === 'error'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
                title={yearStatus.alertMessage}
              >
                <AlertCircle className="w-4 h-4" />
                <span className="hidden md:inline">
                  {yearStatus.isExpired ? 'Ano Expirado' : `${yearStatus.daysUntilEnd} dias`}
                </span>
              </button>
            )}
            
            <span className="text-sm text-gray-600">
              <span className="font-medium capitalize">{user?.role}</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
