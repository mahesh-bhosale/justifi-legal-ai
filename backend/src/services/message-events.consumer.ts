import { getKafkaConsumer } from './kafka.service';
import { notificationDispatch } from './notification-dispatch.service';

type AnyEvent = {
  eventId: string;
  eventType: string;
  timestamp: string;
  actorId: string;
  caseId: string;
  payload: Record<string, unknown>;
};

export async function startMessageEventsConsumer(): Promise<void> {
  const consumer = getKafkaConsumer();
  if (!consumer) return;

  await consumer.subscribe({ topic: 'message-events' });
  await consumer.subscribe({ topic: 'proposal-events' });
  await consumer.subscribe({ topic: 'case-events' });
  await consumer.subscribe({ topic: 'document-events' });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString('utf8')) as AnyEvent;
        console.log('Kafka event received:', event.eventType, 'topic:', topic);

        if (topic === 'message-events' && event.eventType === 'case-message-created') {
          const receiverId = event.payload.receiverId as string;
          const senderId = event.payload.senderId as string;
          const messageId = Number(event.payload.messageId);
          const caseIdNum = Number(event.caseId);
          if (receiverId && senderId && Number.isFinite(messageId) && Number.isFinite(caseIdNum)) {
            await notificationDispatch.notifyNewMessage({
              receiverId,
              caseId: caseIdNum,
              senderId,
              messageId,
              content: String(event.payload.content ?? ''),
            });
          }
          return;
        }

        if (topic === 'proposal-events' && event.eventType === 'lawyer_applied_to_case') {
          const citizenId = event.payload.citizenId as string;
          const lawyerId = event.payload.lawyerId as string;
          const caseId = Number(event.payload.caseId);
          const proposalId = Number(event.payload.proposalId);
          if (citizenId && lawyerId && Number.isFinite(caseId) && Number.isFinite(proposalId)) {
            await notificationDispatch.notifyLawyerApplied({ citizenId, lawyerId, caseId, proposalId });
          }
          return;
        }

        if (topic === 'proposal-events' && event.eventType === 'lawyer_selected') {
          const lawyerId = event.payload.lawyerId as string;
          const citizenId = event.payload.citizenId as string;
          const caseId = Number(event.payload.caseId);
          const proposalId = Number(event.payload.proposalId);
          if (lawyerId && citizenId && Number.isFinite(caseId) && Number.isFinite(proposalId)) {
            await notificationDispatch.notifyLawyerSelected({ lawyerId, citizenId, caseId, proposalId });
          }
          return;
        }

        if (topic === 'case-events' && event.eventType === 'case_closed') {
          const caseIdNum = Number(event.payload.caseId) || Number(event.caseId);
          if (Number.isFinite(caseIdNum)) {
            await notificationDispatch.notifyCaseClosed({
              caseId: caseIdNum,
              updatedBy: event.actorId,
            });
          }
          return;
        }

        if (topic === 'case-events' && event.eventType === 'case_created') {
          const preferredLawyerId = event.payload.preferredLawyerId as string | null | undefined;
          const caseIdNum = Number(event.payload.caseId);
          const citizenId = String(event.payload.citizenId ?? '');
          if (preferredLawyerId && Number.isFinite(caseIdNum) && citizenId) {
            await notificationDispatch.notifyPreferredLawyerNewRequest({
              preferredLawyerId,
              caseId: caseIdNum,
              citizenId,
            });
          }
          return;
        }

        if (topic === 'case-events' && event.eventType === 'case_updated') {
          const caseIdNum = Number(event.payload.caseId) || Number(event.caseId);
          const updatedByRole = String(event.payload.updatedByRole ?? '');
          if (Number.isFinite(caseIdNum) && updatedByRole) {
            await notificationDispatch.notifyCaseParticipantUpdate({
              caseId: caseIdNum,
              updatedByRole,
              previousStatus: String(event.payload.previousStatus ?? ''),
              newStatus: String(event.payload.newStatus ?? ''),
              updatedBy: event.actorId,
            });
          }
          return;
        }

        if (topic === 'document-events' && event.eventType === 'document_uploaded') {
          const caseIdNum = Number(event.payload.caseId) || Number(event.caseId);
          const citizenId = event.payload.citizenId as string;
          const lawyerId = (event.payload.lawyerId as string | null | undefined) ?? null;
          const uploadedBy = event.payload.uploadedBy as string;
          const documentId = Number(event.payload.documentId);
          const fileName = String(event.payload.fileName ?? '');
          if (
            Number.isFinite(caseIdNum) &&
            citizenId &&
            uploadedBy &&
            Number.isFinite(documentId)
          ) {
            await notificationDispatch.notifyDocumentUploaded({
              caseId: caseIdNum,
              citizenId,
              lawyerId,
              uploadedBy,
              documentId,
              fileName,
            });
          }
          return;
        }

        if (topic === 'case-events' && event.eventType === 'new_case_posted') {
          const category = String(event.payload.category || '').trim();
          const caseIdNum = Number(event.payload.caseId) || Number(event.caseId);
          const location = event.payload.location ? String(event.payload.location) : null;
          if (category && Number.isFinite(caseIdNum)) {
            await notificationDispatch.notifyMatchingLawyersNewOpenCase({
              caseId: caseIdNum,
              category,
              location,
            });
          }
        }
      } catch (err) {
        console.error('Kafka consumer error:', err);
      }
    },
  });
}
