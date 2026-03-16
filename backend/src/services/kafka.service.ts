import { Kafka, type Consumer, type KafkaConfig, logLevel, type Producer, type SASLOptions } from 'kafkajs';
import { randomUUID } from 'crypto';
import fs from 'fs';

type KafkaTopic =
  | 'case-events'
  | 'proposal-events'
  | 'message-events'
  | 'document-events'
  | 'notification-events';

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

  // Aiven typically requires SASL_SSL. Local dev Kafka usually does not.
  const sslEnabled = String(process.env.KAFKA_SSL || '').toLowerCase() === 'true';
  const saslMechanism = (process.env.KAFKA_SASL_MECHANISM || '').toLowerCase();
  const saslUsername = process.env.KAFKA_SASL_USERNAME;
  const saslPassword = process.env.KAFKA_SASL_PASSWORD;

  const maybeSasl: SASLOptions | undefined = (() => {
    if (!saslUsername || !saslPassword) return undefined;
    if (saslMechanism === 'plain') return { mechanism: 'plain', username: saslUsername, password: saslPassword };
    if (saslMechanism === 'scram-sha-256') return { mechanism: 'scram-sha-256', username: saslUsername, password: saslPassword };
    if (saslMechanism === 'scram-sha-512') return { mechanism: 'scram-sha-512', username: saslUsername, password: saslPassword };
    // unsupported/unknown
    return undefined;
  })();

  const ssl =
    sslEnabled
      ? {
          rejectUnauthorized: true,
          ca: process.env.KAFKA_SSL_CA_PATH ? [fs.readFileSync(process.env.KAFKA_SSL_CA_PATH, 'utf8')] : undefined,
          cert: process.env.KAFKA_SSL_CERT_PATH ? fs.readFileSync(process.env.KAFKA_SSL_CERT_PATH, 'utf8') : undefined,
          key: process.env.KAFKA_SSL_KEY_PATH ? fs.readFileSync(process.env.KAFKA_SSL_KEY_PATH, 'utf8') : undefined,
        }
      : undefined;

  return {
    clientId,
    brokers: [broker],
    ssl,
    sasl: maybeSasl,
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

