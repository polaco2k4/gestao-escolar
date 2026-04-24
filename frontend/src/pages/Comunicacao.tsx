import { useState, useEffect } from 'react';
import { Mail, Send, Trash2, Bell, Check, AlertCircle, Plus, X, Users } from 'lucide-react';
import comunicacaoService from '../services/comunicacao.service';
import studentsService from '../services/students.service';
import teachersService from '../services/teachers.service';
import type { Message, Notification, SendMessageData } from '../services/comunicacao.service';

type Tab = 'messages' | 'notifications';

export default function Comunicacao() {
  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showMessageDetail, setShowMessageDetail] = useState(false);

  const [users, setUsers] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [formData, setFormData] = useState<SendMessageData>({
    subject: '',
    body: '',
    recipient_ids: [],
    priority: 'normal',
    school_id: '',
  });

  useEffect(() => {
    loadData();
    loadUsers();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'messages') {
        const data = await comunicacaoService.listMessages();
        setMessages(data.messages || []);
      } else {
        const data = await comunicacaoService.listNotifications();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const [studentsResponse, teachersData] = await Promise.all([
        studentsService.list(),
        teachersService.list(),
      ]);

      const studentsData = studentsResponse.students || [];
      const usersList = [
        ...studentsData.map((s: any) => ({
          id: s.user_id,
          name: `${s.first_name} ${s.last_name} (Estudante)`,
          type: 'student',
        })),
        ...teachersData.map((t: any) => ({
          id: t.user_id,
          name: `${t.first_name} ${t.last_name} (Professor)`,
          type: 'teacher',
        })),
      ];
      setUsers(usersList);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const schoolId = localStorage.getItem('school_id') || '';
      await comunicacaoService.sendMessage({ ...formData, school_id: schoolId });
      setShowNewMessage(false);
      setFormData({
        subject: '',
        body: '',
        recipient_ids: [],
        priority: 'normal',
        school_id: '',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta mensagem?')) return;
    try {
      await comunicacaoService.deleteMessage(id);
      loadData();
    } catch (error) {
      console.error('Erro ao eliminar mensagem:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await comunicacaoService.markAsRead(id);
      loadData();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await comunicacaoService.markAllAsRead();
      loadData();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const handleViewMessage = async (message: Message) => {
    try {
      const fullMessage = await comunicacaoService.getMessageById(message.id);
      setSelectedMessage(fullMessage);
      setShowMessageDetail(true);
    } catch (error) {
      console.error('Erro ao carregar mensagem:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-PT');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comunicação</h1>
          <p className="mt-2 text-sm text-gray-700">Mensagens e notificações</p>
        </div>
        {activeTab === 'messages' && (
          <button
            onClick={() => setShowNewMessage(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Mensagem
          </button>
        )}
        {activeTab === 'notifications' && unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Check className="h-5 w-5 mr-2" />
            Marcar Todas como Lidas
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('messages')}
              className={`${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
            >
              <Mail className="h-5 w-5 mr-2" />
              Mensagens
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center relative`}
            >
              <Bell className="h-5 w-5 mr-2" />
              Notificações
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'messages' ? (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma mensagem</h3>
                  <p className="mt-1 text-sm text-gray-500">Comece enviando uma nova mensagem</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
                      !message.read_at ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                    onClick={() => handleViewMessage(message)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">{message.subject}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          De: {message.sender_first_name} {message.sender_last_name}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{message.body}</p>
                        <p className="mt-2 text-xs text-gray-400">{formatDate(message.created_at)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message.id);
                        }}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma notificação</h3>
                  <p className="mt-1 text-sm text-gray-500">Você não tem notificações no momento</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{notification.body}</p>
                        <p className="mt-2 text-xs text-gray-400">{formatDate(notification.created_at)}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="ml-4 text-blue-600 hover:text-blue-800"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showNewMessage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Nova Mensagem</h3>
              <button onClick={() => setShowNewMessage(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assunto</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Destinatários</label>
                <select
                  multiple
                  value={formData.recipient_ids}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipient_ids: Array.from(e.target.selectedOptions, (option) => option.value),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  size={6}
                  required
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Mantenha Ctrl/Cmd pressionado para selecionar múltiplos</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mensagem</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={6}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewMessage(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMessageDetail && selectedMessage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{selectedMessage.subject}</h3>
              <button onClick={() => setShowMessageDetail(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  De: {selectedMessage.sender_first_name} {selectedMessage.sender_last_name}
                </p>
                <p className="text-sm text-gray-500">{formatDate(selectedMessage.created_at)}</p>
                <span className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                  {selectedMessage.priority}
                </span>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.body}</p>
              </div>
              {selectedMessage.recipients && selectedMessage.recipients.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Destinatários ({selectedMessage.recipients.length})
                  </h4>
                  <ul className="space-y-1">
                    {selectedMessage.recipients.map((recipient, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <span>
                          {recipient.first_name} {recipient.last_name}
                        </span>
                        {recipient.read_at && (
                          <span className="ml-2 text-xs text-green-600">
                            (Lida em {formatDate(recipient.read_at)})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
