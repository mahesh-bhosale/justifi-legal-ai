import { Kafka, type Consumer, type KafkaConfig, logLevel, type Producer } from 'kafkajs';
import { randomUUID } from 'crypto';

type KafkaTopic =
  | 'case-message-created'
  | 'case-message-read'
  | 'notification-created';

export type BaseEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: string;
  eventType: string;
  timestamp: string; // ISODate
  actorId: string;
  caseId: string;
  payload: TPayload;
};

export function buildEvent<TPayload extends Record<string, unknown>>(params: {
  eventType: string;
  actorId: string;
  caseId: string | number;
  payload: TPayload;
}): BaseEvent<TPayload> {
  return {
    eventId: randomUUID(),
    eventType: params.eventType,
    timestamp: new Date().toISOString(),
    actorId: params.actorId,
    caseId: String(params.caseId),
    payload: params.payload,
  };
}

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let consumer: Consumer | null = null;
let isConnected = false;

function getKafkaConfig(): KafkaConfig {
  const clientId = process.env.KAFKA_CLIENT_ID || 'justifi-legal-ai';
  const broker = process.env.KAFKA_BROKER || 'localhost:9092';

  return {
    clientId,
    brokers: [broker],
    logLevel: process.env.NODE_ENV === 'development' ? logLevel.INFO : logLevel.ERROR,
  };
}

export async function connectKafka(): Promise<void> {
  if (isConnected) return;

  kafka = new Kafka(getKafkaConfig());
  producer = kafka.producer();

  const groupId = process.env.KAFKA_GROUP_ID || 'justifi-backend-group';
  consumer = kafka.consumer({ groupId });

  await producer.connect();
  await consumer.connect();

  isConnected = true;
  console.log('✅ Kafka connected');
}

export async function publishEvent(topic: KafkaTopic, event: BaseEvent): Promise<void> {
  if (!producer || !isConnected) return;

  await producer.send({
    topic,
    messages: [
      {
        key: event.caseId,
        value: JSON.stringify(event),
        headers: {
          eventType: event.eventType,
          eventId: event.eventId,
        },
      },
    ],
  });
}

export function getKafkaConsumer(): Consumer | null {
  return consumer;
}

export async function startConsumers(): Promise<void> {
  // Consumers are started by importing/starting from dedicated consumer modules.
  const { startMessageEventsConsumer } = await import('./message-events.consumer');
  await startMessageEventsConsumer();
}

