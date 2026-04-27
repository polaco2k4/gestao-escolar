import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { paginate, buildPaginationMeta } from '../../utils/helpers';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';

export class ComunicacaoService {
  async listMessages(userId: string, page = 1, limit = 20, user?: AuthPayload) {
    const { offset } = paginate(page, limit);
    let query = db('message_recipients as mr')
      .join('messages as m', 'm.id', 'mr.message_id')
      .join('users as u', 'u.id', 'm.sender_id');
    
    query = applySchoolFilter(query, user, 'm');
    
    const messages = await query
      .select('m.*', 'u.first_name as sender_first_name', 'u.last_name as sender_last_name', 'mr.read_at')
      .where('mr.recipient_id', userId)
      .whereNull('mr.deleted_at')
      .orderBy('m.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db('message_recipients')
      .where('recipient_id', userId)
      .whereNull('deleted_at')
      .count('id as count');

    return { messages, meta: buildPaginationMeta(Number(count), page, limit) };
  }

  async getMessageById(id: string, userId: string, user?: AuthPayload) {
    const message = await db('messages as m')
      .join('users as u', 'u.id', 'm.sender_id')
      .select('m.*', 'u.first_name as sender_first_name', 'u.last_name as sender_last_name')
      .where('m.id', id)
      .first();

    if (!message) throw new AppError('Mensagem não encontrada', 404);
    
    if (user && !canAccessSchool(user, message.school_id)) {
      throw new AppError('Sem permissão', 403);
    }

    await db('message_recipients')
      .where({ message_id: id, recipient_id: userId })
      .whereNull('read_at')
      .update({ read_at: new Date() });

    const recipients = await db('message_recipients as mr')
      .join('users as u', 'u.id', 'mr.recipient_id')
      .select('u.first_name', 'u.last_name', 'mr.read_at')
      .where('mr.message_id', id);

    return { ...message, recipients };
  }

  async sendMessage(senderId: string, data: { subject: string; body: string; recipient_ids: string[]; priority?: string; school_id?: string }, user?: AuthPayload) {
    const schoolId = user?.role === 'admin' ? data.school_id : user?.school_id;
    if (!schoolId) throw new AppError('Escola não especificada', 400);
    
    return db.transaction(async (trx: any) => {
      const [message] = await trx('messages')
        .insert({
          school_id: schoolId,
          sender_id: senderId,
          subject: data.subject,
          body: data.body,
          priority: data.priority || 'normal',
        })
        .returning('*');

      const recipients = data.recipient_ids.map((recipientId) => ({
        message_id: message.id,
        recipient_id: recipientId,
      }));

      await trx('message_recipients').insert(recipients);

      const notifications = data.recipient_ids.map((recipientId) => ({
        school_id: schoolId,
        user_id: recipientId,
        title: `Nova mensagem: ${data.subject}`,
        body: data.body.substring(0, 200),
        type: 'info',
        channel: 'in_app',
      }));

      await trx('notifications').insert(notifications);

      return message;
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    await db('message_recipients')
      .where({ message_id: messageId, recipient_id: userId })
      .update({ deleted_at: new Date() });
  }

  async listNotifications(userId: string, page = 1, limit = 20, user?: AuthPayload) {
    const { offset } = paginate(page, limit);
    let query = db('notifications').where('user_id', userId);
    
    query = applySchoolFilter(query, user);
    
    const notifications = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db('notifications').where('user_id', userId).count('id as count');
    const [{ unread }] = await db('notifications').where({ user_id: userId, read: false }).count('id as unread');

    return {
      notifications,
      unread_count: Number(unread),
      meta: buildPaginationMeta(Number(count), page, limit),
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const [updated] = await db('notifications')
      .where({ id: notificationId, user_id: userId })
      .update({ read: true, read_at: new Date() })
      .returning('*');
    if (!updated) throw new AppError('Notificação não encontrada', 404);
    return updated;
  }

  async markAllAsRead(userId: string) {
    await db('notifications')
      .where({ user_id: userId, read: false })
      .update({ read: true, read_at: new Date() });
  }
}
