import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  MapPin
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'professor', 'estudante', 'encarregado'] },
    { name: 'Escolas', href: '/escolas', icon: School, roles: ['admin'] },
    { name: 'Turmas', href: '/turmas', icon: UsersRound, roles: ['admin', 'professor'] },
    { name: 'Matrículas', href: '/matriculas', icon: GraduationCap, roles: ['admin'] },
    { name: 'Estudantes', href: '/estudantes', icon: Users, roles: ['admin', 'professor'] },
    { name: 'Meus Educandos', href: '/meus-educandos', icon: Users, roles: ['encarregado'] },
    { name: 'Disciplinas', href: '/subjects', icon: Book, roles: ['admin', 'professor', 'estudante', 'encarregado'] },
    { name: 'Professores', href: '/teachers', icon: UserCheck, roles: ['admin'] },
    { name: 'Encarregados', href: '/encarregados', icon: Users, roles: ['admin'] },
    { name: 'Tipos de Avaliação', href: '/assessment-types', icon: ClipboardCheck, roles: ['admin'] },
    { name: 'Avaliações', href: '/avaliacoes', icon: FileText, roles: ['admin', 'professor', 'estudante', 'encarregado'] },
    { name: 'Horários', href: '/horarios', icon: Calendar, roles: ['admin', 'professor', 'estudante', 'encarregado'] },
    { name: 'Salas', href: '/salas', icon: MapPin, roles: ['admin'] },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign, roles: ['admin', 'encarregado'] },
    { name: 'Comunicação', href: '/comunicacao', icon: MessageSquare, roles: ['admin', 'professor', 'estudante', 'encarregado'] },
    { name: 'Assiduidade', href: '/assiduidade', icon: ClipboardList, roles: ['admin', 'professor', 'estudante', 'encarregado'] },
    { name: 'Documentos', href: '/documentos', icon: BookOpen, roles: ['admin', 'professor', 'estudante', 'encarregado'] },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart, roles: ['admin', 'professor'] },
  ];

  // Filtrar navegação baseado na role do usuário
  const navigation = allNavigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

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

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${isActive(item.href)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
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
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
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
