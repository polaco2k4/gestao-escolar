import { useAuth } from '../contexts/AuthContext';
import { Users, GraduationCap, BookOpen, DollarSign, Calendar, MessageSquare, FileText, BarChart } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { name: 'Estudantes', value: '5', icon: Users, color: 'bg-blue-500' },
    { name: 'Matrículas', value: '5', icon: GraduationCap, color: 'bg-green-500' },
    { name: 'Professores', value: '3', icon: BookOpen, color: 'bg-purple-500' },
    { name: 'Propinas', value: '15', icon: DollarSign, color: 'bg-yellow-500' },
  ];

  const quickActions = [
    { name: 'Matrículas', icon: GraduationCap, href: '/matriculas', color: 'bg-blue-50 text-blue-600' },
    { name: 'Avaliações', icon: FileText, href: '/avaliacoes', color: 'bg-green-50 text-green-600' },
    { name: 'Horários', icon: Calendar, href: '/horarios', color: 'bg-purple-50 text-purple-600' },
    { name: 'Financeiro', icon: DollarSign, href: '/financeiro', color: 'bg-yellow-50 text-yellow-600' },
    { name: 'Comunicação', icon: MessageSquare, href: '/comunicacao', color: 'bg-pink-50 text-pink-600' },
    { name: 'Relatórios', icon: BarChart, href: '/relatorios', color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.school_name ? (
            <>
              <span className="font-semibold text-blue-600">{user.school_name}</span>
              {' • '}
              Aqui está um resumo do sistema de gestão escolar
            </>
          ) : (
            'Aqui está um resumo do sistema de gestão escolar'
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className={`${action.color} p-4 rounded-lg text-center hover:shadow-md transition group`}
            >
              <action.icon className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium">{action.name}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">5 novos estudantes matriculados</p>
              <p className="text-sm text-gray-500">Hoje</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Sistema configurado com sucesso</p>
              <p className="text-sm text-gray-500">Hoje</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
