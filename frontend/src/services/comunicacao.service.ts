import api from '../config/api';

export interface Message {
  id: string;
  school_id: string;
  sender_id: string;
  subject: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sender_first_name?: string;
  sender_last_name?: string;
  read_at?: string;
  created_at: string;
  recipients?: MessageRecipient[];
}

export interface MessageRecipient {
  first_name: string;
  last_name: string;
  read_at?: string;
}

export interface Notification {
  id: string;
  school_id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  channel: 'email' | 'sms' | 'in_app';
  read: boolean;
  read_at?: string;
  created_at: string;
}

export interface SendMessageData {
  subject: string;
  body: string;
  recipient_ids: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  school_id: string;
}

class ComunicacaoService {
  async listMessages(page = 1, limit = 20): Promise<{ messages: Message[]; meta: any }> {
    const response = await api.get('/comunicacao/messages', { params: { page, limit } });
    return response.data.data;
  }

  async getMessageById(id: string): Promise<Message> {
    const response = await api.get(`/comunicacao/messages/${id}`);
    return response.data.data;
  }

  async sendMessage(data: SendMessageData): Promise<Message> {
    const response = await api.post('/comunicacao/messages', data);
    return response.data.data;
  }

  async deleteMessage(id: string): Promise<void> {
    await api.delete(`/comunicacao/messages/${id}`);
  }

  async listNotifications(page = 1, limit = 20): Promise<{ notifications: Notification[]; unread_count: number; meta: any }> {
    const response = await api.get('/comunicacao/notifications', { params: { page, limit } });
    return response.data.data;
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put(`/comunicacao/notifications/${id}/read`);
    return response.data.data;
  }

  async markAllAsRead(): Promise<void> {
    await api.put('/comunicacao/notifications/read-all');
  }
}

export default new ComunicacaoService();
