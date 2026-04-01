import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Role } from '@prisma/client';

/**
 * Normalize participant order so the lexicographically smaller ID is always participantA.
 * This prevents duplicate conversations between the same two users.
 */
function normalizeParticipants(userAId: string, userBId: string): [string, string] {
  return userAId < userBId ? [userAId, userBId] : [userBId, userAId];
}

const participantSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
};

export async function getOrCreateConversation(userAId: string, userBId: string) {
  const [participantA, participantB] = normalizeParticipants(userAId, userBId);

  const conversation = await prisma.conversation.upsert({
    where: {
      participantA_participantB: { participantA, participantB },
    },
    create: { participantA, participantB },
    update: {},
    include: {
      userA: { select: participantSelect },
      userB: { select: participantSelect },
    },
  });

  logger.info('Conversation retrieved or created', { conversationId: conversation.id, participantA, participantB });
  return conversation;
}

export async function listConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participantA: userId },
        { participantB: userId },
      ],
    },
    include: {
      userA: { select: participantSelect },
      userB: { select: participantSelect },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          readAt: true,
        },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  // Add unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          readAt: null,
        },
      });

      const otherUser = conv.participantA === userId ? conv.userB : conv.userA;
      const lastMessage = conv.messages[0] ?? null;

      return {
        id: conv.id,
        otherUser,
        lastMessage,
        unreadCount,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      };
    })
  );

  return conversationsWithUnread;
}

export async function getMessages(
  conversationId: string,
  userId: string,
  cursor?: string,
  limit: number = 50
) {
  // Verify the user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (conversation.participantA !== userId && conversation.participantB !== userId) {
    throw new Error('Forbidden: Not a participant');
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      sender: { select: participantSelect },
    },
  });

  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return { messages: items, hasMore, nextCursor };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  attachment?: { url: string; name: string; type: string }
) {
  // Verify conversation exists and sender is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (conversation.participantA !== senderId && conversation.participantB !== senderId) {
    throw new Error('Forbidden: Not a participant');
  }

  const recipientId = conversation.participantA === senderId
    ? conversation.participantB
    : conversation.participantA;

  // Create message and update conversation timestamp in a transaction
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        attachmentUrl: attachment?.url,
        attachmentName: attachment?.name,
        attachmentType: attachment?.type,
      },
      include: {
        sender: { select: participantSelect },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
    prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'new_message',
        title: 'New message',
        message: content.length > 100 ? content.substring(0, 100) + '...' : content,
        link: `/messages?conversation=${conversationId}`,
      },
    }),
  ]);

  logger.info('Message sent', { conversationId, senderId, messageId: message.id });
  return message;
}

export async function markAsRead(conversationId: string, userId: string) {
  // Verify participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (conversation.participantA !== userId && conversation.participantB !== userId) {
    throw new Error('Forbidden: Not a participant');
  }

  const updated = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  // Also mark related notifications as read
  await prisma.notification.updateMany({
    where: {
      userId,
      type: 'new_message',
      link: { contains: conversationId },
      read: false,
    },
    data: { read: true },
  });

  logger.info('Messages marked as read', { conversationId, userId, count: updated.count });
  return updated.count;
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.message.count({
    where: {
      conversation: {
        OR: [
          { participantA: userId },
          { participantB: userId },
        ],
      },
      senderId: { not: userId },
      readAt: null,
    },
  });

  return count;
}

export async function getContactableUsers(userId: string, userRole: Role) {
  switch (userRole) {
    case 'ADMIN':
      // Admins can message anyone except themselves
      return prisma.user.findMany({
        where: { id: { not: userId } },
        select: participantSelect,
        orderBy: { name: 'asc' },
      });

    case 'INSTRUCTOR': {
      // Instructors can message: students in their courses, other instructors, admins
      const enrolledStudentIds = await prisma.enrollment.findMany({
        where: {
          course: { instructorId: userId },
          status: 'ACTIVE',
        },
        select: { userId: true },
      });
      const studentIds = [...new Set(enrolledStudentIds.map((e) => e.userId))];

      return prisma.user.findMany({
        where: {
          id: { not: userId },
          OR: [
            { id: { in: studentIds } },
            { role: 'INSTRUCTOR' },
            { role: 'ADMIN' },
          ],
        },
        select: participantSelect,
        orderBy: { name: 'asc' },
      });
    }

    case 'STUDENT':
      // Students can message: any instructor, any admin
      return prisma.user.findMany({
        where: {
          id: { not: userId },
          role: { in: ['INSTRUCTOR', 'ADMIN'] },
        },
        select: participantSelect,
        orderBy: { name: 'asc' },
      });

    default:
      return [];
  }
}

export async function canUserContact(userId: string, userRole: Role, targetUserId: string): Promise<boolean> {
  const contacts = await getContactableUsers(userId, userRole);
  return contacts.some((c) => c.id === targetUserId);
}

export async function getNotifications(userId: string, limit: number = 10) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markNotificationsRead(userId: string, notificationIds?: string[]) {
  const where = notificationIds
    ? { userId, id: { in: notificationIds }, read: false }
    : { userId, read: false };

  return prisma.notification.updateMany({
    where,
    data: { read: true },
  });
}
