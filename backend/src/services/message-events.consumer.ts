import { getKafkaConsumer } from './kafka.service';
import notificationService from './notification.service';
import socketService from './socket.service';

type CaseMessageCreatedEvent = {
  eventId: string;
  eventType: 'case-message-created';
  timestamp: string;
  actorId: string;
  caseId: string;
  payload: {
    messageId: number;
    content: string;
    senderId: string;
    receiverId: string;
  };
};

export async function startMessageEventsConsumer(): Promise<void> {
  const consumer = getKafkaConsumer();
  if (!consumer) return;

  await consumer.subscribe({ topic: 'case-message-created' });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (topic !== 'case-message-created') return;
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString('utf8')) as CaseMessageCreatedEvent;
        if (event.eventType !== 'case-message-created') return;

        const receiverId = event.payload.receiverId;
        const caseIdNum = Number(event.caseId);

        const notification = await notificationService.createNotification({
          userId: receiverId,
          caseId: Number.isFinite(caseIdNum) ? caseIdNum : null,
          type: 'message',
          title: 'New message',
          body: event.payload.content,
          meta: {
            messageId: event.payload.messageId,
            caseId: event.caseId,
            senderId: event.payload.senderId,
          },
        });

        const io = socketService.getIO();
        if (io) {
          io.to(`user:${receiverId}`).emit('notification:new', notification);
        }
      } catch (err) {
        console.error('Kafka consumer error (case-message-created):', err);
      }
    },
  });
}

